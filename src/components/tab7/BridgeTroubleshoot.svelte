<script lang="ts">
  import { ArrowRight, Wrench } from 'lucide-svelte';
  import { TROUBLESHOOT_CASES } from '../../lib/data/pedagogyPlus';
  import { appState } from '../../lib/stores/appState.svelte';

  let selectedId = $state(TROUBLESHOOT_CASES[0].id);
  const current = $derived(
    TROUBLESHOOT_CASES.find((t) => t.id === selectedId) ?? TROUBLESHOOT_CASES[0],
  );

  function goToTab(tab: number) {
    appState.activeTab = tab;
    if (tab === 1) appState.subTab1 = '3d';
    else if (tab === 2) appState.subTab2 = 'sim';
    else if (tab === 3) appState.activeDiyStep = 4;
  }
</script>

<section class="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
  <div class="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
    <Wrench class="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
    <div>
      <h3 class="text-base font-semibold text-slate-900 dark:text-slate-100">
        Assistant de Dépannage Méthodique — Maquette Pont
      </h3>
      <p class="text-xs text-slate-600 dark:text-slate-400">
        Sélectionne le défaut observé lors du montage ou de l’essai de 10 s pour identifier la cause mécanique et la correction immédiate.
      </p>
    </div>
  </div>

  <div class="flex flex-wrap gap-2 text-xs">
    {#each TROUBLESHOOT_CASES as tc (tc.id)}
      <button
        type="button"
        onclick={() => (selectedId = tc.id)}
        class="px-3 py-1.5 rounded-lg border font-semibold cursor-pointer transition-colors text-left {selectedId === tc.id
          ? 'bg-amber-500 border-amber-600 text-slate-950'
          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'}"
      >
        {tc.symptom}
      </button>
    {/each}
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
    <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
      <div class="font-bold text-slate-900 dark:text-slate-100">Cause technique identifiée :</div>
      <p class="text-slate-700 dark:text-slate-300 leading-relaxed">{current.cause}</p>
    </div>
    <div class="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/35 border border-emerald-200 dark:border-emerald-800 space-y-2.5">
      <div class="font-bold text-emerald-950 dark:text-emerald-200">Action corrective recommandée :</div>
      <p class="text-emerald-900 dark:text-emerald-100 leading-relaxed font-medium">{current.remedy}</p>
      <div class="pt-1">
        <button
          type="button"
          onclick={() => goToTab(current.tabRef)}
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-semibold cursor-pointer"
        >
          Tester dans l’onglet {current.tabRef}
          <ArrowRight class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  </div>
</section>
