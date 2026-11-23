<script lang="ts">
  import {
    Background,
    BackgroundVariant,
    Controls,
    MarkerType,
    SvelteFlow,
    addEdge,
    type Connection,
    type Edge,
    type Node,
    type NodeTypes,
  } from '@xyflow/svelte';
  import '@xyflow/svelte/dist/style.css';
  import {
    CheckCircle2,
    Eye,
    GitBranch,
    HelpCircle,
    Link2,
    RotateCcw,
    ShieldCheck,
    TriangleAlert,
    Waypoints,
    XCircle,
  } from 'lucide-svelte';
  import { appState } from '../../lib/stores/appState.svelte';
  import { playBuzzerTone } from '../../lib/utils/audio';
  import FlowBridgeNode, { type BridgeFlowNodeData } from './FlowBridgeNode.svelte';

  type BuilderScenario = 'forces' | 'logigramme';

  interface ExpectedLink {
    id: string;
    source: string;
    target: string;
    sourceHandle?: string;
    label: string;
    hint: string;
    explanation: string;
  }

  interface DiagnosticItem {
    status: 'ok' | 'error' | 'missing';
    text: string;
  }

  const nodeTypes: NodeTypes = {
    bridgeNode: FlowBridgeNode,
  };

  const EXPECTED_FORCES: ExpectedLink[] = [
    {
      id: 'f1',
      source: 'charge',
      target: 'tablier',
      label: 'Poids vertical',
      hint: 'Commence par la charge centrale (5 pièces 1 €) : quel élément reçoit directement son poids ?',
      explanation: 'Le poids des 5 pièces et de la pièce montée s’applique d’abord au centre du tablier.',
    },
    {
      id: 'f2',
      source: 'tablier',
      target: 'renfort',
      label: 'Flexion transférée',
      hint: 'Le tablier plié en U tend à fléchir au centre : quel renfort en dessous bloque cette flexion ?',
      explanation: 'Le tablier transmet l’effort de flexion vers le treillis en accordéon triangulé.',
    },
    {
      id: 'f3',
      source: 'renfort',
      target: 'piliers',
      label: 'Répartition latérale',
      hint: 'Une fois rigidifié, vers quels éléments porteurs l’ensemble renvoie-t-il l’effort ?',
      explanation: 'L’ensemble tablier + renfort reporte la charge vers les 4 piliers en carton.',
    },
    {
      id: 'f4',
      source: 'piliers',
      target: 'table',
      label: 'Compression au sol',
      hint: 'Enfin, sur quel support fixe reposent les 4 piliers en compression ?',
      explanation: 'Les 4 piliers transmettent la compression verticale jusqu’à la table (portée libre respectée).',
    },
  ];

  const EXPECTED_LOGIGRAMME: ExpectedLink[] = [
    {
      id: 'l1',
      source: 'start',
      target: 'measure',
      label: '1. Préparer',
      hint: 'Relie DÉBUT à la première vérification dimensionnelle du cahier des charges.',
      explanation: 'On contrôle toujours l’écartement libre entre les appuis avant de charger le pont.',
    },
    {
      id: 'l2',
      source: 'measure',
      target: 'load',
      label: '2. Charger',
      hint: 'Après avoir mesuré la portée, quelle action expérimentale faut-il réaliser ?',
      explanation: 'On place les 5 pièces de 1 € au centre et on lance le chronomètre de 10 secondes.',
    },
    {
      id: 'l3',
      source: 'load',
      target: 'decision',
      label: '3. Observer',
      hint: 'L’essai de charge mène directement au bloc losange de décision.',
      explanation: 'On évalue si le pont résiste ≥ 10 s sans fléchir ni basculer.',
    },
    {
      id: 'l4',
      source: 'decision',
      sourceHandle: 'oui',
      target: 'valid',
      label: 'OUI (≥ 10 s)',
      hint: 'Relie le port vert OUI (bas gauche du losange) à l’issue de validation.',
      explanation: 'Branche OUI : le cahier des charges est validé.',
    },
    {
      id: 'l5',
      source: 'decision',
      sourceHandle: 'non',
      target: 'improve',
      label: 'NON (Échec)',
      hint: 'Relie le port rouge NON (bas droite du losange) à l’action corrective.',
      explanation: 'Branche NON : si le pont s’effondre, il faut renforcer le tablier (pli U + accordéon).',
    },
    {
      id: 'l6',
      source: 'improve',
      target: 'load',
      label: 'Re-tester',
      hint: 'Après avoir renforcé la structure, n’oublie pas la boucle de retour vers le test de charge !',
      explanation: 'Démarche itérative : toute amélioration doit être vérifiée par un nouvel essai de 10 s.',
    },
  ];

  function buildInitialNodes(mode: BuilderScenario, spanCm: 18 | 22): Node<BridgeFlowNodeData>[] {
    if (mode === 'forces') {
      return [
        {
          id: 'charge',
          type: 'bridgeNode',
          position: { x: 24, y: 120 },
          data: {
            title: '1. Charge centrale',
            subtitle: '5 pièces 1 € + pièce montée',
            role: 'input',
            hasTarget: false,
            hasSource: true,
            layout: 'horizontal',
            validationState: 'neutral',
          },
        },
        {
          id: 'tablier',
          type: 'bridgeNode',
          position: { x: 270, y: 40 },
          data: {
            title: 'Tablier plié en U',
            subtitle: 'Encaisse la flexion (A4)',
            role: 'process',
            layout: 'horizontal',
            validationState: 'neutral',
          },
        },
        {
          id: 'renfort',
          type: 'bridgeNode',
          position: { x: 270, y: 210 },
          data: {
            title: 'Renfort accordéon',
            subtitle: 'Triangulation sous tablier',
            role: 'warning',
            layout: 'horizontal',
            validationState: 'neutral',
          },
        },
        {
          id: 'piliers',
          type: 'bridgeNode',
          position: { x: 540, y: 65 },
          data: {
            title: '4 Piliers carton',
            subtitle: 'Travaillent en compression',
            role: 'process',
            layout: 'horizontal',
            validationState: 'neutral',
          },
        },
        {
          id: 'table',
          type: 'bridgeNode',
          position: { x: 540, y: 230 },
          data: {
            title: `Appuis fixes (Table)`,
            subtitle: `Portée libre ${spanCm} cm`,
            role: 'success',
            hasTarget: true,
            hasSource: false,
            layout: 'horizontal',
            validationState: 'neutral',
          },
        },
        {
          id: 'forbidden',
          type: 'bridgeNode',
          position: { x: 24, y: 280 },
          data: {
            title: 'Colle chaude / Cutter',
            subtitle: 'Intrus · Hors cahier des charges',
            role: 'forbidden',
            layout: 'horizontal',
            validationState: 'neutral',
          },
        },
      ];
    }

    return [
      {
        id: 'start',
        type: 'bridgeNode',
        position: { x: 250, y: 12 },
        data: {
          title: 'DÉBUT PROTOCOLE',
          subtitle: 'Démarrer la validation',
          role: 'start',
          hasTarget: false,
          hasSource: true,
          layout: 'vertical',
          validationState: 'neutral',
        },
      },
      {
        id: 'measure',
        type: 'bridgeNode',
        position: { x: 40, y: 125 },
        data: {
          title: `Mesurer portée (${spanCm} cm)`,
          subtitle: 'Contrôler distance + 4 piliers',
          role: 'input',
          layout: 'vertical',
          validationState: 'neutral',
        },
      },
      {
        id: 'load',
        type: 'bridgeNode',
        position: { x: 440, y: 125 },
        data: {
          title: 'Poser 5 pièces + Chrono',
          subtitle: 'Centrer charge · 10 secondes',
          role: 'process',
          layout: 'vertical',
          validationState: 'neutral',
        },
      },
      {
        id: 'decision',
        type: 'bridgeNode',
        position: { x: 245, y: 245 },
        data: {
          title: 'Tient ≥ 10 s sans fléchir ?',
          subtitle: 'Flèche ≤ 26 mm · Aucun contact sol',
          role: 'decision',
          layout: 'vertical',
          validationState: 'neutral',
        },
      },
      {
        id: 'valid',
        type: 'bridgeNode',
        position: { x: 35, y: 400 },
        data: {
          title: 'Pont VALIDÉ',
          subtitle: 'Cahier des charges conforme',
          role: 'success',
          hasTarget: true,
          hasSource: false,
          layout: 'vertical',
          validationState: 'neutral',
        },
      },
      {
        id: 'improve',
        type: 'bridgeNode',
        position: { x: 445, y: 400 },
        data: {
          title: 'Renforcer (Pli U + Accordéon)',
          subtitle: 'Améliorer puis relancer le test',
          role: 'warning',
          layout: 'vertical',
          validationState: 'neutral',
        },
      },
    ];
  }

  let scenario = $state<BuilderScenario>('forces');
  let nodes = $state.raw<Node<BridgeFlowNodeData>[]>(buildInitialNodes('forces', appState.spanCm));
  let edges = $state.raw<Edge[]>([]);
  let diagnostics = $state<DiagnosticItem[]>([]);
  let activeHint = $state<string>('');
  let hasChecked = $state(false);
  let validCount = $state(0);
  let errorCount = $state(0);

  // Accessible click-to-connect fallback state
  let quickSource = $state<string>('charge');
  let quickHandle = $state<string>('');
  let quickTarget = $state<string>('tablier');

  const expectedLinks = $derived(scenario === 'forces' ? EXPECTED_FORCES : EXPECTED_LOGIGRAMME);
  const scorePct = $derived(
    expectedLinks.length > 0 ? Math.round((validCount / expectedLinks.length) * 100) : 0,
  );
  const isComplete = $derived(hasChecked && validCount === expectedLinks.length && errorCount === 0);

  const flowKey = $derived(`${scenario}-${appState.spanCm}`);

  // Update span text inside nodes when spanCm changes without wiping user edges
  $effect(() => {
    const span = appState.spanCm;
    nodes = nodes.map((n) => {
      if (scenario === 'forces' && n.id === 'table') {
        return { ...n, data: { ...n.data, subtitle: `Portée libre ${span} cm` } };
      }
      if (scenario === 'logigramme' && n.id === 'measure') {
        return { ...n, data: { ...n.data, title: `Mesurer portée (${span} cm)` } };
      }
      return n;
    });
  });

  function switchScenario(next: BuilderScenario) {
    scenario = next;
    nodes = buildInitialNodes(next, appState.spanCm);
    edges = [];
    diagnostics = [];
    activeHint = '';
    hasChecked = false;
    validCount = 0;
    errorCount = 0;
    if (next === 'forces') {
      quickSource = 'charge';
      quickHandle = '';
      quickTarget = 'tablier';
    } else {
      quickSource = 'start';
      quickHandle = '';
      quickTarget = 'measure';
    }
  }

  function styleEdge(edge: Edge, state: 'neutral' | 'ok' | 'error', labelText?: string): Edge {
    const color = state === 'ok' ? '#10b981' : state === 'error' ? '#f43f5e' : '#f59e0b';
    return {
      ...edge,
      type: 'smoothstep',
      animated: state === 'ok',
      label: labelText ?? edge.label,
      style:
        state === 'error'
          ? `stroke: ${color}; stroke-width: 2.5px; stroke-dasharray: 6 4;`
          : `stroke: ${color}; stroke-width: 2.5px;`,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color,
      },
    };
  }

  function handleConnect(connection: Connection) {
    if (!connection.source || !connection.target || connection.source === connection.target) return;
    const duplicate = edges.some(
      (e) =>
        e.source === connection.source &&
        e.target === connection.target &&
        (e.sourceHandle || '') === (connection.sourceHandle || ''),
    );
    if (duplicate) return;

    const autoLabel =
      connection.sourceHandle === 'oui'
        ? 'OUI'
        : connection.sourceHandle === 'non'
          ? 'NON'
          : undefined;

    const newEdge: Edge = styleEdge(
      {
        id: `e-${connection.source}-${connection.sourceHandle ?? 'out'}-${connection.target}-${Date.now()}`,
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle ?? undefined,
        targetHandle: connection.targetHandle ?? undefined,
      },
      'neutral',
      autoLabel,
    );

    edges = addEdge(newEdge, edges);
    hasChecked = false;
  }

  function addQuickLink() {
    if (!quickSource || !quickTarget || quickSource === quickTarget) return;
    const handle = quickSource === 'decision' ? quickHandle || 'oui' : undefined;
    handleConnect({
      source: quickSource,
      target: quickTarget,
      sourceHandle: handle ?? null,
      targetHandle: null,
    });
  }

  function handleEdgeClick({ edge }: { edge: Edge; event: MouseEvent }) {
    edges = edges.filter((e) => e.id !== edge.id);
    hasChecked = false;
  }

  function resetLinks() {
    edges = [];
    diagnostics = [];
    activeHint = '';
    hasChecked = false;
    validCount = 0;
    errorCount = 0;
    nodes = nodes.map((n) => ({ ...n, data: { ...n.data, validationState: 'neutral' } }));
  }

  function matchExpected(edge: Edge, exp: ExpectedLink): boolean {
    if (edge.source !== exp.source || edge.target !== exp.target) return false;
    if (exp.sourceHandle) {
      return edge.sourceHandle === exp.sourceHandle;
    }
    return true;
  }

  function verifyDiagram() {
    const matchedIds = new Set<string>();
    const nextDiags: DiagnosticItem[] = [];
    const errorNodeIds = new Set<string>();
    const validNodeIds = new Set<string>();
    let okEdges = 0;
    let badEdges = 0;

    edges = edges.map((edge) => {
      if (edge.source === 'forbidden' || edge.target === 'forbidden') {
        badEdges += 1;
        errorNodeIds.add('forbidden');
        nextDiags.push({
          status: 'error',
          text: 'Élément interdit connecté : la colle chaude et le cutter sont exclus du cahier des charges (sécurité + écoconception). Clique sur la flèche rouge pour la supprimer.',
        });
        return styleEdge(edge, 'error', 'Interdit !');
      }

      const found = expectedLinks.find((exp) => matchExpected(edge, exp));
      if (found) {
        if (!matchedIds.has(found.id)) {
          matchedIds.add(found.id);
          okEdges += 1;
          validNodeIds.add(edge.source);
          validNodeIds.add(edge.target);
          nextDiags.push({
            status: 'ok',
            text: `${found.label} : ${found.explanation}`,
          });
        }
        return styleEdge(edge, 'ok', found.label);
      }

      // Check if student inverted a valid link
      const inverted = expectedLinks.find(
        (exp) => exp.source === edge.target && exp.target === edge.source,
      );
      badEdges += 1;
      errorNodeIds.add(edge.source);
      errorNodeIds.add(edge.target);

      if (inverted) {
        nextDiags.push({
          status: 'error',
          text: `Sens inversé entre « ${edge.source} » et « ${edge.target} » : la flèche doit aller dans l’autre sens (${inverted.label}).`,
        });
        return styleEdge(edge, 'error', 'Sens inversé');
      }

      // Check if student swapped OUI / NON handle on decision node
      if (edge.source === 'decision') {
        const swapped = expectedLinks.find(
          (exp) => exp.source === 'decision' && exp.target === edge.target,
        );
        if (swapped) {
          nextDiags.push({
            status: 'error',
            text: `Port OUI / NON inversé sur le losange : utilise la sortie « ${swapped.sourceHandle?.toUpperCase()} » pour relier vers cette issue.`,
          });
          return styleEdge(edge, 'error', 'Port OUI/NON inversé');
        }
      }

      nextDiags.push({
        status: 'error',
        text: `Liaison incorrecte (${edge.source} → ${edge.target}). Clique directement sur la flèche rouge pour la retirer.`,
      });
      return styleEdge(edge, 'error', 'À corriger');
    });

    for (const exp of expectedLinks) {
      if (!matchedIds.has(exp.id)) {
        nextDiags.push({
          status: 'missing',
          text: `Liaison manquante : ${exp.hint}`,
        });
      }
    }

    nodes = nodes.map((n) => {
      const state = errorNodeIds.has(n.id)
        ? 'error'
        : validNodeIds.has(n.id) && matchedIds.size === expectedLinks.length && badEdges === 0
          ? 'valid'
          : 'neutral';
      return { ...n, data: { ...n.data, validationState: state } };
    });

    validCount = okEdges;
    errorCount = badEdges;
    diagnostics = nextDiags;
    hasChecked = true;
    activeHint = '';

    if (okEdges === expectedLinks.length && badEdges === 0) {
      appState.flowBuilderCompleted = {
        ...appState.flowBuilderCompleted,
        [scenario]: true,
      };
      appState.saveToStorage();
      playBuzzerTone(1760, 180, appState.ebepMode);
      appState.showToast(
        scenario === 'forces'
          ? 'Chaîne de transmission des efforts validée à 100 % !'
          : 'Logigramme du protocole 10 s validé à 100 % !',
        'success',
      );
    } else {
      playBuzzerTone(360, 180, appState.ebepMode);
    }
  }

  function showNextHint() {
    const nextMissing = expectedLinks.find(
      (exp) => !edges.some((e) => matchExpected(e, exp)),
    );
    if (nextMissing) {
      activeHint = nextMissing.hint;
    } else {
      activeHint = 'Toutes les liaisons attendues sont posées ! Clique sur « Vérifier » pour contrôler les erreurs éventuelles.';
    }
  }

  function loadSolution() {
    edges = expectedLinks.map((exp) =>
      styleEdge(
        {
          id: `sol-${exp.id}`,
          source: exp.source,
          target: exp.target,
          sourceHandle: exp.sourceHandle,
        },
        'ok',
        exp.label,
      ),
    );
    verifyDiagram();
  }
</script>

<section class="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
  <!-- Header & Mode Switcher -->
  <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
    <div class="space-y-1">
      <div class="text-xs text-slate-500 dark:text-slate-400">
        Atelier interactif Svelte Flow · Recommandé 4e / 3e (niveau actif : {appState.studentInfo.niveau})
      </div>
      <h3 class="text-base font-bold text-slate-900 dark:text-slate-100">
        Constructeur Auto-Corrigé — Chaîne d’Efforts & Logigramme 10 s
      </h3>
    </div>

    <div class="inline-flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1 gap-1 text-xs self-start lg:self-auto">
      <button
        type="button"
        onclick={() => switchScenario('forces')}
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 {scenario === 'forces'
          ? 'bg-white dark:bg-amber-500 text-slate-900 dark:text-slate-950 shadow-xs'
          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'}"
      >
        <Waypoints class="w-3.5 h-3.5" />
        Chaîne d’efforts
        {#if appState.flowBuilderCompleted.forces}
          <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-950" />
        {/if}
      </button>
      <button
        type="button"
        onclick={() => switchScenario('logigramme')}
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 {scenario === 'logigramme'
          ? 'bg-white dark:bg-amber-500 text-slate-900 dark:text-slate-950 shadow-xs'
          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'}"
      >
        <GitBranch class="w-3.5 h-3.5" />
        Logigramme 10 s (OUI/NON)
        {#if appState.flowBuilderCompleted.logigramme}
          <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-950" />
        {/if}
      </button>
    </div>
  </div>

  <!-- Two-Zone Educational Sandbox Layout -->
  <div class="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
    <!-- Left Zone: Interactive Svelte Flow Canvas (8 cols) -->
    <div class="xl:col-span-8 flex flex-col gap-3">
      <div class="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-400">
        <span>
          {#if scenario === 'forces'}
            Tire une flèche d’un point orange (sortie) vers un point gris (entrée) pour tracer le chemin des efforts mécaniques.
          {:else}
            Câble les 6 liaisons du protocole, y compris les sorties <strong>OUI</strong> / <strong>NON</strong> et la boucle de re-test.
          {/if}
        </span>
        <span class="font-mono text-[11px] text-slate-500 dark:text-slate-400">
          Astuce : clique sur une flèche pour la supprimer
        </span>
      </div>

      <div class="w-full h-[510px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
        {#key flowKey}
          <SvelteFlow
            bind:nodes
            bind:edges
            {nodeTypes}
            onconnect={handleConnect}
            onedgeclick={handleEdgeClick}
            forceColorMode={appState.theme}
            snapGrid={[16, 16]}
            fitView
            fitViewOptions={{ padding: 0.16 }}
            minZoom={0.55}
            maxZoom={1.5}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1.2}
              patternColor={appState.theme === 'dark' ? '#334155' : '#cbd5e1'}
            />
            <Controls showLock={false} />
          </SvelteFlow>
        {/key}
      </div>

      <!-- Tablet / Keyboard Accessible Click-to-Connect Bar -->
      <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-2 text-xs">
        <span class="font-semibold text-slate-700 dark:text-slate-300 inline-flex items-center gap-1.5">
          <Link2 class="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          Liaison rapide (tablette / clavier) :
        </span>

        <select
          bind:value={quickSource}
          aria-label="Bloc de départ"
          class="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-slate-100 font-medium"
        >
          {#each nodes.filter((n) => n.data.hasSource !== false) as n (n.id)}
            <option value={n.id}>{n.data.title}</option>
          {/each}
        </select>

        {#if quickSource === 'decision'}
          <select
            bind:value={quickHandle}
            aria-label="Branche OUI ou NON"
            class="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1.5 text-slate-900 dark:text-slate-100 font-semibold"
          >
            <option value="oui">Sortie OUI</option>
            <option value="non">Sortie NON</option>
          </select>
        {/if}

        <span class="text-slate-400 font-mono">→</span>

        <select
          bind:value={quickTarget}
          aria-label="Bloc d’arrivée"
          class="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-slate-100 font-medium"
        >
          {#each nodes.filter((n) => n.data.hasTarget !== false) as n (n.id)}
            <option value={n.id}>{n.data.title}</option>
          {/each}
        </select>

        <button
          type="button"
          onclick={addQuickLink}
          class="px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-semibold cursor-pointer whitespace-nowrap shrink-0"
        >
          Relier
        </button>
      </div>
    </div>

    <!-- Right Zone: Control, Score & Auto-Correction Deck (4 cols) -->
    <div class="xl:col-span-4 flex flex-col gap-4">
      <!-- Progress & Primary Actions -->
      <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3.5">
        <div class="flex items-center justify-between gap-2">
          <div>
            <div class="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Validation du schéma
            </div>
            <div class="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
              {edges.length} flèche{edges.length > 1 ? 's' : ''} tracée{edges.length > 1 ? 's' : ''} · {expectedLinks.length} attendue{expectedLinks.length > 1 ? 's' : ''}
            </div>
          </div>
          <div class="font-mono text-lg font-bold tabular-nums {isComplete ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}">
            {validCount} / {expectedLinks.length}
          </div>
        </div>

        <div class="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            class="h-full transition-all duration-200 {isComplete ? 'bg-emerald-500' : 'bg-amber-500'}"
            style="width: {scorePct}%"
          ></div>
        </div>

        <div class="grid grid-cols-1 gap-2 pt-1">
          <button
            type="button"
            onclick={verifyDiagram}
            class="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer transition-colors"
          >
            <ShieldCheck class="w-4 h-4" />
            Vérifier mon schéma
          </button>

          <div class="grid grid-cols-2 gap-2">
            <button
              type="button"
              onclick={showNextHint}
              class="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer"
            >
              <HelpCircle class="w-3.5 h-3.5 text-amber-500" />
              Indice
            </button>

            <button
              type="button"
              onclick={resetLinks}
              class="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer"
            >
              <RotateCcw class="w-3.5 h-3.5" />
              Effacer
            </button>
          </div>

          {#if appState.profMode || hasChecked}
            <button
              type="button"
              onclick={loadSolution}
              class="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-amber-300 dark:border-amber-700/70 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-950/70 text-amber-900 dark:text-amber-200 text-xs font-semibold cursor-pointer"
            >
              <Eye class="w-3.5 h-3.5" />
              {appState.profMode ? 'Afficher le corrigé (Mode Prof)' : 'Afficher la correction'}
            </button>
          {/if}
        </div>
      </div>

      <!-- Progressive Hint Box -->
      {#if activeHint}
        <div class="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-950 dark:text-amber-100 leading-relaxed flex items-start gap-2">
          <HelpCircle class="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong class="block mb-0.5">Indice pas à pas</strong>
            {activeHint}
          </div>
        </div>
      {/if}

      <!-- Live Auto-Correction Diagnostic Feed -->
      <div class="flex-1 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5 overflow-y-auto max-h-[340px]">
        <div class="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-2">
          <span>Diagnostic automatique</span>
          {#if hasChecked}
            <span class="font-mono text-[11px] tabular-nums {isComplete ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}">
              {isComplete ? 'Validé' : `${errorCount} erreur${errorCount > 1 ? 's' : ''}`}
            </span>
          {/if}
        </div>

        {#if !hasChecked}
          <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {#if scenario === 'forces'}
              Relie les blocs dans l’ordre de transmission des efforts mécaniques, puis clique sur <strong>Vérifier mon schéma</strong>. Attention : un élément intrus ne doit pas être connecté !
            {:else}
              Relie les étapes du protocole d’essai 10 s, puis clique sur <strong>Vérifier mon schéma</strong> pour tester les branches OUI / NON et la boucle d’amélioration.
            {/if}
          </p>
        {:else}
          <ul class="space-y-2 text-xs">
            {#each diagnostics as item}
              <li
                class="p-2.5 rounded-lg border flex items-start gap-2 leading-snug {item.status === 'ok'
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/35 border-emerald-200 dark:border-emerald-800/70 text-emerald-950 dark:text-emerald-100'
                  : item.status === 'error'
                    ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/70 text-rose-950 dark:text-rose-100'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'}"
              >
                {#if item.status === 'ok'}
                  <CheckCircle2 class="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                {:else if item.status === 'error'}
                  <XCircle class="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                {:else}
                  <TriangleAlert class="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                {/if}
                <span>{item.text}</span>
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    </div>
  </div>
</section>
