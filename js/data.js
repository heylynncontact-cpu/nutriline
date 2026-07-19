// ═══ NutriLine v2 — données ═══

const SLOTS = [
  { id: 'pj',  name: 'Petit déjeuner',      time: '07:30', emoji: '🌅' },
  { id: 'c1',  name: 'Collation matin',     time: '10:00', emoji: '🍎' },
  { id: 'dej', name: 'Déjeuner',            time: '12:30', emoji: '🍽️' },
  { id: 'c2',  name: 'Collation après-midi', time: '16:00', emoji: '🍎' },
  { id: 'din', name: 'Dîner',               time: '19:00', emoji: '🌙' }
];

const PLAN_DATA = [
  {
    emoji: '🌅', name: 'Petit déjeuner', time: '7h30',
    items: [
      '🍞 2–4 tranches pain complet (40–100g) + beurre <span class="ou">ou</span> 2–4 biscottes complètes <span class="ou">ou</span> muesli (20–40g) <span class="ou">ou</span> flocons d\'avoine (20–40g)',
      '🥛 1 yaourt nature <span class="ou">ou</span> 1 fromage blanc <span class="ou">ou</span> 1 tranche de jambon <span class="ou">ou</span> fromage <span class="ou">ou</span> 1 œuf',
      '🍊 1 fruit <span class="ou">ou</span> 1 compote sans sucre ajouté <span class="ou">ou</span> 1 jus de fruits pressé maison',
      '☕ Ricoré'
    ]
  },
  {
    emoji: '🍎', name: 'Collations', time: '×2/jour',
    items: ['1 fruit <span class="ou">ou</span> 1 compote sans sucre ajouté']
  },
  {
    emoji: '🍽️', name: 'Déjeuner', time: '12h30',
    items: [
      '🥗 Légumes cuits ou crus, à volonté',
      '🥩 2 œufs <span class="ou">ou</span> viande <span class="ou">ou</span> poisson',
      '🍚 Féculents complets <strong>130g cuits</strong> <span class="ou">ou</span> pain complet 60g',
      '🧀 1 yaourt nature <span class="ou">ou</span> 1 fromage blanc nature <span class="ou">ou</span> fromage (1 fois/jour max)'
    ]
  },
  {
    emoji: '🌙', name: 'Dîner', time: '19h00',
    items: [
      '🥦 Légumes cuits ou crus, à volonté',
      '🐟 Œuf <span class="ou">ou</span> poisson <span class="ou">ou</span> viande',
      '🍚 Féculents complets <strong>110g cuits</strong> <span class="ou">ou</span> pain complet 40g',
      '🥛 1 fromage blanc nature <span class="ou">ou</span> 1 yaourt nature'
    ]
  }
];

const PLAN_RULES = [
  '💧 1,5 L/jour — eau plate ou gazeuse, infusion, café, thé',
  '🌰 10 fruits à coque/jour — amandes, noisettes, noix de cajou, noix (5)',
  '🫒 Matières grasses végétales à chaque repas — huile de lin, colza, noix',
  '🍫 1 carré de chocolat noir >70% cacao/jour, éviter les prises isolées',
  '🥦 Privilégier les fruits et légumes de saison',
  '🏃 Pratiquer une activité physique régulière'
];

const FR_DAYS = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
const FR_DAYS_SHORT = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];
const FR_MONTHS = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
