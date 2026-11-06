"""
Sincroniza un pull request de GitHub con las historias de usuario de Notion.

Regla de estados:
  - PR hacia develop (abierto o fusionado) ........ En revisión
  - PR fusionado hacia main ....................... Hecho
  - PR en borrador o cerrado sin fusionar ......... En progreso

Cómo sabe qué historias mover:
  - Busca códigos tipo HU-35 en el título, la descripción y la rama del PR.
  - Si el PR va hacia main (el PR grande de develop), además revisa los PR que
    contiene (los "Merge pull request #80 ...") y toma sus códigos HU-XX.

Si hay SLACK_WEBHOOK_URL, avisa en Slack por cada historia movida.
"""
import os
import re
import sys
import requests

# --- Ajustes: cámbialos aquí si el equipo decide otra cosa ---
ESTADO_EN_REVISION = "En revisión"
ESTADO_HECHO = "Hecho"
ESTADO_EN_PROGRESO = "En progreso"
RAMA_FINAL = "main"  # un PR fusionado hacia esta rama marca las historias como Hecho
# --------------------------------------------------------------

TOKEN = os.environ["NOTION_TOKEN"]
DB_ID = os.environ["NOTION_DATABASE_ID"]
SLACK_URL = os.environ.get("SLACK_WEBHOOK_URL", "")
GH_TOKEN = os.environ.get("GH_TOKEN", "")
REPO = os.environ.get("GITHUB_REPOSITORY", "")
API = "https://api.notion.com/v1"
HEAD = {
    "Authorization": f"Bearer {TOKEN}",
    "Notion-Version": "2022-06-28",
    "Content-Type": "application/json",
}
HU_RE = re.compile(r"HU-\d+", re.I)


def call(method, path, body=None):
    r = requests.request(method, API + path, headers=HEAD, json=body, timeout=30)
    if r.status_code >= 300:
        print("ERROR", r.status_code, r.text[:400])
        sys.exit(1)
    return r.json()


def gh(path):
    """Consulta la API de GitHub. Si falla, devuelve None (no detiene el proceso)."""
    if not (GH_TOKEN and REPO):
        return None
    try:
        r = requests.get(
            f"https://api.github.com/repos/{REPO}{path}",
            headers={"Authorization": f"Bearer {GH_TOKEN}", "Accept": "application/vnd.github+json"},
            timeout=30,
        )
        return r.json() if r.status_code < 300 else None
    except requests.RequestException:
        return None


def textos_de_prs_contenidos(numero_pr):
    """Para el PR grande hacia main: junta el texto de los PR que contiene."""
    textos = []
    commits = gh(f"/pulls/{numero_pr}/commits?per_page=100") or []
    mensajes = [c["commit"]["message"] for c in commits]
    textos.extend(mensajes)
    numeros = set()
    for m in mensajes:
        hit = re.match(r"Merge pull request #(\d+)", m)
        if hit:
            numeros.add(hit.group(1))
    for n in sorted(numeros):
        pr = gh(f"/pulls/{n}")
        if pr:
            textos.append(" ".join([pr.get("title") or "", pr.get("body") or "", pr["head"]["ref"]]))
    return textos


def avisar_slack(nombre, estado, base, url_pr):
    if not SLACK_URL:
        return
    esc = lambda t: t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    texto = f"*{esc(nombre)}* pasó a *{esc(estado)}*  ·  PR hacia `{esc(base)}`"
    if url_pr:
        texto += f"  ·  <{url_pr}|Ver pull request>"
    try:
        r = requests.post(SLACK_URL, json={"text": texto}, timeout=15)
        if r.status_code >= 300:
            print("Aviso: Slack respondió", r.status_code, r.text[:200])
    except requests.RequestException as e:
        print("Aviso: no se pudo avisar a Slack:", e)


def main():
    accion = os.environ.get("PR_ACTION", "")
    fusionado = os.environ.get("PR_MERGED", "") == "true"
    borrador = os.environ.get("PR_DRAFT", "") == "true"
    url_pr = os.environ.get("PR_URL", "")
    base = os.environ.get("PR_BASE", "")
    numero = os.environ.get("PR_NUMBER", "")

    textos = [" ".join(os.environ.get(k, "") or "" for k in ("PR_TITLE", "PR_BODY", "PR_BRANCH"))]
    if base == RAMA_FINAL and numero:
        textos += textos_de_prs_contenidos(numero)

    ids = sorted(
        {m.upper() for t in textos for m in HU_RE.findall(t)} - {"HU-00"},
        key=lambda x: int(x[3:]),
    )
    if not ids:
        print("Este PR no menciona ninguna historia (HU-XX). No hay nada que actualizar.")
        return

    if accion == "closed":
        if not fusionado:
            estado = ESTADO_EN_PROGRESO
        elif base == RAMA_FINAL:
            estado = ESTADO_HECHO
        else:
            estado = ESTADO_EN_REVISION
    elif borrador or accion == "converted_to_draft":
        estado = ESTADO_EN_PROGRESO
    else:
        estado = ESTADO_EN_REVISION

    print(f"PR hacia '{base}' -> estado '{estado}' para: {', '.join(ids)}")

    db = call("GET", f"/databases/{DB_ID}")
    props = db["properties"]
    titulo = next(n for n, p in props.items() if p["type"] == "title")
    prop_estado = next((n for n, p in props.items() if p["type"] == "status"), None)
    prop_url = next((n for n, p in props.items() if p["type"] == "url"), None)

    for hu in ids:
        res = call("POST", f"/databases/{DB_ID}/query", {
            "filter": {"property": titulo, "title": {"starts_with": hu + " "}},
            "page_size": 1,
        })
        if not res["results"]:
            print(f"No encontré {hu} en el Tablero. Se omite.")
            continue
        cambios = {}
        if prop_estado:
            cambios[prop_estado] = {"status": {"name": estado}}
        if prop_url and url_pr:
            cambios[prop_url] = {"url": url_pr}
        pagina = res["results"][0]
        call("PATCH", f"/pages/{pagina['id']}", {"properties": cambios})
        print(f"{hu}: Estado -> {estado} | PR -> {url_pr}")
        nombre = "".join(t["plain_text"] for t in pagina["properties"][titulo]["title"]) or hu
        avisar_slack(nombre, estado, base, url_pr)


if __name__ == "__main__":
    main()