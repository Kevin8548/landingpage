"""
Sincroniza un pull request de GitHub con las historias de usuario de Notion.

Busca códigos tipo HU-35 en el título, la descripción y el nombre de la rama del PR.
Por cada historia encontrada:
  - guarda el link del PR en la propiedad de tipo URL,
  - cambia el Estado según lo que pasó con el PR.

Estados (cámbialos aquí si tu equipo decide otra cosa):
"""
import os
import re
import sys
import requests

ESTADO_PR_ABIERTO = "En revisión"
ESTADO_PR_FUSIONADO = "Hecho"
ESTADO_PR_CERRADO_SIN_FUSIONAR = "En progreso"
ESTADO_PR_BORRADOR = "En progreso"

TOKEN = os.environ["NOTION_TOKEN"]
DB_ID = os.environ["NOTION_DATABASE_ID"]
API = "https://api.notion.com/v1"
HEAD = {
    "Authorization": f"Bearer {TOKEN}",
    "Notion-Version": "2022-06-28",
    "Content-Type": "application/json",
}


def call(method, path, body=None):
    r = requests.request(method, API + path, headers=HEAD, json=body, timeout=30)
    if r.status_code >= 300:
        print("ERROR", r.status_code, r.text[:400])
        sys.exit(1)
    return r.json()


def main():
    accion = os.environ.get("PR_ACTION", "")
    fusionado = os.environ.get("PR_MERGED", "") == "true"
    borrador = os.environ.get("PR_DRAFT", "") == "true"
    url_pr = os.environ.get("PR_URL", "")
    texto = " ".join(
        os.environ.get(k, "") or "" for k in ("PR_TITLE", "PR_BODY", "PR_BRANCH")
    )

    ids = sorted({m.upper() for m in re.findall(r"HU-\d+", texto, re.I)} - {"HU-00"})
    if not ids:
        print("Este PR no menciona ninguna historia (HU-XX). No hay nada que actualizar.")
        return

    if accion == "closed":
        estado = ESTADO_PR_FUSIONADO if fusionado else ESTADO_PR_CERRADO_SIN_FUSIONAR
    elif borrador or accion == "converted_to_draft":
        estado = ESTADO_PR_BORRADOR
    else:
        estado = ESTADO_PR_ABIERTO

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
        call("PATCH", f"/pages/{res['results'][0]['id']}", {"properties": cambios})
        print(f"{hu}: Estado -> {estado} | PR -> {url_pr}")


if __name__ == "__main__":
    main()