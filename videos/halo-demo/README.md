# HALO — film de marque (démo motion design)

Vidéo verticale 1080×1920, 30 i/s, 24 s, pour une marque **fictive** (néobanque « HALO »).
Tout est généré par du code : image (HTML/CSS 3D rendu image par image) et son (synthèse).

## Fichiers

| Fichier | Rôle |
|---|---|
| `halo-demo.mp4` | La vidéo finale |
| `index.html`, `lib.js` | Page et petit moteur d'animation (tout dépend du numéro d'image) |
| `scenes/s1.js` … `s8.js` | Les scènes, dans l'ordre |
| `scenes/parts.js` | Éléments partagés : anneau, carte bancaire, téléphone |
| `audio.py` | Musique (120 BPM) et effets sonores calés à l'image |
| `render.mjs` | Rendu des images avec Chromium, flou de mouvement par sous-échantillonnage |
| `build.sh` | Reconstruit tout |

## Reconstruire

```bash
npm install
```

```bash
./build.sh
```

Il faut Node, Playwright avec Chromium, `sharp`, Python avec `numpy` et `scipy`, et `ffmpeg`.

## Aperçu d'une image

Ouvrir `index.html#120` dans un navigateur affiche l'image 120.

```bash
node render.mjs sheet 0 719 12
```

Cette commande produit une planche-contact dans `out/sheet.png`.

## Découpage

| Temps | Scène |
|---|---|
| 0–2 s | Accroche, l'anneau se dessine, plongée dans l'anneau |
| 2–4 s | Logo HALO en relief, traversée du « O » |
| 4–8 s | Carte bancaire 3D, « 0 FCFA », fonctionnalités |
| 8–12 s | Téléphone, appli animée, paiement |
| 12–14 s | Grand zoom arrière : le téléphone était dans le « O » de PARTOUT |
| 14–18 s | Quatre tuiles (frais, vitesse, épargne, support) puis vue d'ensemble |
| 18–20 s | Manifeste en relief avec secousses caméra |
| 20–24 s | Logo, slogan, barre de recherche |
