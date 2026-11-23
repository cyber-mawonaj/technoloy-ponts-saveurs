<script lang="ts">
  import { Check, ChevronDown, ChevronUp, ClipboardList, Copy, FileText, FolderKanban } from 'lucide-svelte';
  import { TEACHER_FICHES } from '../../lib/data/curriculum';
  import { appState } from '../../lib/stores/appState.svelte';
  import ClassCollector from './ClassCollector.svelte';

  let phaseFilter = $state<'Toutes' | 'Organisation & Sécurité' | 'Évaluations & Barèmes' | 'Différenciation & FabLab'>('Toutes');
  let openIds = $state<Record<string, boolean>>({ P1: true, P2: true, P3: false, P4: false });
  let copiedId = $state<string | null>(null);

  const PREP_ITEMS = [
    '3 feuilles blanches A4 (80 g/m²) et 2 tubes d’essuie-tout préparés par élève / binôme',
    'Ruban adhésif pré-mesuré ou coupé à 40 cm maximum par poste',
    'Gabarits de test 18 cm (et 22 cm pour défi 3e) tracés sur les tables avec 5 pièces de 1 € (ou 5 bouchons)',
    'Vérification sécurité : uniquement des ciseaux scolaires (aucun cutter, aucune colle chaude)',
    'Mode EBEP et bouton « Écouter » testés sur les tablettes / postes élèves',
  ];

  const filteredFiches = $derived(
    phaseFilter === 'Toutes' ? TEACHER_FICHES : TEACHER_FICHES.filter((f) => f.phase === phaseFilter),
  );

  function toggleCard(id: string) {
    openIds[id] = !openIds[id];
  }

  async function copyCommands(id: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      copiedId = id;
      appState.showToast(`Bloc ${id} copié dans le presse-papiers.`, 'success');
      window.setTimeout(() => {
        if (copiedId === id) copiedId = null;
      }, 2000);
    } catch {
      appState.showToast('Copie manuelle requise dans cet environnement.', 'error');
    }
  }
</script>

<div class="space-y-5">
  <!-- Clean Sub-Tab Navigation -->
  <div class="bg-white dark:bg-slate-900 rounded-xl p-2 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
    <div class="flex flex-wrap items-center gap-1.5 text-xs">
      <button
        type="button"
        onclick={() => (appState.subTab6 = 'prep')}
        class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer {appState.subTab6 === 'prep'
          ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950'
          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}"
      >
        <ClipboardList class="w-3.5 h-3.5" /> Checklist Préparation
      </button>
      <button
        type="button"
        onclick={() => (appState.subTab6 = 'collector')}
        class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer {appState.subTab6 === 'collector'
          ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950'
          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}"
      >
        <FolderKanban class="w-3.5 h-3.5" /> Collecteur Copies (CSV)
      </button>
      <button
        type="button"
        onclick={() => (appState.subTab6 = 'fiches')}
        class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer {appState.subTab6 === 'fiches'
          ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950'
          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}"
      >
        <FileText class="w-3.5 h-3.5" /> Fiches & Corrigés P1–P4
      </button>
    </div>

    <div class="px-3 text-xs text-slate-500 dark:text-slate-400 hidden md:block">
      Guide Enseignant · Fête de la Science 2026
    </div>
  </div>

  <!-- SUB-TAB 1: CHECKLIST -->
  {#if appState.subTab6 === 'prep'}
    <section class="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
      <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <h2 class="text-lg font-bold text-slate-900 dark:text-slate-100">Checklist Préparation Îlot DIY (avant séance)</h2>
          <p class="text-xs text-slate-600 dark:text-slate-400">Vérifie les 5 points de sécurité et de matériel avant le démarrage des 45 min.</p>
        </div>
        <span class="text-xs font-mono font-bold text-slate-700 dark:text-amber-400 tabular-nums">
          {Object.values(appState.teacherChecklist).filter(Boolean).length} / {PREP_ITEMS.length} validés
        </span>
      </div>
      <div class="space-y-2.5">
        {#each PREP_ITEMS as item, idx}
          <label class="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-200 cursor-pointer select-none p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <input
              type="checkbox"
              checked={!!appState.teacherChecklist[idx]}
              onchange={(e) => {
                appState.teacherChecklist[idx] = (e.target as HTMLInputElement).checked;
                appState.saveToStorage();
              }}
              class="w-4 h-4 accent-amber-500 rounded cursor-pointer"
            />
            <span class={appState.teacherChecklist[idx] ? 'line-through text-slate-400 dark:text-slate-500' : 'font-medium'}>{item}</span>
          </label>
        {/each}
      </div>
    </section>

  <!-- SUB-TAB 2: BATCH COLLECTOR -->
  {:else if appState.subTab6 === 'collector'}
    <ClassCollector />

  <!-- SUB-TAB 3: FICHES P1 - P4 -->
  {:else}
    <div class="space-y-4">
      <section class="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div class="text-xs font-semibold text-slate-700 dark:text-slate-300">Filtrer les fiches ressources (P1 à P4) :</div>
        <div class="inline-flex flex-wrap items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
          {#each ['Toutes', 'Organisation & Sécurité', 'Évaluations & Barèmes', 'Différenciation & FabLab'] as phase}
            <button
              type="button"
              onclick={() => (phaseFilter = phase as typeof phaseFilter)}
              class="px-2.5 py-1.5 rounded-md font-medium whitespace-nowrap cursor-pointer {phaseFilter === phase
                ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-amber-300 shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'}"
            >
              {phase}
            </button>
          {/each}
        </div>
      </section>

      <div class="space-y-3">
        {#each filteredFiches as fiche (fiche.id)}
          <section class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <button
              type="button"
              onclick={() => toggleCard(fiche.id)}
              class="w-full px-5 py-3.5 text-left flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
            >
              <div class="flex items-center gap-3 min-w-0">
                <span class="font-mono text-xs font-bold text-amber-700 dark:text-amber-400 shrink-0">{fiche.id}</span>
                <div class="min-w-0">
                  <div class="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{fiche.title}</div>
                  <div class="text-xs text-slate-500 dark:text-slate-400 truncate">{fiche.phase} · {fiche.summary}</div>
                </div>
              </div>
              {#if openIds[fiche.id]}
                <ChevronUp class="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
              {:else}
                <ChevronDown class="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
              {/if}
            </button>

            {#if openIds[fiche.id]}
              <div class="px-5 pb-4 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                {#if fiche.note}
                  <p class="text-xs text-amber-900 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/35 border border-amber-200 dark:border-amber-800/60 rounded-lg px-3 py-2">
                    {fiche.note}
                  </p>
                {/if}

                <div class="bg-slate-900 dark:bg-slate-950 rounded-lg p-3.5 border border-slate-800 space-y-2">
                  <div class="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Mémo Enseignant / Barème officiel</span>
                    <button
                      type="button"
                      onclick={() => copyCommands(fiche.id, fiche.commands)}
                      class="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold cursor-pointer"
                    >
                      {#if copiedId === fiche.id}
                        <Check class="w-3 h-3" /> Copié
                      {:else}
                        <Copy class="w-3 h-3" /> Copier
                      {/if}
                    </button>
                  </div>
                  <pre class="font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed whitespace-pre-wrap">{fiche.commands}</pre>
                </div>
              </div>
            {/if}
          </section>
        {/each}
      </div>
    </div>
  {/if}
</div>
