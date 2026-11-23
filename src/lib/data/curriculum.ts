export type GradeLevel = '5e' | '4e' | '3e';

export type BridgeCameraPreset = 'ensemble' | 'pillars' | 'deck' | 'reinforcement' | 'cake';

export interface BridgeComponentSpec {
  id: string;
  index: string;
  name: string;
  material: string;
  dimensions: string;
  role: string;
  threeTarget: string;
  zoomPreset: BridgeCameraPreset;
}

export const BRIDGE_COMPONENTS: BridgeComponentSpec[] = [
  {
    id: 'pillars',
    index: '01',
    name: '4 Piliers en Carton',
    material: '2 tubes d’essuie-tout coupés',
    dimensions: '2 paires · Portée 18 cm (ou 22 cm)',
    role: 'Soutiennent le tablier aux deux extrémités et transmettent les charges en compression vers la surface d’appui.',
    threeTarget: 'pillars',
    zoomPreset: 'pillars',
  },
  {
    id: 'deck',
    index: '02',
    name: 'Tablier en U (Feuille 1)',
    material: '1 feuille blanche A4 (29,7 × 21 cm)',
    dimensions: 'Largeur min 5 cm · Plis 2 cm + 1 cm',
    role: 'Supporte la pièce montée et les 5 pièces. Les plis latéraux en U augmentent la rigidité face à la flexion.',
    threeTarget: 'deck',
    zoomPreset: 'deck',
  },
  {
    id: 'reinforcement',
    index: '03',
    name: 'Renforts Accordéon (Feuille 2)',
    material: '2e feuille blanche A4 + ruban adhésif',
    dimensions: '2 bandes pliées en triangles / accordéon',
    role: 'Pliage géométrique triangulaire fixé sous le tablier pour limiter la flèche centrale lors de l’essai de 10 s.',
    threeTarget: 'reinforcement',
    zoomPreset: 'reinforcement',
  },
  {
    id: 'cake',
    index: '04',
    name: 'Pièce Montée 3 Étages (Feuille 3)',
    material: '3e feuille A4 + crayons de couleur',
    dimensions: '3 anneaux décroissants · Kenya / Nigeria',
    role: 'Symbolise l’union de Kofi Seÿkou-Touré (Kenya) et Abénah Obi-Kâ (Nigeria) avec références culinaires documentées.',
    threeTarget: 'cake',
    zoomPreset: 'cake',
  },
  {
    id: 'coins',
    index: '05',
    name: 'Charge d’Essai (5 Pièces 1 €)',
    material: '5 pièces de 1 € (ou 5 bouchons)',
    dimensions: '≈ 37,5 g au centre · Maintien ≥ 10 s',
    role: 'Permet de valider le protocole expérimental : maintien 10 secondes sans effondrement, basculement ni contact au sol.',
    threeTarget: 'coins',
    zoomPreset: 'ensemble',
  },
];

export interface CahierRequirement {
  id: string;
  critere: string;
  exigence: string;
  verification: string;
}

export const CAHIER_DES_CHARGES: CahierRequirement[] = [
  {
    id: 'req-1',
    critere: 'Fonction d’usage',
    exigence: 'Représenter un pont en forme de pièce montée pour le mariage de Kofi et Abénah.',
    verification: 'Observation visuelle de l’ensemble pont + 3 étages',
  },
  {
    id: 'req-2',
    critere: 'Matériaux autorisés',
    exigence: 'Uniquement 3 feuilles blanches A4 max, 2 tubes en carton d’essuie-tout et 40 cm max de ruban adhésif.',
    verification: 'Inventaire matériel avant fabrication (0 colle chaude, 0 cutter)',
  },
  {
    id: 'req-3',
    critere: 'Portée (Espace libre)',
    exigence: 'Franchir un espace libre de 18 cm entre deux lignes d’appui (22 cm pour le défi de réinvestissement 3e).',
    verification: 'Mesure directe à la règle graduée entre les faces internes des piliers',
  },
  {
    id: 'req-4',
    critere: 'Largeur du tablier',
    exigence: 'Posséder une surface de tablier d’au moins 5 cm de largeur.',
    verification: 'Mesure à la règle graduée après pliage en U',
  },
  {
    id: 'req-5',
    critere: 'Supports',
    exigence: 'Utiliser les 2 tubes en carton coupés en deux parties égales pour former 4 piliers (2 par extrémité).',
    verification: 'Contrôle géométrique de symétrie et hauteur égale',
  },
  {
    id: 'req-6',
    critere: 'Résistance mécanique',
    exigence: 'Supporter 5 pièces de 1 € (ou 5 bouchons de bouteille) placées au centre du tablier pendant 10 secondes.',
    verification: 'Chronométrage ≥ 10,0 s sans affaissement excessif',
  },
  {
    id: 'req-7',
    critere: 'Stabilité',
    exigence: 'Ne pas basculer latéralement et ne pas toucher la surface sous le pont.',
    verification: 'Contrôle visuel sous le tablier durant les 10 s',
  },
  {
    id: 'req-8',
    critere: 'Esthétique & Symbolique',
    exigence: '3 étages décroissants, prénoms Kofi & Abénah au centre, « Kenya » à gauche et « Nigeria » à droite avec références culinaires documentées.',
    verification: 'Lecture des inscriptions et respect des cultures représentées',
  },
];

export const MATERIALS_AND_SAFETY = {
  materials: [
    '3 feuilles blanches format A4 (21 × 29,7 cm) maximum',
    '2 tubes en carton de rouleaux d’essuie-tout',
    '40 cm maximum de ruban adhésif',
    '5 pièces de 1 € (ou 5 bouchons de bouteille) pour le test en charge',
  ],
  tools: [
    'Paire de ciseaux scolaires',
    'Règle graduée (≥ 30 cm)',
    'Crayon à papier et gomme',
    'Crayons de couleur ou feutres pour la décoration',
  ],
  safetyRules: [
    'Aucune colle chaude (pistolet à colle) n’est autorisée.',
    'Aucun cutter ni objet tranchant autre que les ciseaux.',
    'Demander l’aide d’un adulte ou de l’enseignant pour amorcer la découpe des tubes en carton si nécessaire.',
    'Maquette strictement pédagogique : ne pas utiliser de véritable nourriture.',
  ],
};

export interface DiyStepMeta {
  step: number;
  title: string;
  phase: string;
  minutes: number;
  summary: string;
}

export const DIY_STEPS_META: DiyStepMeta[] = [
  {
    step: 1,
    title: 'Comprendre la commande',
    phase: 'Acquisition',
    minutes: 4,
    summary: 'Analyser le besoin de Monsieur Loyalle, la fonction d’usage, les matériaux et les contraintes.',
  },
  {
    step: 2,
    title: 'Imaginer & préparer',
    phase: 'Investigation',
    minutes: 5,
    summary: 'Dessiner le croquis annoté (5 repères obligatoires) et documenter deux saveurs Kenya / Nigeria.',
  },
  {
    step: 3,
    title: 'Justifier son choix',
    phase: 'Discussion',
    minutes: 2,
    summary: 'Expliquer à l’oral ou par écrit la forme de pliage retenue avant de découper le papier.',
  },
  {
    step: 4,
    title: 'Fabriquer le pont',
    phase: 'Practice',
    minutes: 17,
    summary: 'Découper les 4 piliers, plier le tablier en U (2 cm + 1 cm) et fixer les renforts en accordéon.',
  },
  {
    step: 5,
    title: 'Réaliser la pièce montée',
    phase: 'Production',
    minutes: 7,
    summary: 'Assembler les 3 étages décroissants avec la 3e feuille A4 et inscrire Kofi, Abénah, Kenya, Nigeria.',
  },
  {
    step: 6,
    title: 'Tester pendant 10 s',
    phase: 'Validation',
    minutes: 7,
    summary: 'Mettre en œuvre le protocole en charge (5 pièces, 10 s), relever les résultats et proposer une amélioration.',
  },
  {
    step: 7,
    title: 'Présenter sa réalisation',
    phase: 'Communiquer',
    minutes: 3,
    summary: 'Rédiger et présenter la synthèse technique et culturelle de la maquette.',
  },
];

export const CULINARY_PRESETS = {
  kenya: [
    'Mandazi (beignets parfumés à la cardamome et lait de coco, côte swahilie)',
    'Chai ya Tangawizi (thé noir kényan infusé au gingembre frais et lait)',
    'Ugali & Sukuma Wiki (semoule de maïs blanc et feuilles vertes braisées)',
    'Mahamri (pains dorés triangulaires parfumés aux épices, région côtière)',
  ],
  nigeria: [
    'Chin Chin (petits croquants dorés à la noix de muscade servis lors des fêtes)',
    'Zobo (infusion glacée aux fleurs d’hibiscus séchées, gingembre et ananas)',
    'Puff-Puff (beignets moelleux traditionnels des célébrations et mariages)',
    'Dodo (bananes plantains mûres dorées accompagnant les repas festifs)',
  ],
};

export interface TeacherFiche {
  id: string;
  phase: 'Organisation & Sécurité' | 'Évaluations & Barèmes' | 'Différenciation & FabLab';
  title: string;
  summary: string;
  note?: string;
  commands: string;
}

export const TEACHER_FICHES: TeacherFiche[] = [
  {
    id: 'P1',
    phase: 'Organisation & Sécurité',
    title: 'Préparation de l’îlot DIY et gestion des 45 minutes',
    summary: 'Kit individuel ou en binôme strictement limité au matériel du cahier des charges.',
    note: 'Rappel sécurité : pas de cutter ni de pistolet à colle. Les tubes d’essuie-tout peuvent être pré-entamés aux ciseaux pour les élèves à besoins particuliers.',
    commands: `DOTATION PAR ÉLÈVE / BINÔME :
- 3 feuilles blanches A4 (80 g/m² standard)
- 2 tubes carton d'essuie-tout
- 1 bande de ruban adhésif mesurée à 40 cm max
- 1 paire de ciseaux, 1 règle 30 cm, crayons de couleur
- 5 pièces de 1 € (ou 5 bouchons plastiques lestés identiques)
- 1 gabarit tracé sur table : deux traits espacés de 18 cm (ou 22 cm défi 3e)

MINUTAGE SÉANCE (ABC LEARNING DESIGN · 45 MIN) :
00-04 min : Étape 1 Acquisition (Lecture commande M. Loyalle)
04-09 min : Étape 2 Investigation (Croquis 5 repères + Saveurs)
09-11 min : Étape 3 Discussion (Justification du choix technique)
11-28 min : Étape 4 Practice (17 min : Piliers + Tablier U + Renforts)
28-35 min : Étape 5 Production (Pièce montée 3 étages + Symbolique)
35-42 min : Étape 6 Validation (Protocole 5 pièces / 10 secondes)
42-45 min : Étape 7 Communication (Synthèse orale & bilan)`,
  },
  {
    id: 'P2',
    phase: 'Évaluations & Barèmes',
    title: 'Grille commune d’évaluation EBEP (N1 à N4 · /20 points)',
    summary: 'Échelle de réussite progressive par item sur 2,5 points (8 items = 20 points).',
    note: 'Chaque niveau (5e, 4e, 3e) comporte 2 items par palier cognitif : N1 (Connaissance), N2 (Compréhension), N3 (Application), N4 (Maîtrise).',
    commands: `BARÈME COMMUN PAR ITEM (/2,5 PTS) :
- 2,5 pts   : Réponse complète, exacte et justifiée avec le vocabulaire technique
- 2,0 pts   : Réponse correcte et complète, justification succincte
- 1,5 pt    : Réponse globalement exacte mais incomplète ou imprécise
- 0,5 à 1pt : Éléments partiels ou réponse confuse nécessitant étayage
- 0 pt      : Réponse fausse ou absente

CORRESPONDANCE NIVEAUX CYCLE 4 (COMPÉTENCES) :
- 5e (25–30 min) : CCRI1, CCRI2, SFC1 (Identifier éléments, rôle supports, ordonner 4 étapes)
- 4e (30–35 min) : CCRI11, CCRI13, CCRI17, CCRI22, CCRI23, SFC13 (Flexion, planifier 17 min, comparer A vs B)
- 3e (35–40 min) : CCRI11–23, SFC1.2.3a (Écoconception/recyclage, protocole complet, réinvestissement 22 cm)`,
  },
  {
    id: 'P3',
    phase: 'Évaluations & Barèmes',
    title: 'Corrigés détaillés 5e, 4e et 3e (N1a à N4b)',
    summary: 'Attendus officiels complets pour la correction rapide ou l’auto-correction guidée.',
    commands: `=== CLASSE DE 5e ===
N1a : Tablier -> B | Piles -> A | Renforts -> C
N1b : papier ; carton ; pliage ; assemblage
N2a : Forme B (pliée en U) — les bords relevés augmentent la rigidité
N2b : Soutenir le tablier et transmettre les charges vers les appuis
N3a : 1 Croquis -> 2 Préparer/plier -> 3 Assembler -> 4 Tester
N3b : Tableau de vérification complété après essai de 10 s
N4a : Ajouter un pli de renforcement sous le centre du tablier
N4b : Vérifier l'exigence non atteinte et proposer une action ciblée

=== CLASSE DE 4e ===
N1a : Papier A4 -> Tablier (léger, pliable) | Carton -> Support (rigidité)
N1b : Flexion (courbure sous une charge perpendiculaire à l'axe)
N2a : Solution B (pliée en U), l'augmentation de hauteur de profil rigidifie la poutre
N2b : Adaptation matériau/forme aux contraintes (compression sur piliers, flexion sur tablier)
N3a : 4 tâches cohérentes totalisant exactement 17 min (ex: 3+4+6+4) + justification
N3b : Protocole complet (18 cm, 5 pièces au centre, chrono 10 s, critère non-effondrement)
N4a : Prototype Pont B (12 s > 10 s exigées)
N4b : Solution B (renfort triangulaire), plus rigide que feuille plate à masse égale

=== CLASSE DE 3e ===
N1a : 18 cm | 5 pièces | 10 s | 3 étages | papier A4 & carton
N1b : Pliage = B | Assemblage = C | Flexion = A
N2a : Propriétés mécaniques + pliage facile + matériaux biosourcés recyclables (écoconception)
N2b : Non validé (7 s < 10 s), examiner en priorité le tablier et ses renforts centraux
N3a : Processus complet (Action + Contrôle sur traçage, pliage, assemblage, essai)
N3b : Grandeurs mesurées (longueur, masse, temps) + matériel + étapes + critère de validation
N4a : Triangulation (B) maximise le moment d'inertie sans surconsommation de papier (recyclage préservé)
N4b : Portée 22 cm sans matériau ajouté -> augmenter hauteur des rebords en U + concentrer renforts triangulaires au centre`,
  },
  {
    id: 'P4',
    phase: 'Différenciation & FabLab',
    title: 'Adaptations EBEP & Posture culturelle FabLab',
    summary: 'Accessibilité Dys/TSA, travail à la maison et esprit LEARN · MAKE · SHARE.',
    commands: `ADAPTATIONS EBEP :
- Activer le "Mode EBEP (Dys/TSA)" dans la barre haute : police agrandie, interligne 1.8, animations coupées.
- Boutons "Écouter" (Web Speech API fr-FR) sur toutes les consignes et le Guide Pas à Pas.
- Gabarit "Modèle d'aide" disponible dans l'espace de croquis numérique (Étape 2).

POSTURE CULTURELLE KENYA / NIGERIA :
- Rappel explicite : une recette ou un motif ne résume jamais toute la diversité d'un pays.
- Encourager le respect, la vérification de la source et la curiosité documentaire.`,
  },
];
