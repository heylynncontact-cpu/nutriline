// ── PLAN ALIMENTAIRE DATA ──
const MEALS_CONFIG = [
  {
    id: 'pj',
    name: 'Petit déjeuner',
    time: '7h30',
    emoji: '🌅',
    desc: 'Pain complet · yaourt · fruit'
  },
  {
    id: 'c1',
    name: 'Collation matin',
    time: '~10h',
    emoji: '🍎',
    desc: '1 fruit ou compote sans sucre'
  },
  {
    id: 'dej',
    name: 'Déjeuner',
    time: '12h30',
    emoji: '🍽️',
    desc: 'Légumes · protéine · féculents'
  },
  {
    id: 'c2',
    name: 'Collation après-midi',
    time: '~16h',
    emoji: '🍎',
    desc: '1 fruit ou compote sans sucre'
  },
  {
    id: 'din',
    name: 'Dîner',
    time: '19h00',
    emoji: '🌙',
    desc: 'Légumes · protéine · féculents'
  }
];

const PLAN_DATA = [
  {
    icon: '🌅',
    title: 'Petit déjeuner',
    time: '7h30',
    items: [
      '🍞 2–4 tranches pain complet (40–100g) + beurre <span class="or">ou</span> 2–4 biscottes complètes <span class="or">ou</span> muesli (20–40g) <span class="or">ou</span> flocons d\'avoine (20–40g)',
      '🥛 1 yaourt nature <span class="or">ou</span> 1 fromage blanc <span class="or">ou</span> 1 tranche de jambon <span class="or">ou</span> fromage <span class="or">ou</span> 1 œuf',
      '🍊 1 fruit <span class="or">ou</span> 1 compote sans sucre ajouté <span class="or">ou</span> 1 jus de fruits pressé maison',
      '☕ Ricoré'
    ]
  },
  {
    icon: '🍎',
    title: 'Collation',
    time: '×2/jour',
    items: [
      '1 fruit <span class="or">ou</span> 1 compote sans sucre ajouté'
    ]
  },
  {
    icon: '🍽️',
    title: 'Déjeuner',
    time: '12h30',
    items: [
      '🥗 Légumes cuits ou crus, à volonté',
      '🥩 2 œufs <span class="or">ou</span> viande <span class="or">ou</span> poisson',
      '🍚 Féculents complets <strong>130g cuits</strong> <span class="or">ou</span> pain complet 60g',
      '🧀 1 yaourt nature <span class="or">ou</span> 1 fromage blanc nature <span class="or">ou</span> fromage (1 fois/jour max)'
    ]
  },
  {
    icon: '🌙',
    title: 'Dîner',
    time: '19h00',
    items: [
      '🥦 Légumes cuits ou crus, à volonté',
      '🐟 Œuf <span class="or">ou</span> poisson <span class="or">ou</span> viande',
      '🍚 Féculents complets <strong>110g cuits</strong> <span class="or">ou</span> pain complet 40g',
      '🥛 1 fromage blanc nature <span class="or">ou</span> 1 yaourt nature'
    ]
  }
];

const PLAN_RULES = [
  '💧 1,5 L/jour — eau plate/gazeuse, infusion, café, thé',
  '🌰 10 fruits à coque/jour — amandes, noisettes, noix de cajou, noix',
  '🫒 Matières grasses végétales — huile de lin, de colza, de noix',
  '🍫 1 carré chocolat noir >70% cacao/jour, éviter les prises isolées',
  '🥦 Privilégier les fruits et légumes de saison',
  '🏃 Pratiquer une activité physique régulière'
];

const FEELINGS = [
  { emoji: '😊', label: 'Bien' },
  { emoji: '😐', label: 'Neutre' },
  { emoji: '😔', label: 'Moyen' },
  { emoji: '🤢', label: 'Mal' }
];
