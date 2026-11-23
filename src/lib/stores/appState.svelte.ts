import type { GradeLevel } from '../data/curriculum';

export interface StudentInfo {
  nom: string;
  prenom: string;
  niveau: GradeLevel;
  classe: string;
  groupe: string;
  date: string;
}

export type DeckProfile = 'flat' | 'ufold' | 'ufold_tall';
export type ReinforcementType = 'none' | 'flat_sheet' | 'accordion';
export type TestStatus = 'idle' | 'running' | 'passed' | 'collapsed';
export type CulturalTheme3D = 'fusion' | 'kenya' | 'nigeria';
export type PhysicsSimResult = 'idle' | 'running' | 'holding' | 'tipped' | 'collapsed';

export interface ProcessBlockNode {
  id: string;
  kind:
    | 'sketch'
    | 'pillars'
    | 'deck_u'
    | 'reinforce'
    | 'assemble'
    | 'cake_3tiers'
    | 'test_10s'
    | 'adjust';
  label: string;
  durationMin: number;
  controlNote: string;
}

export interface ProcessDraft {
  id: string;
  name: string;
  savedAt: string;
  spanCm: 18 | 22;
  blocks: ProcessBlockNode[];
}

export interface Eval5eAnswers {
  n1a_1: string;
  n1a_2: string;
  n1a_3: string;
  n1b_1: string;
  n1b_2: string;
  n1b_3: string;
  n1b_4: string;
  n2a: string;
  n2a_justif: string;
  n2b: string;
  n2b_justif: string;
  n3a_croquis: number;
  n3a_plier: number;
  n3a_assemble: number;
  n3a_tester: number;
  n3b_checked: boolean;
  n4a: string;
  n4a_justif: string;
  n4b_text: string;
}

export interface Eval4eAnswers {
  n1a_1: string;
  n1a_2: string;
  n1a_3: string;
  n1a_4: string;
  n1b: string;
  n1b_def: string;
  n2a_choice: string;
  n2a_exp: string;
  n2b_exp: string;
  t1: number;
  t2: number;
  t3: number;
  t4: number;
  n3a_justif: string;
  n3b_proto: string;
  n4a_proto: string;
  n4a_justif: string;
  n4b_choice: string;
  n4b_justif: string;
}

export interface Eval3eAnswers {
  n1a_dist: string;
  n1a_pieces: string;
  n1a_duree: string;
  n1a_etages: string;
  n1a_mats: string;
  n1b_pliage: string;
  n1b_assemblage: string;
  n1b_flexion: string;
  n2a_eco: string;
  n2b_valid: string;
  n2b_prio: string;
  n3a_proc: string;
  n3b_proto: string;
  n4a_justif: string;
  n4b_22cm: string;
}

export function getDefaultProcessBlocks(niveau: GradeLevel = '4e'): ProcessBlockNode[] {
  if (niveau === '5e') {
    return [
      {
        id: 'p-1',
        kind: 'sketch',
        label: '1. Réaliser le croquis annoté (5 repères)',
        durationMin: 3,
        controlNote: 'Vérifier 18 cm + 3 étages',
      },
      {
        id: 'p-2',
        kind: 'deck_u',
        label: '2. Préparer et plier le papier A4 en U',
        durationMin: 6,
        controlNote: 'Largeur tablier ≥ 5 cm',
      },
      {
        id: 'p-3',
        kind: 'assemble',
        label: '3. Assembler le tablier sur les 4 piliers',
        durationMin: 5,
        controlNote: 'Appuis stables (40 cm scotch max)',
      },
      {
        id: 'p-4',
        kind: 'test_10s',
        label: '4. Tester la stabilité (5 pièces / 10 s)',
        durationMin: 3,
        controlNote: 'Chrono ≥ 10 s sans toucher le sol',
      },
    ];
  }

  return [
    {
      id: 'p-1',
      kind: 'pillars',
      label: 'Découper et placer les 4 piliers carton',
      durationMin: 3,
      controlNote: 'Contrôle : 4 hauteurs égales, portée ' + (niveau === '3e' ? '18/22 cm' : '18 cm'),
    },
    {
      id: 'p-2',
      kind: 'deck_u',
      label: 'Plier le tablier en U (2 cm + rebords 1 cm)',
      durationMin: 4,
      controlNote: 'Contrôle : largeur utile ≥ 5 cm',
    },
    {
      id: 'p-3',
      kind: 'reinforce',
      label: 'Plier et fixer les renforts en accordéon',
      durationMin: 6,
      controlNote: 'Contrôle : triangles serrés au centre, ≤ 40 cm scotch',
    },
    {
      id: 'p-4',
      kind: 'assemble',
      label: 'Assembler l’ensemble et poser la pièce montée',
      durationMin: 4,
      controlNote: 'Contrôle : stabilité, Kofi/Abénah + Kenya/Nigeria',
    },
  ];
}

const STORAGE_KEY = 'technoloy_pont_saveurs_pwa_v1';

class AppStateStore {
  activeTab = $state<number>(1);
  subTab1 = $state<'mission' | '3d' | 'plans'>('3d');
  subTab2 = $state<'sim' | 'blocks' | 'flow' | 'logigramme'>('sim');
  subTab5 = $state<'profiles' | 'materials' | 'forces' | 'fablab'>('profiles');
  subTab6 = $state<'prep' | 'collector' | 'fiches'>('prep');
  subTab7 = $state<'bilan' | 'quiz' | 'glossaire'>('bilan');
  evalTier = $state<'N1' | 'N2' | 'N3' | 'N4'>('N1');

  theme = $state<'dark' | 'light'>('dark');
  ebepMode = $state<boolean>(false);
  profMode = $state<boolean>(false);
  studentDrawerOpen = $state<boolean>(false);
  techDrawMode = $state<'ortho3' | 'exploded_annotated' | 'profiles_u' | 'span_22cm' | 'cake_symbol'>('ortho3');

  // Guide pas à pas sidebar
  guideSidebarOpen = $state<boolean>(true);
  guideCompletedSteps = $state<Record<string, boolean>>({});

  studentInfo = $state<StudentInfo>({
    nom: '',
    prenom: '',
    niveau: '4e',
    classe: '',
    groupe: '',
    date: new Date().toISOString().slice(0, 10),
  });

  // Global 45-min ABC Learning Design Timer
  globalSeconds = $state<number>(45 * 60);
  isTimerRunning = $state<boolean>(false);
  private globalTimerHandle: number | null = null;

  // 3D Viewport & Bridge Mechanical Config
  selected3DPart = $state<string>('ensemble');
  explodeFactor = $state<number>(0);
  viewMode3D = $state<'assembled' | 'exploded'>('assembled');
  showStressFlows3D = $state<boolean>(false);
  showStressHeatmap3D = $state<boolean>(false);
  xrayDeck3D = $state<boolean>(false);
  showDimensions3D = $state<boolean>(true);
  foldProgress3D = $state<number>(100);
  culturalTheme3D = $state<CulturalTheme3D>('fusion');
  isolateStructure3D = $state<boolean>(false);

  deckProfile = $state<DeckProfile>('ufold');
  reinforcementType = $state<ReinforcementType>('accordion');
  spanCm = $state<18 | 22>(18);
  coinCount = $state<number>(5);
  coinOffsetCm = $state<number>(0);
  pillarMismatchMm = $state<number>(0);

  // JoltPhysics 3D simulation state
  physicsDropRequested = $state<number>(0);
  pendingPhysicsDrop = $state<boolean>(false);
  physicsResetRequested = $state<number>(0);
  physicsSimResult = $state<PhysicsSimResult>('idle');
  physicsStatusLabel = $state<string>('Prêt pour test gravitaire Jolt');

  // Live 10-second protocol test state + Duel Comparison
  testStatus = $state<TestStatus>('idle');
  testElapsedSec = $state<number>(0);
  duelMode = $state<boolean>(false);
  hasTestedFlat = $state<boolean>(false);
  hasTestedReinforced = $state<boolean>(false);
  hasTested22cm = $state<boolean>(false);
  private simTimerHandle: number | null = null;

  // Drag-and-drop Process Sequencer (svelte-dnd-action + Cytoscape)
  blockProgram = $state<ProcessBlockNode[]>(getDefaultProcessBlocks('4e'));
  programDrafts = $state<ProcessDraft[]>([]);
  activeStepBlockId = $state<string | null>(null);
  activeStepCyNode = $state<string | null>(null);
  flowBuilderCompleted = $state<{ forces: boolean; logigramme: boolean }>({
    forces: false,
    logigramme: false,
  });

  // Tab 3: DIY 7-Step Workshop Answers + Sketchpad
  activeDiyStep = $state<number>(1);
  diySteps = $state({
    s1_q1: '',
    s1_q2: '',
    s1_q3: '',
    s1_q4: '',
    culture_kenya: '',
    culture_nigeria: '',
    culture_source: '',
    s3_q1: '',
    s3_q2: '',
    s4_checks: [false, false, false, false, false, false, false, false, false, false, false] as boolean[],
    s5_checks: [false, false, false] as boolean[],
    val_c1: 'Oui' as 'Oui' | 'Non',
    val_c2: 'Oui' as 'Oui' | 'Non',
    val_c3: 'Oui' as 'Oui' | 'Non',
    val_c4: 'Oui' as 'Oui' | 'Non',
    val_c5: 'Oui' as 'Oui' | 'Non',
    s6_analyse1: '',
    s6_analyse2: '',
    comm_1: '',
    comm_2: '',
    comm_3: '',
    comm_4: '',
  });

  // Tab 4: Differentiated Evaluations (5e / 4e / 3e)
  eval5e = $state<Eval5eAnswers>({
    n1a_1: '',
    n1a_2: '',
    n1a_3: '',
    n1b_1: '',
    n1b_2: '',
    n1b_3: '',
    n1b_4: '',
    n2a: '',
    n2a_justif: '',
    n2b: '',
    n2b_justif: '',
    n3a_croquis: 2,
    n3a_plier: 3,
    n3a_assemble: 1,
    n3a_tester: 4,
    n3b_checked: false,
    n4a: '',
    n4a_justif: '',
    n4b_text: '',
  });

  eval4e = $state<Eval4eAnswers>({
    n1a_1: '',
    n1a_2: '',
    n1a_3: '',
    n1a_4: '',
    n1b: '',
    n1b_def: '',
    n2a_choice: '',
    n2a_exp: '',
    n2b_exp: '',
    t1: 2,
    t2: 3,
    t3: 4,
    t4: 2,
    n3a_justif: '',
    n3b_proto: '',
    n4a_proto: '',
    n4a_justif: '',
    n4b_choice: '',
    n4b_justif: '',
  });

  eval3e = $state<Eval3eAnswers>({
    n1a_dist: '',
    n1a_pieces: '',
    n1a_duree: '',
    n1a_etages: '',
    n1a_mats: '',
    n1b_pliage: '',
    n1b_assemblage: '',
    n1b_flexion: '',
    n2a_eco: '',
    n2b_valid: '',
    n2b_prio: '',
    n3a_proc: '',
    n3b_proto: '',
    n4a_justif: '',
    n4b_22cm: '',
  });

  lastEvalScore = $state<Record<GradeLevel, number | null>>({
    '5e': null,
    '4e': null,
    '3e': null,
  });

  // Tab 7: Bilan, Autoeval, Grid/10, Quiz
  bilanSkills = $state<boolean[]>(new Array(9).fill(false));
  autoevalChoice = $state<string>('J’ai réalisé, testé et expliqué ma solution de manière autonome.');
  grid10Scores = $state<Record<string, number>>({
    g1: 2,
    g2: 2,
    g3: 2,
    g4: 2,
    g5: 2,
  });
  quizAnswers = $state<Record<string, number>>({});

  // Tab 6: Teacher Checklist
  teacherChecklist = $state<Record<number, boolean>>({});

  // Captured Canvas Snapshots for Print A4 & PDF Export
  threeSnapshotUrl = $state<string>('');
  threeExplodedSnapshotUrl = $state<string>('');
  sketchSnapshotUrl = $state<string>('');
  logigrammeSnapshotUrl = $state<string>('');
  private snapshotCapturers: Record<string, () => string> = {};

  lastSavedAt = $state<string>('');
  toastMessage = $state<string | null>(null);
  toastTone = $state<'info' | 'success' | 'error'>('info');
  private toastTimer: number | null = null;

  constructor() {
    this.loadFromStorage();
    this.applyThemeClass();
  }

  applyThemeClass(): void {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.toggle('dark', this.theme === 'dark');
  }

  toggleTheme(): void {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    this.applyThemeClass();
    this.saveToStorage();
  }

  // Computed Mechanical Stiffness & Flexion (mm)
  get stiffnessFactor(): number {
    let s = 1.0;
    const foldRatio = this.foldProgress3D / 100;
    if (this.deckProfile === 'ufold') s += 2.2 * foldRatio;
    else if (this.deckProfile === 'ufold_tall') s += 3.1 * foldRatio;

    if (this.reinforcementType === 'flat_sheet') s += 0.6;
    else if (this.reinforcementType === 'accordion') s += 2.8;

    return Number(s.toFixed(2));
  }

  get currentDeflectionMm(): number {
    if (this.coinCount === 0) return 0;
    const spanFactor = this.spanCm === 22 ? 1.45 : 1.0;
    const offsetPenalty = 1 + Math.abs(this.coinOffsetCm) * 0.14;
    const raw = (this.coinCount * 11 * spanFactor * offsetPenalty) / this.stiffnessFactor;
    return Math.round(raw);
  }

  get isBridgeCompliant(): boolean {
    return (
      this.currentDeflectionMm <= 26 &&
      this.coinCount >= 5 &&
      Math.abs(this.coinOffsetCm) <= 1.2 &&
      this.pillarMismatchMm <= 3
    );
  }

  get estimatedTapeUsedCm(): number {
    let tape = 12;
    if (this.reinforcementType === 'flat_sheet') tape += 14;
    else if (this.reinforcementType === 'accordion') tape += 18;
    tape += 8;
    return Math.min(40, tape);
  }

  get sheetsUsedCount(): number {
    return this.reinforcementType === 'none' ? 2 : 3;
  }

  get totalBlockDurationMin(): number {
    return this.blockProgram.reduce((acc, b) => acc + (Number(b.durationMin) || 0), 0);
  }

  get grid10Total(): number {
    const sum = Object.values(this.grid10Scores).reduce((a, b) => a + (Number(b) || 0), 0);
    return Math.min(10, Math.max(0, Math.round(sum * 10) / 10));
  }

  get bilanCheckedCount(): number {
    return this.bilanSkills.filter(Boolean).length;
  }

  get unlockedBadges(): Array<{ id: string; title: string; unlocked: boolean }> {
    return [
      {
        id: 'b_flat',
        title: 'Constat Flexion (Feuille plate)',
        unlocked: this.hasTestedFlat,
      },
      {
        id: 'b_u10',
        title: 'Maître du Pli en U (10 s)',
        unlocked: this.hasTestedReinforced,
      },
      {
        id: 'b_22cm',
        title: 'Défi Écoconception 22 cm',
        unlocked: this.hasTested22cm,
      },
      {
        id: 'b_culture',
        title: 'Passeur Kenya & Nigeria',
        unlocked:
          Boolean(this.diySteps.culture_kenya.trim()) &&
          Boolean(this.diySteps.culture_nigeria.trim()) &&
          Boolean(this.sketchSnapshotUrl),
      },
      {
        id: 'b_eval',
        title: `Évaluation ${this.studentInfo.niveau} validée`,
        unlocked: this.lastEvalScore[this.studentInfo.niveau] !== null,
      },
    ];
  }

  triggerPhysicsDrop(): void {
    this.pendingPhysicsDrop = true;
    this.physicsDropRequested += 1;
  }

  triggerPhysicsReset(): void {
    this.pendingPhysicsDrop = false;
    this.physicsResetRequested += 1;
    this.physicsSimResult = 'idle';
    this.physicsStatusLabel = 'Maquette réinitialisée';
  }

  toggleTimer(): void {
    if (typeof window === 'undefined') return;
    if (this.isTimerRunning) {
      if (this.globalTimerHandle !== null) {
        window.clearInterval(this.globalTimerHandle);
        this.globalTimerHandle = null;
      }
      this.isTimerRunning = false;
    } else {
      this.isTimerRunning = true;
      this.globalTimerHandle = window.setInterval(() => {
        if (this.globalSeconds > 0) {
          this.globalSeconds -= 1;
        } else {
          this.toggleTimer();
          this.showToast('Les 45 minutes de l’activité DIY sont écoulées !', 'info');
        }
      }, 1000);
    }
  }

  resetTimer(): void {
    if (this.globalTimerHandle !== null) {
      window.clearInterval(this.globalTimerHandle);
      this.globalTimerHandle = null;
    }
    this.isTimerRunning = false;
    this.globalSeconds = 45 * 60;
  }

  start10sTest(onTickTone?: (passed: boolean) => void): void {
    if (typeof window === 'undefined' || this.testStatus === 'running') return;
    if (this.simTimerHandle !== null) window.clearInterval(this.simTimerHandle);

    this.testStatus = 'running';
    this.testElapsedSec = 0;

    if (this.deckProfile === 'flat' && this.reinforcementType === 'none') {
      this.hasTestedFlat = true;
    }
    if (this.deckProfile !== 'flat' && this.reinforcementType === 'accordion' && this.spanCm === 18) {
      this.hasTestedReinforced = true;
    }

    const deflection = this.currentDeflectionMm;
    const unstable = Math.abs(this.coinOffsetCm) > 1.2 || this.pillarMismatchMm > 3;

    this.simTimerHandle = window.setInterval(() => {
      this.testElapsedSec = Number((this.testElapsedSec + 0.2).toFixed(1));

      if ((deflection > 26 || unstable) && this.testElapsedSec >= 4.0) {
        if (this.simTimerHandle !== null) {
          window.clearInterval(this.simTimerHandle);
          this.simTimerHandle = null;
        }
        this.testStatus = 'collapsed';
        onTickTone?.(false);
        this.showToast(
          unstable
            ? `Basculement latéral à ${this.testElapsedSec.toFixed(1)} s ! Centre la charge et égalise les 4 piliers.`
            : `Effondrement à ${this.testElapsedSec.toFixed(1)} s ! Ajoute un pli en U et des renforts en accordéon.`,
          'error',
        );
        this.saveToStorage();
        return;
      }

      if (this.testElapsedSec >= 10.0) {
        if (this.simTimerHandle !== null) {
          window.clearInterval(this.simTimerHandle);
          this.simTimerHandle = null;
        }
        this.testElapsedSec = 10.0;
        this.testStatus = 'passed';
        if (this.spanCm === 22 && this.coinCount >= 5) {
          this.hasTested22cm = true;
        }
        onTickTone?.(true);
        this.showToast(
          `Protocole 10 s validé ! Flèche maîtrisée : ${deflection} mm sous ${this.coinCount} pièce(s).`,
          'success',
        );
        this.saveToStorage();
      }
    }, 200);
  }

  reset10sTest(): void {
    if (this.simTimerHandle !== null) {
      window.clearInterval(this.simTimerHandle);
      this.simTimerHandle = null;
    }
    this.testStatus = 'idle';
    this.testElapsedSec = 0;
  }

  syncNiveau(niveau: GradeLevel): void {
    this.studentInfo.niveau = niveau;
    if (niveau !== '3e') {
      this.spanCm = 18;
    }
    this.evalTier = 'N1';
    this.blockProgram = getDefaultProcessBlocks(niveau);
    this.reset10sTest();
    this.saveToStorage();
  }

  toggleEbep(): void {
    this.ebepMode = !this.ebepMode;
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('ebep-mode', this.ebepMode);
    }
    this.saveToStorage();
  }

  toggleGuideStep(stepId: string): void {
    this.guideCompletedSteps = {
      ...this.guideCompletedSteps,
      [stepId]: !this.guideCompletedSteps[stepId],
    };
    this.saveToStorage();
  }

  resetGuideSteps(levelPrefix?: string): void {
    if (!levelPrefix) {
      this.guideCompletedSteps = {};
    } else {
      const next = { ...this.guideCompletedSteps };
      for (const k of Object.keys(next)) {
        if (k.startsWith(levelPrefix)) {
          delete next[k];
        }
      }
      this.guideCompletedSteps = next;
    }
    this.saveToStorage();
  }

  saveProgramDraft(name: string): void {
    const cleanName = name.trim() || `Version ${this.programDrafts.length + 1}`;
    const draft: ProcessDraft = {
      id: `draft-${Date.now()}`,
      name: cleanName,
      savedAt: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      spanCm: this.spanCm,
      blocks: this.blockProgram.map((b) => ({ ...b })),
    };
    this.programDrafts = [draft, ...this.programDrafts].slice(0, 6);
    this.saveToStorage();
    this.showToast(`Séquence « ${cleanName} » enregistrée localement.`, 'success');
  }

  restoreProgramDraft(draftId: string): void {
    const found = this.programDrafts.find((d) => d.id === draftId);
    if (!found) return;
    this.spanCm = found.spanCm;
    this.blockProgram = found.blocks.map((b) => ({ ...b }));
    this.saveToStorage();
    this.showToast(`Séquence « ${found.name} » restaurée.`, 'info');
  }

  registerSnapshotCapturer(key: string, fn: () => string): void {
    this.snapshotCapturers[key] = fn;
  }

  unregisterSnapshotCapturer(key: string): void {
    delete this.snapshotCapturers[key];
  }

  capturePrintSnapshots(): void {
    try {
      const threeUrl = this.snapshotCapturers['three']?.();
      if (threeUrl) this.threeSnapshotUrl = threeUrl;
      const explodedUrl = this.snapshotCapturers['threeExploded']?.();
      if (explodedUrl) this.threeExplodedSnapshotUrl = explodedUrl;
      const sketchUrl = this.snapshotCapturers['sketchpad']?.();
      if (sketchUrl) this.sketchSnapshotUrl = sketchUrl;
      const logiUrl = this.snapshotCapturers['logigramme']?.();
      if (logiUrl) this.logigrammeSnapshotUrl = logiUrl;
    } catch {
      // Ignore if inactive tab
    }
  }

  async captureAllSnapshots(): Promise<void> {
    this.capturePrintSnapshots();
    await new Promise((r) => setTimeout(r, 40));
  }

  computeEvalScore(level: GradeLevel): number {
    let score = 0;
    if (level === '5e') {
      const a = this.eval5e;
      if (a.n1a_1 === 'B') score += 0.85;
      if (a.n1a_2 === 'A') score += 0.85;
      if (a.n1a_3 === 'C') score += 0.8;
      if (a.n1b_1 === 'papier') score += 0.625;
      if (a.n1b_2 === 'carton') score += 0.625;
      if (a.n1b_3 === 'pliage') score += 0.625;
      if (a.n1b_4 === 'assemblage') score += 0.625;
      if (a.n2a === 'B') score += 1.5;
      if (a.n2a_justif.trim().length > 6) score += 1.0;
      if (a.n2b === 'soutenir') score += 1.5;
      if (a.n2b_justif.trim().length > 6) score += 1.0;
      if (a.n3a_croquis === 1 && a.n3a_plier === 2 && a.n3a_assemble === 3 && a.n3a_tester === 4) {
        score += 2.5;
      }
      if (a.n3b_checked) score += 2.5;
      if (a.n4a === 'ajouter') score += 1.5;
      if (a.n4a_justif.trim().length > 6) score += 1.0;
      if (a.n4b_text.trim().length > 8) score += 2.5;
    } else if (level === '4e') {
      const a = this.eval4e;
      if (a.n1a_1 === 'tablier') score += 0.625;
      if (a.n1a_2 === 'leger') score += 0.625;
      if (a.n1a_3 === 'support') score += 0.625;
      if (a.n1a_4 === 'rigidite') score += 0.625;
      if (a.n1b === 'flexion') score += 1.5;
      if (a.n1b_def.trim().length > 6) score += 1.0;
      if (a.n2a_choice === 'B') score += 1.5;
      if (a.n2a_exp.trim().length > 6) score += 1.0;
      if (a.n2b_exp.trim().length > 10) score += 2.5;
      const sum = Number(a.t1) + Number(a.t2) + Number(a.t3) + Number(a.t4);
      if (sum === 17 && a.n3a_justif.trim().length > 4) score += 2.5;
      else if (sum === 17) score += 1.5;
      if (a.n3b_proto.trim().length > 12) score += 2.5;
      if (a.n4a_proto === 'B') score += 1.5;
      if (a.n4a_justif.trim().length > 4) score += 1.0;
      if (a.n4b_choice === 'B') score += 1.25;
      if (a.n4b_justif.trim().length > 8) score += 1.25;
    } else {
      const a = this.eval3e;
      if (a.n1a_dist.includes('18')) score += 0.5;
      if (a.n1a_pieces.includes('5')) score += 0.5;
      if (a.n1a_duree.includes('10')) score += 0.5;
      if (a.n1a_etages.includes('3')) score += 0.5;
      if (a.n1a_mats.trim().length > 4) score += 0.5;
      if (a.n1b_pliage === 'B') score += 0.85;
      if (a.n1b_assemblage === 'C') score += 0.85;
      if (a.n1b_flexion === 'A') score += 0.8;
      if (a.n2a_eco.trim().length > 12) score += 2.5;
      if (a.n2b_valid === 'Non') score += 1.5;
      if (a.n2b_prio.trim().length > 4) score += 1.0;
      if (a.n3a_proc.trim().length > 12) score += 2.5;
      if (a.n3b_proto.trim().length > 12) score += 2.5;
      if (a.n4a_justif.trim().length > 12) score += 2.5;
      if (a.n4b_22cm.trim().length > 12) score += 2.5;
    }

    const rounded = Math.round(score * 10) / 10;
    this.lastEvalScore = { ...this.lastEvalScore, [level]: rounded };
    this.saveToStorage();
    return rounded;
  }

  showToast(message: string, tone: 'info' | 'success' | 'error' = 'info'): void {
    this.toastMessage = message;
    this.toastTone = tone;
    if (this.toastTimer !== null && typeof window !== 'undefined') {
      window.clearTimeout(this.toastTimer);
    }
    if (typeof window !== 'undefined') {
      this.toastTimer = window.setTimeout(() => {
        this.toastMessage = null;
      }, 3600);
    }
  }

  saveToStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      const payload = {
        theme: this.theme,
        ebepMode: this.ebepMode,
        studentInfo: this.studentInfo,
        deckProfile: this.deckProfile,
        reinforcementType: this.reinforcementType,
        spanCm: this.spanCm,
        coinCount: this.coinCount,
        coinOffsetCm: this.coinOffsetCm,
        pillarMismatchMm: this.pillarMismatchMm,
        culturalTheme3D: this.culturalTheme3D,
        hasTestedFlat: this.hasTestedFlat,
        hasTestedReinforced: this.hasTestedReinforced,
        hasTested22cm: this.hasTested22cm,
        blockProgram: this.blockProgram,
        programDrafts: this.programDrafts,
        flowBuilderCompleted: this.flowBuilderCompleted,
        diySteps: this.diySteps,
        eval5e: this.eval5e,
        eval4e: this.eval4e,
        eval3e: this.eval3e,
        lastEvalScore: this.lastEvalScore,
        bilanSkills: this.bilanSkills,
        autoevalChoice: this.autoevalChoice,
        grid10Scores: this.grid10Scores,
        quizAnswers: this.quizAnswers,
        teacherChecklist: this.teacherChecklist,
        guideSidebarOpen: this.guideSidebarOpen,
        guideCompletedSteps: this.guideCompletedSteps,
        sketchSnapshotUrl: this.sketchSnapshotUrl,
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      this.lastSavedAt = new Date().toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      // Ignore quota errors
    }
  }

  loadFromStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data.theme === 'dark' || data.theme === 'light') {
        this.theme = data.theme;
      }
      if (typeof data.ebepMode === 'boolean') {
        this.ebepMode = data.ebepMode;
        document.body.classList.toggle('ebep-mode', this.ebepMode);
      }
      if (data.studentInfo) this.studentInfo = { ...this.studentInfo, ...data.studentInfo };
      if (data.deckProfile) this.deckProfile = data.deckProfile;
      if (data.reinforcementType) this.reinforcementType = data.reinforcementType;
      if (data.spanCm === 18 || data.spanCm === 22) this.spanCm = data.spanCm;
      if (typeof data.coinCount === 'number') this.coinCount = data.coinCount;
      if (typeof data.coinOffsetCm === 'number') this.coinOffsetCm = data.coinOffsetCm;
      if (typeof data.pillarMismatchMm === 'number') this.pillarMismatchMm = data.pillarMismatchMm;
      if (data.culturalTheme3D) this.culturalTheme3D = data.culturalTheme3D;
      if (typeof data.hasTestedFlat === 'boolean') this.hasTestedFlat = data.hasTestedFlat;
      if (typeof data.hasTestedReinforced === 'boolean') this.hasTestedReinforced = data.hasTestedReinforced;
      if (typeof data.hasTested22cm === 'boolean') this.hasTested22cm = data.hasTested22cm;
      if (Array.isArray(data.blockProgram) && data.blockProgram.length > 0) this.blockProgram = data.blockProgram;
      if (Array.isArray(data.programDrafts)) this.programDrafts = data.programDrafts;
      if (data.flowBuilderCompleted) {
        this.flowBuilderCompleted = { ...this.flowBuilderCompleted, ...data.flowBuilderCompleted };
      }
      if (data.diySteps) this.diySteps = { ...this.diySteps, ...data.diySteps };
      if (data.eval5e) this.eval5e = { ...this.eval5e, ...data.eval5e };
      if (data.eval4e) this.eval4e = { ...this.eval4e, ...data.eval4e };
      if (data.eval3e) this.eval3e = { ...this.eval3e, ...data.eval3e };
      if (data.lastEvalScore) this.lastEvalScore = { ...this.lastEvalScore, ...data.lastEvalScore };
      if (Array.isArray(data.bilanSkills) && data.bilanSkills.length === 9) this.bilanSkills = data.bilanSkills;
      if (typeof data.autoevalChoice === 'string') this.autoevalChoice = data.autoevalChoice;
      if (data.grid10Scores) this.grid10Scores = { ...this.grid10Scores, ...data.grid10Scores };
      if (data.quizAnswers) this.quizAnswers = data.quizAnswers;
      if (data.teacherChecklist) this.teacherChecklist = data.teacherChecklist;
      if (typeof data.guideSidebarOpen === 'boolean') this.guideSidebarOpen = data.guideSidebarOpen;
      if (data.guideCompletedSteps) this.guideCompletedSteps = data.guideCompletedSteps;
      if (typeof data.sketchSnapshotUrl === 'string') this.sketchSnapshotUrl = data.sketchSnapshotUrl;
    } catch {
      // Ignore corrupt storage
    }
  }

  exportStudentJSON(): void {
    const score = this.computeEvalScore(this.studentInfo.niveau);
    const payload = {
      project: 'TechnoLOY-Pont-Saveurs-Cultures-FDS2026',
      exportedAt: new Date().toISOString(),
      studentInfo: this.studentInfo,
      bridgeConfig: {
        deckProfile: this.deckProfile,
        reinforcementType: this.reinforcementType,
        spanCm: this.spanCm,
        coinCount: this.coinCount,
        coinOffsetCm: this.coinOffsetCm,
        deflectionMm: this.currentDeflectionMm,
        testStatus: this.testStatus,
      },
      blockProgram: this.blockProgram,
      flowBuilderCompleted: this.flowBuilderCompleted,
      diySteps: this.diySteps,
      evalScore: score,
      eval5e: this.eval5e,
      eval4e: this.eval4e,
      eval3e: this.eval3e,
      bilanSkills: this.bilanSkills,
      autoevalChoice: this.autoevalChoice,
      grid10Scores: this.grid10Scores,
      quizAnswers: this.quizAnswers,
      guideCompletedSteps: this.guideCompletedSteps,
      sketchSnapshotUrl: this.sketchSnapshotUrl,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const cleanNom = (this.studentInfo.nom || 'eleve').toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    const cleanPrenom = (this.studentInfo.prenom || 'pont').toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    a.href = url;
    a.download = `dossier_pont_saveurs_${this.studentInfo.niveau}_${cleanNom}_${cleanPrenom}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.showToast('Dossier élève JSON exporté pour dépôt ENT / Pronote.', 'success');
  }

  async importStudentJSON(file: File): Promise<void> {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (data.studentInfo) this.studentInfo = { ...this.studentInfo, ...data.studentInfo };
      if (data.bridgeConfig) {
        if (data.bridgeConfig.deckProfile) this.deckProfile = data.bridgeConfig.deckProfile;
        if (data.bridgeConfig.reinforcementType) this.reinforcementType = data.bridgeConfig.reinforcementType;
        if (data.bridgeConfig.spanCm) this.spanCm = data.bridgeConfig.spanCm;
        if (typeof data.bridgeConfig.coinCount === 'number') this.coinCount = data.bridgeConfig.coinCount;
        if (typeof data.bridgeConfig.coinOffsetCm === 'number') this.coinOffsetCm = data.bridgeConfig.coinOffsetCm;
      }
      if (Array.isArray(data.blockProgram)) this.blockProgram = data.blockProgram;
      if (data.flowBuilderCompleted) {
        this.flowBuilderCompleted = { ...this.flowBuilderCompleted, ...data.flowBuilderCompleted };
      }
      if (data.diySteps) this.diySteps = { ...this.diySteps, ...data.diySteps };
      if (data.eval5e) this.eval5e = { ...this.eval5e, ...data.eval5e };
      if (data.eval4e) this.eval4e = { ...this.eval4e, ...data.eval4e };
      if (data.eval3e) this.eval3e = { ...this.eval3e, ...data.eval3e };
      if (Array.isArray(data.bilanSkills)) this.bilanSkills = data.bilanSkills;
      if (typeof data.autoevalChoice === 'string') this.autoevalChoice = data.autoevalChoice;
      if (data.grid10Scores) this.grid10Scores = data.grid10Scores;
      if (data.quizAnswers) this.quizAnswers = data.quizAnswers;
      if (data.guideCompletedSteps) this.guideCompletedSteps = data.guideCompletedSteps;
      if (typeof data.sketchSnapshotUrl === 'string') this.sketchSnapshotUrl = data.sketchSnapshotUrl;
      this.saveToStorage();
      this.showToast(`Dossier de ${this.studentInfo.prenom || 'l’élève'} importé avec succès.`, 'success');
    } catch {
      this.showToast('Fichier JSON invalide ou incompatible.', 'error');
    }
  }
}

export const appState = new AppStateStore();
