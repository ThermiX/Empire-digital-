#!/usr/bin/env python3
"""Met à jour la politique de sécurité (CSP) d'index.html et régénère _headers et vercel.json.

À lancer après toute modification du CSS ou du JavaScript intégrés à index.html :

    python3 tools/update-csp.py

La CSP autorise uniquement les blocs <style> et <script> dont l'empreinte (sha256) est connue.
Modifier les textes, les liens ou le bloc JSON « animo-config » ne demande pas de relancer ce script.
"""
import base64
import hashlib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
INDEX = ROOT / "index.html"


def sha256(text: str) -> str:
    return "'sha256-" + base64.b64encode(hashlib.sha256(text.encode("utf-8")).digest()).decode() + "'"


def build_csp(html: str, for_header: bool) -> str:
    # on ignore les commentaires HTML, qui peuvent citer des balises sans en être
    visible = re.sub(r"<!--.*?-->", "", html, flags=re.S)
    styles = re.findall(r"<style>(.*?)</style>", visible, re.S)
    # scripts exécutables : sans attribut src et sans type (donc ni JSON, ni JSON-LD)
    scripts = re.findall(r"<script>(.*?)</script>", visible, re.S)
    if len(styles) != 1:
        sys.exit("Attendu : exactement un bloc <style>, trouvé %d" % len(styles))
    directives = [
        "default-src 'none'",
        "script-src " + " ".join(sha256(s) for s in scripts) + " https://cdnjs.cloudflare.com",
        "style-src " + sha256(styles[0]) + " https://fonts.googleapis.com",
        "font-src https://fonts.gstatic.com",
        "img-src 'self' data:",
        "media-src 'self'",
        "connect-src 'self'",   # le service de paiement du même site (/api/checkout)
        "object-src 'none'",
        "base-uri 'none'",
        "form-action 'none'",
    ]
    if for_header:
        directives.append("frame-ancestors 'none'")
        directives.append("upgrade-insecure-requests")
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
    html = INDEX.read_text(encoding="utf-8")
    meta_csp = build_csp(html, for_header=False)
    html, n = re.subn(
        r'(<meta http-equiv="Content-Security-Policy" content=")[^"]*(")',
        lambda m: m.group(1) + meta_csp + m.group(2),
        html,
    )
    if n != 1:
        sys.exit("Balise meta Content-Security-Policy introuvable")
    INDEX.write_text(html, encoding="utf-8")

    header_csp = build_csp(html, for_header=True)
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
    print("CSP mise à jour :", meta_csp[:120], "...")


if __name__ == "__main__":
    main()
