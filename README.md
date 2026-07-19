# 🌿 NutriLine v2

Journal alimentaire — refonte complète.

## Nouveautés v2

- **Timeline** : le journal est le cœur de l'app, fil de la journée avec heures réelles
- **Historique** : calendrier mensuel, un point vert = jour renseigné, tap pour voir le détail
- **Stats** : série en cours 🔥, meilleure série, jours suivis /30, régularité par repas, graphique 14 jours
- **Extras** : ajouter un grignotage ou un repas hors plan avec son heure
- **Design** : nouveau look épuré (Inter, cartes douces, mode sombre auto)
- **Nouveau logo**
- Suppression : cases à cocher des repas (le journal fait foi) et suivi d'hydratation

## Corrections importantes

- **Bug de fuseau horaire** : le v1 utilisait l'heure UTC pour la clé du jour — une entrée après ~23h pouvait partir sur le lendemain. Corrigé (heure locale).
- **Mises à jour** : le service worker est passé en *network-first* pour le HTML — les nouvelles versions arrivent dès le prochain lancement, sans vider le cache.
- **Migration automatique** : les données saisies dans la v1 sont converties au nouveau format à la première lecture.
- Panel bloqué en bas d'écran : supprimé avec l'hydratation.

## Déploiement

```bash
git add .
git commit -m "feat: NutriLine v2 — refonte complète"
git push
```

GitHub Pages met à jour en 1–2 min. Sur iPhone, ferme et rouvre l'app.

## Structure

```
nutriline/
├── index.html
├── manifest.json
├── sw.js
├── css/style.css
├── js/
│   ├── data.js      # créneaux repas + plan
│   ├── state.js     # persistance + migration v1
│   ├── ui.js        # timeline, calendrier, stats
│   ├── app.js       # navigation, sheets, notifs
│   └── export.js    # PDF
└── icons/
```
