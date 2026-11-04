# Empire-digital-

## Site Argent Clair

- `argent-clair-site/` : le site (source). `index.html`, `style.css`, `script.js`, la police dans `fonts/`, et `_headers` (en-têtes de sécurité Netlify).
- `build.py` : fabrique `dist/index.html`, le site complet en un seul fichier (CSS, JS et police inclus), avec une politique de sécurité (CSP) à empreintes SHA-256.
- `dist/` : version prête à publier (`index.html` + `_headers`).

Après toute modification du site : `python3 build.py`, puis republier `dist/index.html`.

En ligne : https://thermix.github.io/Empire-digital-/ (branche `gh-pages`).
