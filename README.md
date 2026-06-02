# 🌿 NutriLine

Application mobile de suivi alimentaire personnalisée selon le plan diététique de Julie Havez.

## Fonctionnalités

- 🍽️ **Suivi des repas** — Valider ses 5 repas/collations du jour en un tap
- 📋 **Plan alimentaire** — Consultation du plan diéto toujours disponible, même offline
- ✍️ **Journal** — Saisir ce qu'on a mangé + ressenti (emoji) pour chaque repas
- 💧 **Hydratation** — Tracker visuel 6 verres / 1,5 L
- 💪 **Activité physique** — Toggle + type d'activité
- 🔔 **Rappels collation** — Notifications à 10h et 16h
- 📊 **Récap journalier** — Vue synthèse de toute la journée
- 📴 **Mode offline** — Fonctionne sans connexion (PWA + Service Worker)
- 📱 **Installable** — "Ajouter à l'écran d'accueil" sur iOS et Android

## Déploiement sur GitHub Pages

### 1. Créer le repo GitHub

```bash
git init
git add .
git commit -m "feat: initial NutriLine app"
git branch -M main
git remote add origin https://github.com/TON_USERNAME/nutriline.git
git push -u origin main
```

### 2. Activer GitHub Pages

1. Aller dans **Settings** du repo
2. Section **Pages** → Source : `Deploy from a branch`
3. Branch : `main` / `/ (root)`
4. Sauvegarder → l'app sera dispo sur `https://TON_USERNAME.github.io/nutriline/`

### 3. Installer sur iPhone

1. Ouvrir l'URL dans **Safari** (important : pas Chrome)
2. Appuyer sur le bouton **Partager** (carré avec flèche)
3. Sélectionner **"Sur l'écran d'accueil"**
4. Nommer l'app "NutriLine" → **Ajouter**

L'app s'installe comme une vraie app native avec icône et mode plein écran !

## Structure du projet

```
nutrition-app/
├── index.html          # Structure HTML principale
├── manifest.json       # Config PWA (nom, icônes, couleurs)
├── sw.js               # Service Worker (cache offline)
├── css/
│   └── style.css       # Styles complets
├── js/
│   ├── data.js         # Données du plan alimentaire
│   ├── state.js        # Gestion état + localStorage
│   ├── ui.js           # Fonctions de rendu
│   └── app.js          # Logique principale + navigation
└── icons/
    ├── icon-192.png    # Icône app
    └── icon-512.png    # Icône app grande taille
```

## Personnalisation

Pour modifier le plan alimentaire, éditer le fichier `js/data.js` :
- `MEALS_CONFIG` — infos des repas (nom, heure, description)
- `PLAN_DATA` — contenu détaillé du plan
- `PLAN_RULES` — règles générales

## Tech stack

- HTML/CSS/JS vanilla — aucune dépendance, zéro build
- PWA (Progressive Web App) avec Service Worker
- localStorage pour la persistance des données
- Notifications Web API pour les rappels
