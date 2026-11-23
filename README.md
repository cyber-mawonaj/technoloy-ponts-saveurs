# Le Pont des Saveurs et des Cultures — Kit Pédagogique Cycle 4 (TechnoLOY)

Application web pédagogique **100 % hors ligne (PWA)** pour l’enseignement de la **Technologie au Cycle 4 (`5e`, `4e`, `3e`)**, conçue dans le cadre de la **Fête de la Science 2026 (« Saveur savante »)**.

> **Mission pédagogique** : Concevoir, modéliser, simuler et fabriquer la maquette d’un **pont en forme de pièce montée à 3 étages** reliant les cultures et saveurs du **Kenya** (Kofi) et du **Nigeria** (Abénah), capable de franchir une portée libre de **18 cm** (ou **22 cm** en défi `3e`) et de résister **10 secondes** sous **5 pièces de 1 €**, avec un budget éco-responsable strict (3 feuilles A4, 4 piliers en carton, 40 cm d’adhésif max, sans colle chaude ni cutter).

---

## Sommaire

1. [Fonctionnalités principales](#fonctionnalités-principales)
2. [Stack technique](#stack-technique)
3. [Prérequis & Lancement en local](#prérequis--lancement-en-local)
4. [Déploiement sur son propre serveur en PWA](#déploiement-sur-son-propre-serveur-en-pwa)
   - [Option A — Serveur Linux avec Nginx (Recommandé)](#option-a--serveur-linux-avec-nginx-recommandé)
   - [Option B — Serveur avec Caddy (HTTPS automatique)](#option-b--serveur-avec-caddy-https-automatique)
   - [Option C — Apache2 (`.htaccess`)](#option-c--apache2-htaccess)
   - [Option D — Déploiement Docker (Nginx Alpine)](#option-d--déploiement-docker-nginx-alpine)
   - [Option E — Hébergement statique (Forge Éducation / GitHub Pages / Netlify)](#option-e--hébergement-statique-forge-éducation--github-pages--netlify)
5. [Installation de la PWA sur les postes & tablettes](#installation-de-la-pwa-sur-les-postes--tablettes)
6. [Usage en classe & Gestion des données (RGPD)](#usage-en-classe--gestion-des-données-rgpd)
7. [Structure du projet](#structure-du-projet)

---

## Fonctionnalités principales

L’application est organisée en **7 onglets progressifs** adaptés automatiquement au niveau choisi (`5e`, `4e`, `3e`), avec **thème Sombre / Clair**, **mode EBEP** (accessibilité Dys/TSA, lecture vocale, mode silencieux) et **Mode Prof** (corrigés et collecte de classe) :

1. **Découverte & Maquette 3D PBR**
   - Scène **Three.js PBR** interactive : vue assemblée, vue éclatée, coupe, thermographie de flexion, portée `18 cm` / `22 cm`, thèmes culturels Kenya / Nigeria / Fusion.
   - Simulation gravitaire temps réel avec moteur physique **JoltPhysics.js (WebAssembly)** : chute des 5 pièces de 1 € sur le tablier et détection d’effondrement ou de basculement.
   - Plans techniques vectoriels SVG cotés (vues orthogonales, profils en U, défi `22 cm`).
2. **Conception, Labo Mécanique & Schémas**
   - **Banc d’essai mécanique 10 s & Duel A/B** (feuille plate témoin vs configuration élève) avec paramètres de flexion, torsion latérale et défaut d’alignement des piliers.
   - **Séquenceur de fabrication par blocs** (glisser-déposer + gestion des durées adaptée `5e`/`4e`/`3e`).
   - **Constructeur interactif auto-corrigé (`4e`–`3e`)** propulsé par **Svelte Flow** : câblage de la *Chaîne de transmission des efforts* (avec détection d’intrus) et du *Logigramme du protocole 10 s* (ports `OUI`/`NON` et boucle de re-test).
   - **Logigramme décisionnel temps réel (Cytoscape.js)** avec capture PNG automatique pour la fiche PDF.
3. **Atelier DIY en 7 étapes & Croquis numérique**
   - Démarche guidée complète (Besoin → Croquis sur toile dessinable & recherches Kenya/Nigeria → Choix technique → Fabrication avec chronomètre 45 min → Montage 3 étages → Validation 5 critères → Soutenance orale avec téléprompteur).
4. **Évaluations différenciées `5e` / `4e` / `3e` (`/20`)**
   - Niveaux de maîtrise `N1` à `N4`, calcul automatique du score `/20` et corrigés masquables en Mode Prof.
5. **Comparatifs, Mécanique & Ouverture FabLab**
   - Comparaison des profils et matériaux, schémas des 3 sollicitations mécaniques (flexion, compression, traction) et prolongement découpe laser / impression 3D.
6. **Guide Enseignant & Collecteur de Classe**
   - Checklist de préparation, fiches synthétiques `P1`–`P4` et **collecteur multi-élèves** par import de fichiers `.json` avec export tableur `.csv`.
7. **Bilan (`/9`), Autoévaluation, Grille (`/10`), Quiz & Glossaire**
   - Badges de progression Cycle 4, quiz auto-corrigé filtré par niveau, assistant de dépannage méthodique et glossaire illustré.
- **Exports complets** : Impression A4 dédiée (`@media print` fond blanc / encre noire), génération de **Fiche Élève PDF (jsPDF)** incluant les captures 3D, croquis et logigramme, et sauvegarde/transfert de dossier élève en `.json`.

---

## Stack technique

- **Framework UI** : Svelte 5 (Runes) + TypeScript + Vite 8
- **Style** : Tailwind CSS v4 (Dark / Light mode natif par classe `.dark`)
- **3D & Physique** : Three.js (PBR) + JoltPhysics.js (`WASM`)
- **Diagrammes & Blocs** : `@xyflow/svelte` (Svelte Flow), Cytoscape.js, `svelte-dnd-action`
- **Exports & Hors ligne** : `jsPDF`, `vite-plugin-pwa` (Workbox, précaching JS/CSS/polices locales `@fontsource/*`/WASM)
- **Architecture** : **100 % statique côté client** — aucune base de données ni clé API externe requise pour fonctionner en classe.

---

## Prérequis & Lancement en local

- **Node.js ≥ 20** et **npm** (ou `bun` / `pnpm`).

```bash
# 1. Cloner le dépôt
git clone https://github.com/<votre-compte>/<votre-repo>.git
cd <votre-repo>

# 2. Installer les dépendances
npm install

# 3. Lancer le serveur de développement (port 3000)
npm run dev

# 4. Vérifier le typage TypeScript
npm run lint

# 5. Compiler la version de production PWA (génère le dossier dist/)
npm run build

# 6. Tester le build de production localement (avec Service Worker)
npm run preview -- --port 4173 --host
```

> L’application compilée dans le dossier `dist/` est entièrement autonome : toutes les polices (`DM Sans`, `Plus Jakarta Sans`, `IBM Plex Mono`), icônes et le moteur physique `.wasm` sont embarqués localement.

---

## Déploiement sur son propre serveur en PWA

Pour qu’une **PWA (Progressive Web App)** soit installable et fonctionne hors ligne, **3 conditions serveur** doivent être respectées :

1. **HTTPS obligatoire** (certificat TLS/Let’s Encrypt — exception faite de `http://localhost` en test local).
2. **Type MIME WebAssembly actif** (`application/wasm` pour les fichiers `.wasm` de JoltPhysics).
3. **Politique de cache adaptée** : pas de cache agressif sur `index.html`, `sw.js` et `manifest.webmanifest` afin que les mises à jour soient détectées immédiatement par la bannière PWA intégrée.

Après avoir exécuté `npm run build`, il suffit de transférer le contenu du dossier **`dist/`** sur votre serveur (par ex. `/var/www/pont-saveurs`).

---

### Option A — Serveur Linux avec Nginx (Recommandé)

1. Copiez les fichiers compilés sur le serveur :

```bash
npm run build
rsync -avz --delete dist/ utilisateur@mon-serveur:/var/www/pont-saveurs/
```

2. Créez le fichier `/etc/nginx/sites-available/pont-saveurs.conf` :

```nginx
server {
    listen 80;
    server_name pont-saveurs.mon-domaine.fr;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name pont-saveurs.mon-domaine.fr;

    # Certificats SSL (ex. Let's Encrypt via certbot)
    ssl_certificate     /etc/letsencrypt/live/pont-saveurs.mon-domaine.fr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/pont-saveurs.mon-domaine.fr/privkey.pem;

    root /var/www/pont-saveurs;
    index index.html;

    # Compression Gzip (JS, CSS, SVG, WASM)
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        application/javascript
        application/json
        application/manifest+json
        image/svg+xml
        application/wasm;

    # S'assurer que le type MIME .wasm est bien déclaré
    types {
        application/wasm wasm;
        application/manifest+json webmanifest;
    }

    # Ne jamais mettre en cache le Service Worker, le Manifest ou index.html
    location ~* ^/(sw\.js|registerSW\.js|workbox-.*\.js|manifest\.webmanifest|index\.html)$ {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        expires 0;
    }

    # Cache longue durée pour les assets hashés par Vite
    location /assets/ {
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Routage SPA
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

3. Activez le site et générez le certificat HTTPS :

```bash
sudo ln -s /etc/nginx/sites-available/pont-saveurs.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d pont-saveurs.mon-domaine.fr
```

---

### Option B — Serveur avec Caddy (HTTPS automatique en 10 lignes)

**Caddy** gère automatiquement les certificats TLS Let’s Encrypt sans configuration manuelle. Dans votre `Caddyfile` :

```caddy
pont-saveurs.mon-domaine.fr {
    root * /var/www/pont-saveurs
    encode zstd gzip

    @nocache path /sw.js /registerSW.js /manifest.webmanifest /index.html
    header @nocache Cache-Control "no-cache, no-store, must-revalidate"

    @assets path /assets/*
    header @assets Cache-Control "public, max-age=31536000, immutable"

    try_files {path} /index.html
    file_server
}
```

Puis rechargez Caddy : `sudo systemctl reload caddy`.

---

### Option C — Apache2 (`.htaccess`)

Placez le contenu de `dist/` dans votre répertoire web et ajoutez ce fichier `.htaccess` à la racine :

```apache
<IfModule mod_mime.c>
  AddType application/wasm .wasm
  AddType application/manifest+json .webmanifest
</IfModule>

<IfModule mod_headers.c>
  <FilesMatch "^(sw\.js|registerSW\.js|manifest\.webmanifest|index\.html)$">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
  </FilesMatch>
</IfModule>

<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

---

### Option D — Déploiement Docker (Nginx Alpine)

Pour déployer rapidement sur un VPS, un NAS Synology ou un serveur d’établissement avec Docker :

1. Créez un `Dockerfile` à la racine du dépôt :

```dockerfile
# Étape 1 : Build de la PWA
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Étape 2 : Serveur statique léger Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
RUN printf 'server {\n\
  listen 80;\n\
  root /usr/share/nginx/html;\n\
  index index.html;\n\
  gzip on;\n\
  gzip_types text/css application/javascript application/wasm image/svg+xml application/manifest+json;\n\
  location ~* ^/(sw\\.js|manifest\\.webmanifest|index\\.html)$ { add_header Cache-Control "no-cache"; }\n\
  location /assets/ { add_header Cache-Control "public, max-age=31536000, immutable"; }\n\
  location / { try_files $uri $uri/ /index.html; }\n\
}\n' > /etc/nginx/conf.d/default.conf
EXPOSE 80
```

2. Construisez et lancez le conteneur (derrière votre reverse-proxy HTTPS type Traefik, Nginx Proxy Manager ou Caddy) :

```bash
docker build -t pont-saveurs-pwa .
docker run -d --name pont-saveurs -p 8080:80 --restart unless-stopped pont-saveurs-pwa
```

---

### Option E — Hébergement statique (Forge Éducation / GitHub Pages / Netlify / Cloudflare Pages)

- **Commande de build** : `npm run build`
- **Dossier publié** : `dist`
- **Note pour déploiement en sous-dossier** (ex. `https://mon-compte.github.io/pont-saveurs/`) : adaptez `base: '/pont-saveurs/'`, `start_url` et `scope` dans `vite.config.ts` avant de lancer `npm run build`.

---

## Installation de la PWA sur les postes & tablettes

Une fois le site accessible en **HTTPS** :

1. **PC Windows / Linux / Chromebook (Chrome, Edge, Brave)** :
   - Ouvrez l’URL du serveur : un bouton **« Installer l’app »** apparaît dans la barre d’outils de l’application (et dans la barre d’adresse du navigateur).
   - Une fois installée, l’application se lance en fenêtre autonome et fonctionne **sans connexion Internet** (y compris la 3D Three.js, JoltPhysics WASM, Svelte Flow, Cytoscape et l’export PDF).
2. **Tablettes Android (Chrome)** :
   - Menu `⋮` → **Ajouter à l’écran d’accueil / Installer l’application**.
3. **iPadOS / iOS (Safari)** :
   - Bouton **Partager** → **Sur l’écran d’accueil**.
4. **Mises à jour** :
   - Le mode `registerType: 'prompt'` de Workbox affiche automatiquement une notification dans l’interface lorsqu’une nouvelle version est déployée sur votre serveur, permettant de recharger proprement sans perdre les travaux enregistrés.

---

## Usage en classe & Gestion des données (RGPD)

- **Aucune donnée personnelle transmise à un serveur externe** : toutes les saisies élèves (identité, réponses DIY, croquis, évaluations, schémas, quiz) sont stockées uniquement en local dans le navigateur (`localStorage`).
- **Remise des travaux via ENT / Pronote** : l’élève clique sur **Exporter JSON** (ou **PDF A4**) pour déposer son dossier.
- **Synthèse enseignant** : dans l’onglet **6 · Guide Prof → Collecteur Classe**, l’enseignant peut glisser-déposer tous les fichiers `.json` des élèves pour générer un tableau récapitulatif et l’exporter en `.csv`.

---

## Structure du projet

```text
├── public/                     # Icônes PWA (192x192, 512x512, maskable, apple-touch-icon, svg)
├── src/
│   ├── components/
│   │   ├── layout/             # HeaderBar, Guide pédagogique, PrintLayout (A4)
│   │   ├── pwa/                # Contrôles d'installation et statut hors ligne PWA
│   │   ├── tab1/               # Découverte, scène 3D PBR + JoltPhysics, plans SVG
│   │   ├── tab2/               # Banc mécanique 10 s, Blocs, Constructeur Svelte Flow, Cytoscape
│   │   ├── tab3/               # Atelier DIY 7 étapes & Sketchpad tactile
│   │   ├── tab4/               # Évaluations différenciées 5e / 4e / 3e (/20)
│   │   ├── tab5/               # Comparatifs profils/matériaux, sollicitations & FabLab
│   │   ├── tab6/               # Guide enseignant & Collecteur JSON/CSV de classe
│   │   └── tab7/               # Bilan (/9), Autoéval, Grille (/10), Quiz, Dépannage, Glossaire
│   ├── lib/
│   │   ├── data/               # Curriculum Cycle 4, quiz, glossaire, fiches prof
│   │   ├── stores/             # État réactif Svelte 5 (appState.svelte.ts) + localStorage
│   │   ├── three/              # Moteur Three.js PBR + simulation JoltPhysics WASM
│   │   └── utils/              # Export PDF (jsPDF), audio WebAudio, synthèse vocale EBEP
│   ├── App.svelte
│   └── app.css                 # Tailwind v4 + Dark Mode + styles EBEP & @media print
├── index.html
├── package.json
└── vite.config.ts              # Configuration Vite + VitePWA (Workbox)
```

---

**TechnoLOY** — *Fête de la Science 2026 (« Saveur savante »)* · Cycle 4 Technologie (`5e`, `4e`, `3e`).
