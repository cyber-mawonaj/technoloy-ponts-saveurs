import type { GradeLevel } from './curriculum';

export interface GuideStep {
  id: string;
  order: string;
  title: string;
  tab: number;
  tabLabel: string;
  instruction: string;
}

export const PEDAGOGICAL_GUIDE_STEPS: Record<GradeLevel, GuideStep[]> = {
  '5e': [
    {
      id: 'g5_1',
      order: '01',
      title: 'Lire la commande de M. Loyalle',
      tab: 1,
      tabLabel: 'Découverte 3D',
      instruction:
        'Explore la maquette 3D et repère le tablier, les 4 piliers, les renforts et la pièce montée à 3 étages.',
    },
    {
      id: 'g5_2',
      order: '02',
      title: 'Activer la vue éclatée 3D',
      tab: 1,
      tabLabel: 'Découverte 3D',
      instruction:
        'Passe le modèle en vue Éclatée pour observer comment s’emboîtent les feuilles A4 et les tubes en carton.',
    },
    {
      id: 'g5_3',
      order: '03',
      title: 'Tester feuille plate vs pli en U',
      tab: 2,
      tabLabel: 'Labo & Séquenceur',
      instruction:
        'Dans le simulateur 10 s, compare une feuille plate sans renfort puis un tablier plié en U avec accordéon.',
    },
    {
      id: 'g5_4',
      order: '04',
      title: 'Dessiner le croquis & saveurs',
      tab: 3,
      tabLabel: 'Atelier DIY 7 Étapes',
      instruction:
        'Trace ton croquis annoté (18 cm, piliers, tablier, 3 étages) et documente une référence Kenya & Nigeria.',
    },
    {
      id: 'g5_5',
      order: '05',
      title: 'Réussir l’évaluation 5e (N1–N4)',
      tab: 4,
      tabLabel: 'Évaluations',
      instruction:
        'Complète les 8 items de 5e (éléments du pont, ordre de fabrication, amélioration) puis vérifie ton score.',
    },
  ],
  '4e': [
    {
      id: 'g4_1',
      order: '01',
      title: 'Inspecter les forces en 3D',
      tab: 1,
      tabLabel: 'Découverte 3D',
      instruction:
        'Active « Flux de forces » dans la scène 3D pour observer la flexion au centre et la compression dans les piliers.',
    },
    {
      id: 'g4_2',
      order: '02',
      title: 'Valider le protocole 10 secondes',
      tab: 2,
      tabLabel: 'Labo & Séquenceur',
      instruction:
        'Configure un tablier en U + renforts en accordéon sous 5 pièces et valide l’essai complet de 10,0 s.',
    },
    {
      id: 'g4_3',
      order: '03',
      title: 'Ordonner les étapes (17 min)',
      tab: 2,
      tabLabel: 'Labo & Séquenceur',
      instruction:
        'Utilise le séquenceur par blocs glisser-déposer pour planifier la fabrication en 17 minutes et lance le pas à pas.',
    },
    {
      id: 'g4_4',
      order: '04',
      title: 'Compléter le parcours DIY & croquis',
      tab: 3,
      tabLabel: 'Atelier DIY 7 Étapes',
      instruction:
        'Réalise le croquis numérique annoté, complète la validation 5 critères et la présentation orale (Étape 7).',
    },
    {
      id: 'g4_5',
      order: '05',
      title: 'Réussir l’évaluation 4e (N1–N4)',
      tab: 4,
      tabLabel: 'Évaluations',
      instruction:
        'Complète l’évaluation 4e (flexion, planification 17 min, Pont A vs B, papier vs carton) et génère ton dossier.',
    },
  ],
  '3e': [
    {
      id: 'g3_1',
      order: '01',
      title: 'Analyser l’écoconception & les cotes',
      tab: 1,
      tabLabel: 'Découverte 3D',
      instruction:
        'Inspecte la planche ISO E et le modèle 3D pour relever les cotes clés (18 cm / 22 cm, ≥ 5 cm de largeur).',
    },
    {
      id: 'g3_2',
      order: '02',
      title: 'Relever le défi de portée 22 cm',
      tab: 2,
      tabLabel: 'Labo & Séquenceur',
      instruction:
        'Passe la portée à 22 cm (exigence N4b), optimise le profil (U renforcé + triangles) et valide 10 s avec 5 pièces.',
    },
    {
      id: 'g3_3',
      order: '03',
      title: 'Structurer Actions & Contrôles',
      tab: 2,
      tabLabel: 'Labo & Séquenceur',
      instruction:
        'Vérifie les blocs du processus avec contrôles dimensionnels et exécute le logigramme décisionnel.',
    },
    {
      id: 'g3_4',
      order: '04',
      title: 'Documenter le dossier DIY & croquis',
      tab: 3,
      tabLabel: 'Atelier DIY 7 Étapes',
      instruction:
        'Enregistre ton croquis annoté, les sources Kenya/Nigeria et le bilan des résultats expérimentaux.',
    },
    {
      id: 'g3_5',
      order: '05',
      title: 'Valider l’évaluation 3e & Bilan',
      tab: 4,
      tabLabel: 'Évaluations',
      instruction:
        'Complète l’évaluation 3e (écoconception, analyse 3 essais, défi 22 cm), le Bilan 9 compétences et le Quiz.',
    },
  ],
};

export interface QuizQuestion {
  id: string;
  level: GradeLevel;
  competency: string;
  question: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q5_1',
    level: '5e',
    competency: 'CCRI1 · Éléments du pont',
    question: 'Quelle partie horizontale du pont supporte la pièce montée et les 5 pièces de 1 € ?',
    choices: ['Les piles en carton', 'Le tablier en papier A4', 'Le ruban adhésif', 'Le sol de la table'],
    correctIndex: 1,
    explanation:
      'Le tablier est la partie horizontale qui franchit le vide de 18 cm et reçoit la charge de la pièce montée.',
  },
  {
    id: 'q5_2',
    level: '5e',
    competency: 'CCRI2 · Sécurité & Matériaux',
    question: 'Quel matériel est STRICTEMENT interdit dans le cahier des charges DIY ?',
    choices: [
      '3 feuilles blanches A4',
      '2 tubes en carton d’essuie-tout',
      'Le pistolet à colle chaude et le cutter',
      'Une paire de ciseaux et 40 cm de ruban adhésif',
    ],
    correctIndex: 2,
    explanation:
      'Pour la sécurité en classe ou à la maison, ni colle chaude ni cutter ne sont autorisés (ciseaux uniquement).',
  },
  {
    id: 'q5_3',
    level: '5e',
    competency: 'SFC1 · Chronologie',
    question: 'Quel est le bon ordre des 4 grandes étapes de réalisation ?',
    choices: [
      'Tester -> Assembler -> Plier -> Croquis',
      'Croquis -> Préparer/plier -> Assembler -> Tester',
      'Assembler -> Croquis -> Tester -> Plier',
      'Plier -> Tester -> Croquis -> Assembler',
    ],
    correctIndex: 1,
    explanation:
      'On conçoit toujours sur croquis avant de préparer et plier les pièces, puis on assemble et enfin on teste 10 s.',
  },
  {
    id: 'q4_1',
    level: '4e',
    competency: 'CCRI11 · Sollicitation mécanique',
    question: 'À quelle sollicitation mécanique principale est soumis le tablier lorsque 5 pièces sont posées au centre ?',
    choices: ['La torsion', 'La flexion', 'Le cisaillement pur', 'L’aimantation'],
    correctIndex: 1,
    explanation:
      'Sous une charge perpendiculaire à son axe entre deux appuis, le tablier se courbe : il subit une flexion.',
  },
  {
    id: 'q4_2',
    level: '4e',
    competency: 'CCRI13 · Forme & Rigidité',
    question: 'Pourquoi plier la feuille A4 en U (bords 2 cm + rebords 1 cm) améliore-t-il la résistance ?',
    choices: [
      'Parce que le papier devient plus lourd',
      'Parce que la hauteur verticale du profil augmente le moment d’inertie et freine la flexion',
      'Parce que le ruban adhésif remplace les piliers',
      'Parce que la couleur blanche réfléchit la charge',
    ],
    correctIndex: 1,
    explanation:
      'En mécanique des structures, augmenter l’épaisseur utile (les parois verticales du U) rigidifie fortement la poutre sans ajouter de matière.',
  },
  {
    id: 'q4_3',
    level: '4e',
    competency: 'SFC13 · Protocole d’essai',
    question: 'Lors d’un essai, le Pont A s’affaisse à 4 s et le Pont B tient 12 s. Lequel respecte le cahier des charges ?',
    choices: [
      'Le Pont A car il est plus rapide',
      'Aucun des deux',
      'Le Pont B car 12 s > 10 s exigées',
      'Les deux sont identiques',
    ],
    correctIndex: 2,
    explanation:
      'Le critère de validation impose un maintien pendant au moins 10 secondes sans effondrement : 12 s valide l’exigence.',
  },
  {
    id: 'q3_1',
    level: '3e',
    competency: 'SFC1.2.3a · Écoconception',
    question: 'Pourquoi le couple papier A4 + carton d’essuie-tout est-il pertinent en écoconception ?',
    choices: [
      'Il nécessite un usinage laser énergivore',
      'Ce sont des matériaux légers, facilement pliables, issus du réemploi/recyclage et valorisables en fin de vie',
      'Ils sont imperméables et indestructibles',
      'Ils contiennent des composants électroniques',
    ],
    correctIndex: 1,
    explanation:
      'Tubes réemployés et papier cellulosique limitent l’empreinte matière, se transforment par simple pliage et se recyclent facilement.',
  },
  {
    id: 'q3_2',
    level: '3e',
    competency: 'CCRI22 · Analyse de défaillance',
    question: 'Si la portée passe de 18 cm à 22 cm sans aucun matériau supplémentaire, comment maintenir la rigidité ?',
    choices: [
      'Supprimer 2 piliers sur 4',
      'Déplier complètement le tablier pour qu’il soit plat',
      'Relever la hauteur des plis en U et concentrer les renforts triangulaires/accordéon sous la zone centrale',
      'Ajouter du scotch sur les étages du gâteau uniquement',
    ],
    correctIndex: 2,
    explanation:
      'À portée accrue (22 cm), le moment fléchissant au centre augmente : il faut maximiser la hauteur de poutre et la triangulation centrale.',
  },
  {
    id: 'q3_3',
    level: '3e',
    competency: 'Culture DIY & FabLab',
    question: 'Quels sont les trois piliers officiels de la démarche FabLab présentés en fin d’activité ?',
    choices: [
      'BUY · USE · THROW',
      'LEARN · MAKE · SHARE',
      'CODE · FLASH · PRINT',
      'CUT · GLUE · HIDE',
    ],
    correctIndex: 1,
    explanation:
      'Le mouvement FabLab repose sur LEARN (Apprendre), MAKE (Fabriquer/prototyper) et SHARE (Partager ses découvertes et erreurs).',
  },
];

export interface GlossaryItem {
  term: string;
  category: 'Structure & Pont' | 'Mécanique & Matériaux' | 'Démarche DIY & FabLab';
  def: string;
}

export const GLOSSARY_ITEMS: GlossaryItem[] = [
  {
    term: 'Tablier',
    category: 'Structure & Pont',
    def: 'Partie horizontale du pont qui franchit l’espace libre (18 cm ou 22 cm) et supporte la pièce montée et les charges.',
  },
  {
    term: 'Piles (Supports)',
    category: 'Structure & Pont',
    def: 'Appuis verticaux (ici les 4 moitiés de tubes en carton) qui soutiennent les extrémités du tablier.',
  },
  {
    term: 'Portée (Espace libre)',
    category: 'Structure & Pont',
    def: 'Distance libre mesurée entre les deux lignes d’appui : 18 cm au cahier des charges initial, 22 cm pour le défi 3e.',
  },
  {
    term: 'Pièce montée (3 étages)',
    category: 'Structure & Pont',
    def: 'Élément symbolique formé de 3 anneaux de papier de diamètres décroissants célébrant Kofi (Kenya) et Abénah (Nigeria).',
  },
  {
    term: 'Flexion',
    category: 'Mécanique & Matériaux',
    def: 'Sollicitation subie par une poutre ou un tablier qui se courbe sous l’action d’une charge perpendiculaire à son axe.',
  },
  {
    term: 'Compression',
    category: 'Mécanique & Matériaux',
    def: 'Effort d’écrasement transmis verticalement dans les 4 piliers en carton qui portent le poids du tablier.',
  },
  {
    term: 'Pliage en U / Triangulation',
    category: 'Mécanique & Matériaux',
    def: 'Mise en forme géométrique augmentant la hauteur utile de la section (moment d’inertie) pour empêcher le papier de plier.',
  },
  {
    term: 'Flèche (déformation)',
    category: 'Mécanique & Matériaux',
    def: 'Abaissement vertical mesuré au centre du tablier sous l’effet des 5 pièces de 1 €.',
  },
  {
    term: 'Écoconception (3e)',
    category: 'Mécanique & Matériaux',
    def: 'Démarche intégrant le juste besoin en matière (3 A4, 40 cm adhésif), le réemploi des tubes carton et la recyclabilité.',
  },
  {
    term: 'Cahier des charges',
    category: 'Démarche DIY & FabLab',
    def: 'Document listant les fonctions et contraintes mesurables (dimensions, matériaux, résistance 10 s, esthétique) à respecter.',
  },
  {
    term: 'Protocole de test',
    category: 'Démarche DIY & FabLab',
    def: 'Suite d’actions reproductibles permettant de vérifier une exigence : mesurer 18 cm, poser 5 pièces au centre, chronométrer 10 s.',
  },
  {
    term: 'Esprit DIY & FabLab',
    category: 'Démarche DIY & FabLab',
    def: '« Do It Yourself » (Fais-le toi-même) et ateliers collaboratifs fondés sur trois piliers : LEARN · MAKE · SHARE.',
  },
];

export interface TroubleshootCase {
  id: string;
  symptom: string;
  cause: string;
  remedy: string;
  tabRef: number;
}

export const TROUBLESHOOT_CASES: TroubleshootCase[] = [
  {
    id: 'ts1',
    symptom: 'Le centre du tablier se courbe et touche la table avant 10 secondes',
    cause: 'La feuille A4 est restée plate ou sans renforts triangulaires : son moment d’inertie est trop faible face à la flexion.',
    remedy: 'Plie les deux grands bords vers le haut sur 2 cm avec un rebord intérieur de 1 cm (profil U) et fixe deux bandes en accordéon sous le centre.',
    tabRef: 2,
  },
  {
    id: 'ts2',
    symptom: 'Le pont bascule sur le côté dès qu’on pose la 3e pièce',
    cause: 'Les 4 piliers en carton ont des hauteurs inégales ou la largeur utile du tablier est inférieure à 5 cm.',
    remedy: 'Recoupe ou ajuste les 4 moitiés de tubes à la même hauteur, place deux tubes côte à côte par appui et élargis le fond du U à ≥ 5 cm.',
    tabRef: 1,
  },
  {
    id: 'ts3',
    symptom: 'J’ai dépassé les 40 cm de ruban adhésif autorisés',
    cause: 'Le ruban adhésif est utilisé en continu tout le long du tablier au lieu de points d’attache ciblés.',
    remedy: 'Utilise le pliage autobloquant (rebords rentrés de 1 cm) et limite l’adhésif à de courts morceaux de 2 cm aux points d’appui des renforts.',
    tabRef: 3,
  },
  {
    id: 'ts4',
    symptom: 'Défi 3e (22 cm) : le pont tenait à 18 cm mais cède à 22 cm',
    cause: 'La portée plus longue augmente fortement le moment fléchissant au milieu du tablier sans matériel supplémentaire.',
    remedy: 'Augmente la hauteur des parois latérales du U (ex. 2,5 à 3 cm) et rapproche les plis du treillis accordéon au tiers central.',
    tabRef: 2,
  },
];

export const BILAN_SKILLS: string[] = [
  'Identifier un besoin et respecter un cahier des charges.',
  'Dessiner un croquis de solution technique.',
  'Identifier les propriétés des matériaux utilisés.',
  'Choisir une forme de pliage pour renforcer une structure.',
  'Réaliser un prototype.',
  'Mettre en œuvre un protocole de test.',
  'Observer et interpréter les résultats d’un essai.',
  'Proposer une amélioration de ma réalisation.',
  'Présenter et justifier mes choix techniques.',
];

export const AUTOEVAL_OPTIONS: string[] = [
  'J’ai besoin d’aide pour réaliser l’activité.',
  'J’ai réussi une partie de l’activité.',
  'J’ai réalisé la maquette et respecté la plupart des exigences.',
  'J’ai réalisé, testé et expliqué ma solution de manière autonome.',
];

export const GRID10_CRITERIA: Array<{ id: string; label: string; max: number }> = [
  { id: 'g1', label: 'Croquis préparatoire, dimensions et choix justifiés', max: 2 },
  { id: 'g2', label: 'Respect des matériaux et réalisation de la structure', max: 2 },
  { id: 'g3', label: 'Respect du cahier des charges et résistance à l’essai', max: 2 },
  { id: 'g4', label: 'Réalisation de la pièce montée et symbolique culturelle', max: 2 },
  { id: 'g5', label: 'Analyse des résultats et proposition d’amélioration', max: 2 },
];
