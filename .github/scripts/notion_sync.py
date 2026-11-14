"""
Sincroniza ramas y pull requests de GitHub con las historias de usuario de Notion.

Regla de estados:
  - Se crea una rama con HU-XX en el nombre ....... En progreso
  - PR hacia develop (abierto o fusionado) ........ En revisión
  - PR fusionado hacia main ....................... Hecho
  - PR en borrador o cerrado sin fusionar ......... En progreso

Cómo sabe qué historias mover:
  - Busca códigos tipo HU-35 en el título, la descripción y la rama del PR
    (o en el nombre de la rama recién creada).
  - Si el PR va hacia main (el PR grande de develop), además revisa los PR que
    contiene (los "Merge pull request #80 ...") y toma sus códigos HU-XX.

Si hay SLACK_WEBHOOK_URL, manda a Slack UN mensaje por evento indicando qué
pasó (rama creada, PR abierto, PR fusionado, PR cerrado...) y las historias movidas.
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
# Al crear una rama NO se regresa una tarjeta que ya esté en alguno de estos estados
ESTADOS_QUE_NO_REGRESAN_AL_CREAR_RAMA = {ESTADO_EN_REVISION, ESTADO_HECHO}
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


def esc(t):
    return (t or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def extraer_ids(textos):
    return sorted(
        {m.upper() for t in textos for m in HU_RE.findall(t)} - {"HU-00"},
        key=lambda x: int(x[3:]),
    )


# ----------------------------------------------------------------------------
# Interpretación del evento: qué estado aplicar y cómo describirlo en Slack
# ----------------------------------------------------------------------------
def evento_rama_creada():
    rama = os.environ.get("NEW_BRANCH", "")
    actor = os.environ.get("ACTOR", "")
    url_rama = f"https://github.com/{REPO}/tree/{rama}" if REPO else ""
    encabezado = f":seedling: *Rama creada* `{esc(rama)}`"
    if actor:
        encabezado += f" por *{esc(actor)}*"
    return {
        "estado": ESTADO_EN_PROGRESO,
        "textos": [rama],
        "encabezado": encabezado,
        "url": url_rama,
        "url_texto": "Ver rama",
        "es_creacion_rama": True,
    }


def evento_pull_request():
    accion = os.environ.get("PR_ACTION", "")
    fusionado = os.environ.get("PR_MERGED", "") == "true"
    borrador = os.environ.get("PR_DRAFT", "") == "true"
    url_pr = os.environ.get("PR_URL", "")
    base = os.environ.get("PR_BASE", "")
    rama = os.environ.get("PR_BRANCH", "")
    numero = os.environ.get("PR_NUMBER", "")
    autor = os.environ.get("PR_AUTHOR", "")
    titulo_pr = os.environ.get("PR_TITLE", "")

    textos = [" ".join(os.environ.get(k, "") or "" for k in ("PR_TITLE", "PR_BODY", "PR_BRANCH"))]
    if base == RAMA_FINAL and numero:
        textos += textos_de_prs_contenidos(numero)

    # Estado + descripción del evento
    if accion == "closed":
        if not fusionado:
            estado, icono, que = ESTADO_EN_PROGRESO, ":x:", "Pull request cerrado sin fusionar"
        elif base == RAMA_FINAL:
            estado, icono, que = ESTADO_HECHO, ":white_check_mark:", "Pull request fusionado"
        else:
            estado, icono, que = ESTADO_EN_REVISION, ":twisted_rightwards_arrows:", "Pull request fusionado"
    elif accion == "converted_to_draft":
        estado, icono, que = ESTADO_EN_PROGRESO, ":memo:", "Pull request pasó a borrador"
    elif borrador:
        estado, icono, que = ESTADO_EN_PROGRESO, ":memo:", "Pull request abierto como borrador"
    elif accion == "ready_for_review":
        estado, icono, que = ESTADO_EN_REVISION, ":eyes:", "Pull request listo para revisión"
    elif accion == "reopened":
        estado, icono, que = ESTADO_EN_REVISION, ":arrows_counterclockwise:", "Pull request reabierto"
    else:  # opened
        estado, icono, que = ESTADO_EN_REVISION, ":rocket:", "Pull request abierto"

    encabezado = f"{icono} *{que}* #{esc(numero)}  `{esc(rama)}` → `{esc(base)}`"
    if titulo_pr:
        encabezado += f"\n*{esc(titulo_pr)}*"

    # Descripción del PR (máximo 200 caracteres, en una sola línea)
    cuerpo_pr = " ".join((os.environ.get("PR_BODY") or "").split())
    if cuerpo_pr:
        if len(cuerpo_pr) > 200:
            cuerpo_pr = cuerpo_pr[:200].rsplit(" ", 1)[0] + "…"
        encabezado += f"\n>{esc(cuerpo_pr)}"

    # Datos extra desde la API de GitHub (commits, archivos, quién fusionó)
    info = gh(f"/pulls/{numero}") if numero else None
    personas = f"Autor: *{esc(autor)}*" if autor else ""
    if info and info.get("merged_by"):
        personas += f"  ·  Fusionado por: *{esc(info['merged_by']['login'])}*"
    if personas:
        encabezado += f"\n{personas}"
    if info:
        encabezado += (
            f"\n{info.get('commits', 0)} commits  ·  {info.get('changed_files', 0)} archivos"
            f"  ·  +{info.get('additions', 0)} / −{info.get('deletions', 0)}"
        )

    return {
        "estado": estado,
        "textos": textos,
        "encabezado": encabezado,
        "url": url_pr,
        "url_texto": "Ver pull request",
        "es_creacion_rama": False,
    }


def avisar_slack(evento, movidas):
    """Un solo mensaje por evento con todas las historias movidas."""
    if not SLACK_URL or not movidas:
        return
    lineas = [evento["encabezado"]]
    for nombre, estado, url_notion in movidas:
        linea = f"•  *{esc(nombre)}* pasó a *{esc(estado)}*"
        if url_notion:
            linea += f"  (<{url_notion}|Ver en Notion>)"
        lineas.append(linea)
    if evento["url"]:
        lineas.append(f"<{evento['url']}|{evento['url_texto']}>")
    try:
        r = requests.post(SLACK_URL, json={"text": "\n".join(lineas)}, timeout=15)
        if r.status_code >= 300:
            print("Aviso: Slack respondió", r.status_code, r.text[:200])
    except requests.RequestException as e:
        print("Aviso: no se pudo avisar a Slack:", e)


def main():
    if os.environ.get("EVENT_NAME") == "create":
        evento = evento_rama_creada()
    else:
        evento = evento_pull_request()

    estado = evento["estado"]
    ids = extraer_ids(evento["textos"])
    if not ids:
        print("Este evento no menciona ninguna historia (HU-XX). No hay nada que actualizar.")
        return

    print(f"Estado '{estado}' para: {', '.join(ids)}")

    db = call("GET", f"/databases/{DB_ID}")
    props = db["properties"]
    titulo = next(n for n, p in props.items() if p["type"] == "title")
    prop_estado = next((n for n, p in props.items() if p["type"] == "status"), None)
    prop_url = next((n for n, p in props.items() if p["type"] == "url"), None)

    movidas = []
    for hu in ids:
        res = call("POST", f"/databases/{DB_ID}/query", {
            "filter": {"property": titulo, "title": {"starts_with": hu + " "}},
            "page_size": 1,
        })
        if not res["results"]:
            print(f"No encontré {hu} en el Tablero. Se omite.")
            continue
        pagina = res["results"][0]
        nombre = "".join(t["plain_text"] for t in pagina["properties"][titulo]["title"]) or hu

        estado_actual = None
        if prop_estado:
            st = pagina["properties"].get(prop_estado, {}).get("status")
            estado_actual = st["name"] if st else None

        # Crear una rama nueva no debe regresar una tarjeta que ya avanzó
        if evento["es_creacion_rama"] and estado_actual in ESTADOS_QUE_NO_REGRESAN_AL_CREAR_RAMA:
            print(f"{hu}: ya está en '{estado_actual}', no se regresa a '{estado}'.")
            continue

        cambios = {}
        if prop_estado:
            cambios[prop_estado] = {"status": {"name": estado}}
        # La URL solo se guarda cuando es de un pull request
        if prop_url and evento["url"] and not evento["es_creacion_rama"]:
            cambios[prop_url] = {"url": evento["url"]}
        if not cambios:
            continue

        call("PATCH", f"/pages/{pagina['id']}", {"properties": cambios})
        print(f"{hu}: Estado -> {estado}")
        movidas.append((nombre, estado, pagina.get("url", "")))

    avisar_slack(evento, movidas)


if __name__ == "__main__":
    main()