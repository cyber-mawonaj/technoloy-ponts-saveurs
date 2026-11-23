<script lang="ts">
  import { onDestroy } from 'svelte';
  import { flip } from 'svelte/animate';
  import {
    dndzone,
    SHADOW_ITEM_MARKER_PROPERTY_NAME,
    TRIGGERS,
    type DndEvent,
  } from 'svelte-dnd-action';
  import {
    ArrowDown,
    ArrowUp,
    BookmarkPlus,
    GitBranch,
    GripVertical,
    Play,
    Plus,
    RotateCcw,
    Square,
    Trash2,
  } from 'lucide-svelte';
  import {
    appState,
    getDefaultProcessBlocks,
    type ProcessBlockNode,
  } from '../../lib/stores/appState.svelte';

  interface PaletteBlockItem extends ProcessBlockNode {
    colorClass: string;
    isDndShadowItem?: boolean;
  }

  interface WorkspaceBlockItem extends ProcessBlockNode {
    isDndShadowItem?: boolean;
  }

  const flipDurationMs = 160;
  let seqCounter = 0;

  const PALETTE_TEMPLATES: Array<{
    kind: ProcessBlockNode['kind'];
    label: string;
    colorClass: string;
    durationMin: number;
    controlNote: string;
  }> = [
    {
      kind: 'sketch',
      label: 'Réaliser le croquis annoté (5 repères)',
      colorClass: 'bg-sky-600 text-white',
      durationMin: 3,
      controlNote: 'Contrôle : 18 cm, tablier, 3 étages',
    },
    {
      kind: 'pillars',
      label: 'Découper et placer les 4 piliers carton',
      colorClass: 'bg-amber-700 text-white',
      durationMin: 3,
      controlNote: 'Contrôle : 4 hauteurs égales, portée libre',
    },
    {
      kind: 'deck_u',
      label: 'Plier le tablier en U (2 cm + rebords 1 cm)',
      colorClass: 'bg-indigo-600 text-white',
      durationMin: 4,
      controlNote: 'Contrôle : largeur utile ≥ 5 cm',
    },
    {
      kind: 'reinforce',
      label: 'Fixer les renforts en accordéon / triangles',
      colorClass: 'bg-emerald-600 text-white',
      durationMin: 6,
      controlNote: 'Contrôle : triangles centrés, ≤ 40 cm scotch',
    },
    {
      kind: 'assemble',
      label: 'Assembler le tablier sur les 4 supports',
      colorClass: 'bg-teal-600 text-white',
      durationMin: 4,
      controlNote: 'Contrôle : stabilité et centrage',
    },
    {
      kind: 'cake_3tiers',
      label: 'Monter la pièce montée 3 étages & symbolique',
      colorClass: 'bg-rose-600 text-white',
      durationMin: 7,
      controlNote: 'Contrôle : Kofi/Abénah + Kenya/Nigeria',
    },
    {
      kind: 'test_10s',
      label: 'Tester 5 pièces de 1 € pendant 10 secondes',
      colorClass: 'bg-purple-600 text-white',
      durationMin: 3,
      controlNote: 'Critère : ≥ 10 s sans effondrement',
    },
    {
      kind: 'adjust',
      label: 'Améliorer les plis / renforts si fléchissement',
      colorClass: 'bg-slate-700 text-white',
      durationMin: 3,
      controlNote: 'Action corrective ciblée',
    },
  ];

  function makePaletteItem(tpl: (typeof PALETTE_TEMPLATES)[number]): PaletteBlockItem {
    seqCounter += 1;
    return {
      id: `tpl-${tpl.kind}-${seqCounter}`,
      kind: tpl.kind,
      label: tpl.label,
      colorClass: tpl.colorClass,
      durationMin: tpl.durationMin,
      controlNote: tpl.controlNote,
    };
  }

  let paletteItems = $state<PaletteBlockItem[]>(PALETTE_TEMPLATES.map(makePaletteItem));
  let shouldIgnorePaletteDnd = $state(false);
  let isDraggingWorkspace = $state(false);
  let workspaceItems = $state<WorkspaceBlockItem[]>(appState.blockProgram.map((b) => ({ ...b })));
  let draftName = $state('');
  let isStepping = $state(false);
  let stepTimer: number | null = null;

  onDestroy(() => {
    stopStepExecution();
  });

  $effect(() => {
    const external = appState.blockProgram;
    if (!isDraggingWorkspace) {
      workspaceItems = external.map((b) => ({ ...b }));
    }
  });

  function blockColor(kind: ProcessBlockNode['kind']): string {
    return PALETTE_TEMPLATES.find((p) => p.kind === kind)?.colorClass ?? 'bg-slate-700 text-white';
  }

  function sanitizeBlock(item: WorkspaceBlockItem): ProcessBlockNode {
    return {
      id: item.id,
      kind: item.kind,
      label: item.label,
      durationMin: Number(item.durationMin) || 0,
      controlNote: item.controlNote || '',
    };
  }

  function commitWorkspace(items: WorkspaceBlockItem[]) {
    const clean = items
      .filter((item) => !(item as Record<string, unknown>)[SHADOW_ITEM_MARKER_PROPERTY_NAME])
      .map(sanitizeBlock);
    appState.blockProgram = clean;
    appState.saveToStorage();
  }

  function handlePaletteConsider(e: CustomEvent<DndEvent<PaletteBlockItem>>) {
    const { trigger, id } = e.detail.info;
    if (trigger === TRIGGERS.DRAG_STARTED) {
      const idx = paletteItems.findIndex((item) => item.id === id);
      const source = idx >= 0 ? paletteItems[idx] : undefined;
      const tpl = PALETTE_TEMPLATES.find((p) => p.kind === source?.kind);
      const cleanItems = e.detail.items.filter(
        (item) => !(item as Record<string, unknown>)[SHADOW_ITEM_MARKER_PROPERTY_NAME],
      );
      if (tpl && idx >= 0) {
        cleanItems.splice(idx, 0, makePaletteItem(tpl));
      }
      paletteItems = cleanItems;
      shouldIgnorePaletteDnd = true;
    } else if (!shouldIgnorePaletteDnd) {
      paletteItems = e.detail.items;
    } else {
      paletteItems = [...paletteItems];
    }
  }

  function handlePaletteFinalize(e: CustomEvent<DndEvent<PaletteBlockItem>>) {
    if (!shouldIgnorePaletteDnd) {
      paletteItems = e.detail.items;
    } else {
      paletteItems = [...paletteItems];
      shouldIgnorePaletteDnd = false;
    }
  }

  function handleWorkspaceConsider(e: CustomEvent<DndEvent<WorkspaceBlockItem>>) {
    isDraggingWorkspace = true;
    workspaceItems = e.detail.items;
  }

  function handleWorkspaceFinalize(e: CustomEvent<DndEvent<WorkspaceBlockItem>>) {
    isDraggingWorkspace = false;
    workspaceItems = e.detail.items;
    commitWorkspace(e.detail.items);
  }

  function addBlock(tpl: (typeof PALETTE_TEMPLATES)[number]) {
    seqCounter += 1;
    const newBlock: ProcessBlockNode = {
      id: `blk-${Date.now()}-${seqCounter}`,
      kind: tpl.kind,
      label: tpl.label,
      durationMin: tpl.durationMin,
      controlNote: tpl.controlNote,
    };
    const next = [...appState.blockProgram, newBlock];
    appState.blockProgram = next;
    workspaceItems = next.map((b) => ({ ...b }));
    appState.saveToStorage();
  }

  function removeBlock(id: string) {
    const next = appState.blockProgram.filter((b) => b.id !== id);
    appState.blockProgram = next;
    workspaceItems = next.map((b) => ({ ...b }));
    appState.saveToStorage();
  }

  function moveBlock(index: number, delta: -1 | 1) {
    const target = index + delta;
    if (target < 0 || target >= appState.blockProgram.length) return;
    const copy = [...appState.blockProgram];
    const [item] = copy.splice(index, 1);
    copy.splice(target, 0, item);
    appState.blockProgram = copy;
    workspaceItems = copy.map((b) => ({ ...b }));
    appState.saveToStorage();
  }

  function updateDuration(id: string, value: string) {
    const num = Math.max(1, Math.min(20, Number(value) || 1));
    const next = appState.blockProgram.map((b) => (b.id === id ? { ...b, durationMin: num } : b));
    appState.blockProgram = next;
    workspaceItems = next.map((b) => ({ ...b }));
    appState.saveToStorage();
  }

  function resetBlocks() {
    stopStepExecution();
    const defaults = getDefaultProcessBlocks(appState.studentInfo.niveau);
    appState.blockProgram = defaults;
    workspaceItems = defaults.map((b) => ({ ...b }));
    appState.saveToStorage();
  }

  function mapBlockToCyNode(kind: ProcessBlockNode['kind']): string {
    if (kind === 'sketch' || kind === 'pillars' || kind === 'deck_u' || kind === 'reinforce' || kind === 'assemble') {
      return 'measure';
    }
    if (kind === 'cake_3tiers') return 'load';
    if (kind === 'test_10s') return 'test';
    return appState.isBridgeCompliant ? 'ok' : 'improve';
  }

  function stopStepExecution() {
    if (stepTimer !== null) {
      window.clearInterval(stepTimer);
      stepTimer = null;
    }
    isStepping = false;
    appState.activeStepBlockId = null;
    appState.activeStepCyNode = null;
  }

  function toggleStepExecution() {
    if (isStepping) {
      stopStepExecution();
      return;
    }
    if (appState.blockProgram.length === 0) return;

    isStepping = true;
    let idx = 0;
    const applyStep = () => {
      const blocks = appState.blockProgram;
      if (idx >= blocks.length) {
        stopStepExecution();
        return;
      }
      const cur = blocks[idx];
      appState.activeStepBlockId = cur.id;
      appState.activeStepCyNode = mapBlockToCyNode(cur.kind);
      idx += 1;
    };

    applyStep();
    stepTimer = window.setInterval(applyStep, 900);
  }
</script>

<section class="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
  <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
    <div>
      <h3 class="text-base font-semibold text-slate-900 dark:text-slate-100">
        Séquenceur de Fabrication & Planification par Blocs (Glisser-Déposer)
      </h3>
      <p class="text-xs text-slate-600 dark:text-slate-400">
        {#if appState.studentInfo.niveau === '5e'}
          <strong>Parcours 5e (N3a) :</strong> Ordonnez les 4 grandes opérations de fabrication dans un ordre logique.
        {:else if appState.studentInfo.niveau === '4e'}
          <strong>Parcours 4e (N3a) :</strong> Répartissez exactement <strong class="text-amber-600 dark:text-amber-400">17 min</strong> entre les tâches et vérifiez l’ordre des opérations.
        {:else}
          <strong>Parcours 3e (N3a) :</strong> Associez chaque opération technique à son contrôle qualité (portée {appState.spanCm} cm, alignement, 10 s).
        {/if}
      </p>
    </div>
    <div class="flex flex-wrap items-center gap-2 shrink-0">
      <button
        type="button"
        onclick={toggleStepExecution}
        class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold cursor-pointer {isStepping
          ? 'bg-rose-600 hover:bg-rose-500 text-white'
          : 'bg-emerald-600 hover:bg-emerald-500 text-white'}"
      >
        {#if isStepping}
          <Square class="w-3.5 h-3.5" /> Arrêter
        {:else}
          <Play class="w-3.5 h-3.5" /> Pas à pas
        {/if}
      </button>
      <button
        type="button"
        onclick={() => (appState.subTab2 = 'logigramme')}
        class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
      >
        <GitBranch class="w-3.5 h-3.5 text-amber-500" />
        Voir Logigramme
      </button>
      <button
        type="button"
        onclick={resetBlocks}
        class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
      >
        <RotateCcw class="w-3.5 h-3.5" />
        Réinitialiser ({appState.studentInfo.niveau})
      </button>
    </div>
  </div>

  <!-- Draggable Palette -->
  <div class="space-y-1.5">
    <div class="text-xs font-semibold text-slate-600 dark:text-slate-400">Palette d’opérations et contrôles :</div>
    <div
      use:dndzone={{
        items: paletteItems,
        flipDurationMs,
        dropFromOthersDisabled: true,
        type: 'bridge-process-blocks',
        morphDisabled: true,
      }}
      onconsider={handlePaletteConsider}
      onfinalize={handlePaletteFinalize}
      aria-label="Palette d’opérations à glisser"
      class="flex flex-wrap gap-1.5 min-h-[40px]"
    >
      {#each paletteItems as tpl (tpl.id)}
        <div
          class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold shadow-xs cursor-grab active:cursor-grabbing select-none {tpl.colorClass}"
        >
          <GripVertical class="w-3 h-3 opacity-80" />
          <span>{tpl.label}</span>
          <button
            type="button"
            onclick={(e) => {
              e.stopPropagation();
              const match = PALETTE_TEMPLATES.find((p) => p.kind === tpl.kind);
              if (match) addBlock(match);
            }}
            title="Ajouter au processus"
            aria-label={`Ajouter ${tpl.label}`}
            class="ml-0.5 p-0.5 rounded bg-black/20 hover:bg-black/35 cursor-pointer"
          >
            <Plus class="w-3 h-3" />
          </button>
        </div>
      {/each}
    </div>
  </div>

  <!-- Assembly Workspace -->
  <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-300 dark:border-slate-700 space-y-2 text-xs">
    <div class="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-lg bg-slate-900 dark:bg-slate-800 text-white font-semibold">
      <span>DÉBUT PROCESSUS DIY · Objectif portée {appState.spanCm} cm · Niveau {appState.studentInfo.niveau}</span>
      <span
        class="font-mono tabular-nums px-2 py-0.5 rounded {appState.totalBlockDurationMin === 17
          ? 'bg-emerald-500 text-slate-950'
          : 'bg-amber-400 text-slate-950'}"
      >
        Total planifié : {appState.totalBlockDurationMin} min {appState.studentInfo.niveau === '4e' ? '(cible 17 min)' : ''}
      </span>
    </div>

    <div class="relative">
      {#if workspaceItems.length === 0}
        <div class="pointer-events-none absolute inset-0 flex items-center justify-center text-slate-500 dark:text-slate-400 text-xs">
          Déposez des étapes ici pour construire votre gamme de fabrication.
        </div>
      {/if}

      <div
        use:dndzone={{
          items: workspaceItems,
          flipDurationMs,
          type: 'bridge-process-blocks',
          dropTargetStyle: { outline: '2px dashed #f59e0b', borderRadius: '0.5rem' },
        }}
        onconsider={handleWorkspaceConsider}
        onfinalize={handleWorkspaceFinalize}
        aria-label="Gamme de fabrication ordonnée"
        class="min-h-[140px] space-y-2"
      >
        {#each workspaceItems as blk, i (blk.id)}
          {@const isStepActive = appState.activeStepBlockId === blk.id}
          <div
            animate:flip={{ duration: flipDurationMs }}
            class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 py-2.5 rounded-lg font-semibold cursor-grab active:cursor-grabbing select-none transition-all {blockColor(blk.kind)} {isStepActive ? 'ring-4 ring-yellow-300 scale-[1.01]' : ''}"
          >
            <div class="flex items-start gap-2 min-w-0">
              <GripVertical class="w-3.5 h-3.5 opacity-80 shrink-0 mt-0.5" />
              <div class="min-w-0">
                <div class="leading-snug">{i + 1}. {blk.label}</div>
                <div class="text-[11px] font-normal opacity-90">{blk.controlNote}</div>
              </div>
            </div>

            <div class="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
              <label class="inline-flex items-center gap-1 bg-black/20 px-1.5 py-0.5 rounded text-[11px]">
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={blk.durationMin}
                  oninput={(e) => updateDuration(blk.id, (e.target as HTMLInputElement).value)}
                  aria-label="Durée en minutes"
                  class="w-10 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded px-1 py-0.5 text-center font-bold tabular-nums"
                />
                <span>min</span>
              </label>
              <button
                type="button"
                onclick={() => moveBlock(i, -1)}
                title="Monter"
                aria-label="Monter l’étape"
                class="p-1 rounded bg-black/20 hover:bg-black/35 cursor-pointer"
              >
                <ArrowUp class="w-3 h-3" />
              </button>
              <button
                type="button"
                onclick={() => moveBlock(i, 1)}
                title="Descendre"
                aria-label="Descendre l’étape"
                class="p-1 rounded bg-black/20 hover:bg-black/35 cursor-pointer"
              >
                <ArrowDown class="w-3 h-3" />
              </button>
              <button
                type="button"
                onclick={() => removeBlock(blk.id)}
                title="Supprimer"
                aria-label="Supprimer l’étape"
                class="p-1 rounded bg-black/20 hover:bg-black/35 cursor-pointer"
              >
                <Trash2 class="w-3 h-3" />
              </button>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>

  <!-- Local Multi-Version Draft Manager -->
  <div class="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2 text-xs">
    <div class="flex flex-wrap items-center gap-2">
      <input
        type="text"
        bind:value={draftName}
        placeholder="Nom de variante (ex : Gamme 17 min 4e)"
        class="flex-grow min-w-[180px] bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-md px-2.5 py-1.5 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
      />
      <button
        type="button"
        onclick={() => {
          appState.saveProgramDraft(draftName);
          draftName = '';
        }}
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-semibold cursor-pointer"
      >
        <BookmarkPlus class="w-3.5 h-3.5" /> Enregistrer variante
      </button>
    </div>

    {#if appState.programDrafts.length > 0}
      <div class="flex flex-wrap gap-1.5">
        {#each appState.programDrafts as draft (draft.id)}
          <button
            type="button"
            onclick={() => appState.restoreProgramDraft(draft.id)}
            class="px-2.5 py-1 rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/50 hover:border-amber-300 dark:hover:border-amber-700 text-slate-700 dark:text-slate-200 font-medium cursor-pointer"
          >
            {draft.name} ({draft.spanCm} cm · {draft.savedAt})
          </button>
        {/each}
      </div>
    {/if}
  </div>
</section>
