#!/usr/bin/env python3
"""Fabrique la version « un seul fichier » du site Argent Clair.

    python3 build.py

Lit argent-clair-site/ (index.html, style.css, script.js, fonts/) et écrit :
  dist/index.html  le site complet : CSS, JavaScript et police inclus
  dist/_headers    les en-têtes de sécurité pour Netlify

La politique de sécurité (CSP) de dist/index.html n'autorise que le CSS et le
JavaScript exacts du site, identifiés par leur empreinte SHA-256. Si quelqu'un
modifie ou injecte du code, le navigateur refuse de l'exécuter. Il faut donc
relancer ce script après chaque modification du site.
"""
import base64
import hashlib
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "argent-clair-site"
DIST = ROOT / "dist"


def read(name):
    return (SRC / name).read_text(encoding="utf-8")


def sha256(text):
    digest = hashlib.sha256(text.encode("utf-8")).digest()
    return "'sha256-" + base64.b64encode(digest).decode() + "'"


def replace_once(text, old, new):
    if text.count(old) != 1:
        raise SystemExit(f"Motif introuvable ou en double : {old[:70]!r}")
    return text.replace(old, new)


def main():
    html, css, js = read("index.html"), read("style.css"), read("script.js")

    # Police intégrée en data: URI (aucune requête réseau)
    for weight in ("500", "800"):
        font = (SRC / "fonts" / f"poppins-{weight}.woff2").read_bytes()
        data = "data:font/woff2;base64," + base64.b64encode(font).decode()
        css = replace_once(css, f'url("fonts/poppins-{weight}.woff2")', f'url("{data}")')

    if "</style" in css or "</script" in js:
        raise SystemExit("Le CSS ou le JS contient une balise fermante interdite.")

    style = "\n" + css.rstrip() + "\n  "
    script = "\n" + js.rstrip() + "\n  "

    csp = (
        "default-src 'none'; "
        f"script-src {sha256(script)}; "
        f"style-src {sha256(style)}; "
        "font-src data:; img-src data:; "
        "base-uri 'none'; form-action 'none'; "
        "require-trusted-types-for 'script'; trusted-types 'none'"
    )

    html, n = re.subn(
        r'<meta http-equiv="Content-Security-Policy" content="[^"]*">',
        f'<meta http-equiv="Content-Security-Policy" content="{csp}">',
        html,
    )
    if n != 1:
        raise SystemExit("Balise CSP introuvable dans index.html")

    html = replace_once(
        html,
        '  <link rel="preload" href="fonts/poppins-800.woff2" as="font" type="font/woff2" crossorigin>\n',
        "",
    )
    html = replace_once(html, '  <link rel="stylesheet" href="style.css">\n', f"  <style>{style}</style>\n")
    html = replace_once(html, '  <script src="script.js" defer></script>\n', "")
    html = replace_once(html, "</body>", f"  <script>{script}</script>\n</body>")

    DIST.mkdir(exist_ok=True)
    (DIST / "index.html").write_text(html, encoding="utf-8")
    shutil.copyfile(SRC / "_headers", DIST / "_headers")
    print(f"OK : dist/index.html ({len(html.encode('utf-8')):,} octets) et dist/_headers")


if __name__ == "__main__":
    main()
