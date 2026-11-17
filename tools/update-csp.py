#!/usr/bin/env python3
"""Met à jour la politique de sécurité (CSP) des pages et régénère _headers et vercel.json.

À lancer après toute modification du CSS ou du JavaScript intégrés à une page :

    python3 tools/update-csp.py

La CSP n'autorise que les blocs <style> et <script> dont l'empreinte (sha256) est connue.
Modifier les textes, les liens ou le bloc JSON « animo-config » ne demande pas de relancer ce script.
Pages traitées : index.html, affiliation.html, confidentialite.html, conditions.html, 404.html (si elles existent).
"""
import base64
import hashlib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGES = ["index.html", "affiliation.html", "confidentialite.html", "conditions.html", "404.html"]


def sha256(text: str) -> str:
    return "'sha256-" + base64.b64encode(hashlib.sha256(text.encode("utf-8")).digest()).decode() + "'"


def blocks(html: str):
    # on ignore les commentaires HTML, qui peuvent citer des balises sans en être
    visible = re.sub(r"<!--.*?-->", "", html, flags=re.S)
    styles = re.findall(r"<style>(.*?)</style>", visible, re.S)
    # scripts exécutables : sans attribut src et sans type (donc ni JSON, ni JSON-LD)
    scripts = re.findall(r"<script>(.*?)</script>", visible, re.S)
    return styles, scripts


def csp(style_hashes, script_hashes, for_header: bool, cdn: bool = True) -> str:
    directives = ["default-src 'none'"]
    if script_hashes:
        # l'hôte cdnjs n'est autorisé que sur les pages qui y chargent un script
        directives.append("script-src " + " ".join(script_hashes) + (" https://cdnjs.cloudflare.com" if cdn else ""))
    directives += [
        "style-src " + " ".join(style_hashes) + " https://fonts.googleapis.com",
        "font-src https://fonts.gstatic.com",
        "img-src 'self' data:",
        "media-src 'self'",
        "connect-src 'self'",   # le service de paiement du même site (/api/checkout)
        "object-src 'none'",
        "base-uri 'none'",
        "form-action 'none'",
    ]
    if for_header:
        directives += ["frame-ancestors 'none'", "upgrade-insecure-requests"]
    return "; ".join(directives)


HEADERS = {
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), usb=(), interest-cohort=()",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "same-origin",
}


def main() -> None:
    all_styles, all_scripts, texts = [], [], {}
    for name in PAGES:
        path = ROOT / name
        if not path.exists():
            continue
        html = path.read_text(encoding="utf-8")
        styles, scripts = blocks(html)
        if len(styles) != 1:
            sys.exit("%s : attendu exactement un bloc <style>, trouvé %d" % (name, len(styles)))
        sh = [sha256(s) for s in styles]
        ch = [sha256(s) for s in scripts]
        all_styles += sh
        all_scripts += ch
        meta = csp(sh, ch, for_header=False, cdn="cdnjs.cloudflare.com" in html)
        html, n = re.subn(
            r'(<meta http-equiv="Content-Security-Policy" content=")[^"]*(")',
            lambda m: m.group(1) + meta + m.group(2),
            html,
        )
        if n != 1:
            sys.exit("%s : balise meta Content-Security-Policy introuvable" % name)
        path.write_text(html, encoding="utf-8")
        texts[name] = meta

    header_csp = csp(sorted(set(all_styles)), sorted(set(all_scripts)), for_header=True)
    lines = ["# Généré par tools/update-csp.py (Netlify, Cloudflare Pages)", "/*", "  Content-Security-Policy: " + header_csp]
    lines += ["  %s: %s" % (k, v) for k, v in HEADERS.items()]
    lines += ["", "/*.mp4", "  Cache-Control: public, max-age=31536000, immutable", "", "/*.jpg", "  Cache-Control: public, max-age=31536000, immutable", ""]
    (ROOT / "_headers").write_text("\n".join(lines), encoding="utf-8")

    vercel = {
        "headers": [
            {
                "source": "/(.*)",
                "headers": [{"key": "Content-Security-Policy", "value": header_csp}]
                + [{"key": k, "value": v} for k, v in HEADERS.items()],
            }
        ]
    }
    (ROOT / "vercel.json").write_text(json.dumps(vercel, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print("CSP mise à jour pour :", ", ".join(texts))


if __name__ == "__main__":
    main()
