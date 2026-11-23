<script lang="ts">
  import {
    Award,
    BookOpen,
    CheckCircle2,
    CheckSquare,
    ClipboardCheck,
    HelpCircle,
    Lock,
    Search,
    Sparkles,
    Square,
  } from 'lucide-svelte';
  import {
    AUTOEVAL_OPTIONS,
    BILAN_SKILLS,
    GLOSSARY_ITEMS,
    GRID10_CRITERIA,
  } from '../../lib/data/pedagogyPlus';
  import { appState } from '../../lib/stores/appState.svelte';
  import BridgeTroubleshoot from './BridgeTroubleshoot.svelte';
  import RevisionQuiz from './RevisionQuiz.svelte';

  let searchQuery = $state('');
  let categoryFilter = $state<
    'Toutes' | 'Structure & Pont' | 'Mécanique & Matériaux' | 'Démarche DIY & FabLab'
  >('Toutes');

  const filteredGlossary = $derived(
    GLOSSARY_ITEMS.filter((item) => {
      const matchCat = categoryFilter === 'Toutes' || item.category === categoryFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchText =
        !q || item.term.toLowerCase().includes(q) || item.def.toLowerCase().includes(q);
      return matchCat && matchText;
    }),
  );

  const bilanPct = $derived(
    Math.round((appState.bilanCheckedCount / BILAN_SKILLS.length) * 100),
  );

  const unlockedCount = $derived(appState.unlockedBadges.filter((b) => b.unlocked).length);

  function toggleSkill(idx: number) {
    const next = [...appState.bilanSkills];
    next[idx] = !next[idx];
    appState.bilanSkills = next;
    appState.saveToStorage();
  }

  function updateGridScore(id: string, rawValue: string) {
    const num = Math.max(0, Math.min(2, Number(rawValue) || 0));
    appState.grid10Scores = { ...appState.grid10Scores, [id]: num };
    appState.saveToStorage();
  }
</script>

<div class="space-y-5">
  <!-- Compact Hero Summary Banner + Cycle 4 Achievement Badges -->
  <section class="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 dark:border-slate-700/80 space-y-4">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="space-y-1 max-w-2xl">
        <div class="text-xs font-medium text-amber-300">
          Fête de la Science 2026 · « Saveur savante » · Synthèse Cycle 4
        </div>
        <h2 class="text-xl font-bold tracking-tight">
          Bilan des Apprentissages, Autoévaluation & Révision
        </h2>
      </div>

      <div class="flex items-center gap-3 shrink-0">
        <div class="px-3.5 py-2 rounded-lg bg-slate-800 border border-slate-700 text-center">
          <div class="text-[11px] text-slate-400">Compétences</div>
          <div class="text-sm font-bold font-mono text-amber-300 tabular-nums">
            {appState.bilanCheckedCount} / {BILAN_SKILLS.length}
          </div>
        </div>
        <div class="px-3.5 py-2 rounded-lg bg-slate-800 border border-slate-700 text-center">
          <div class="text-[11px] text-slate-400">Grille travail</div>
          <div class="text-sm font-bold font-mono text-emerald-300 tabular-nums">
            {appState.grid10Total} / 10
          </div>
        </div>
        <div class="px-3.5 py-2 rounded-lg bg-slate-800 border border-slate-700 text-center">
          <div class="text-[11px] text-slate-400">Badges</div>
          <div class="text-sm font-bold font-mono text-sky-300 tabular-nums">
            {unlockedCount} / {appState.unlockedBadges.length}
          </div>
        </div>
      </div>
    </div>

    <!-- Cycle 4 Achievement Badges Row -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 pt-2 border-t border-slate-800">
      {#each appState.unlockedBadges as badge (badge.id)}
        <div
          class="px-3 py-2 rounded-lg border text-xs flex items-center gap-2 {badge.unlocked
            ? 'bg-emerald-950/60 border-emerald-600/60 text-emerald-100'
            : 'bg-slate-800/60 border-slate-700 text-slate-400'}"
        >
          {#if badge.unlocked}
            <CheckCircle2 class="w-4 h-4 text-emerald-400 shrink-0" />
          {:else}
            <Lock class="w-3.5 h-3.5 text-slate-500 shrink-0" />
          {/if}
          <span class="font-medium leading-tight">{badge.title}</span>
        </div>
      {/each}
    </div>
  </section>

  <!-- Clean Sub-Tab Navigation -->
  <div class="bg-white dark:bg-slate-900 rounded-xl p-2 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-1.5 text-xs">
    <button
      type="button"
      onclick={() => (appState.subTab7 = 'bilan')}
      class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 {appState.subTab7 === 'bilan'
        ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950'
        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}"
    >
      <ClipboardCheck class="w-3.5 h-3.5" /> Bilan (/9), Autoéval & Grille (/10)
    </button>
    <button
      type="button"
      onclick={() => (appState.subTab7 = 'quiz')}
      class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 {appState.subTab7 === 'quiz'
        ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950'
        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}"
    >
      <HelpCircle class="w-3.5 h-3.5" /> Quiz & Assistant Dépannage
    </button>
    <button
      type="button"
      onclick={() => (appState.subTab7 = 'glossaire')}
      class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 {appState.subTab7 === 'glossaire'
        ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950'
        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}"
    >
      <BookOpen class="w-3.5 h-3.5" /> Glossaire Cycle 4
    </button>
  </div>

  <!-- SUB-TAB 1: BILAN, AUTOEVAL & GRID/10 -->
  {#if appState.subTab7 === 'bilan'}
    <section class="grid grid-cols-1 lg:grid-cols-12 gap-5">
      <div class="lg:col-span-7 bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
        <div class="flex items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div class="flex items-center gap-2">
            <ClipboardCheck class="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <h3 class="text-base font-semibold text-slate-900 dark:text-slate-100">
                6. Bilan des Apprentissages (9 compétences)
              </h3>
              <p class="text-xs text-slate-600 dark:text-slate-400">
                Coche chaque savoir-faire validé durant le projet du Pont des Saveurs.
              </p>
            </div>
          </div>
          <span class="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 tabular-nums shrink-0">
            {bilanPct} %
          </span>
        </div>

        <div class="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            class="h-full bg-emerald-600 dark:bg-emerald-500 transition-all duration-200"
            style="width: {bilanPct}%"
          ></div>
        </div>

        <ul class="space-y-2 text-xs">
          {#each BILAN_SKILLS as skill, idx}
            {@const checked = Boolean(appState.bilanSkills[idx])}
            <li>
              <button
                type="button"
                onclick={() => toggleSkill(idx)}
                class="w-full text-left p-2.5 rounded-lg border transition-colors flex items-start gap-2.5 cursor-pointer {checked
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/35 border-emerald-200 dark:border-emerald-700/70 text-emerald-950 dark:text-emerald-100 font-medium'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}"
              >
                {#if checked}
                  <CheckSquare class="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                {:else}
                  <Square class="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
                {/if}
                <span>{idx + 1}. {skill}</span>
              </button>
            </li>
          {/each}
        </ul>
      </div>

      <div class="lg:col-span-5 space-y-5">
        <!-- 7. Autoévaluation -->
        <div class="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 space-y-3">
          <div class="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <Sparkles class="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <h3 class="text-base font-semibold text-slate-900 dark:text-slate-100">
                7. Autoévaluation de mon niveau
              </h3>
              <p class="text-xs text-slate-600 dark:text-slate-400">
                Choisis la phrase qui décrit le mieux ta maîtrise actuelle.
              </p>
            </div>
          </div>

          <div class="space-y-2 text-xs">
            {#each AUTOEVAL_OPTIONS as opt}
              {@const selected = appState.autoevalChoice === opt}
              <label
                class="flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-colors {selected
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 dark:border-amber-600 text-amber-950 dark:text-amber-100 font-semibold'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}"
              >
                <input
                  type="radio"
                  name="autoeval"
                  value={opt}
                  checked={selected}
                  onchange={() => {
                    appState.autoevalChoice = opt;
                    appState.saveToStorage();
                  }}
                  class="mt-0.5 accent-amber-600 dark:accent-amber-500"
                />
                <span>{opt}</span>
              </label>
            {/each}
          </div>
        </div>

        <!-- 8. Grille d'évaluation du travail (/10) -->
        <div class="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 space-y-3">
          <div class="flex items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div class="flex items-center gap-2">
              <Award class="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
              <h3 class="text-base font-semibold text-slate-900 dark:text-slate-100">
                8. Grille du travail (/10)
              </h3>
            </div>
            <span class="font-mono text-sm font-bold px-2.5 py-1 rounded-md bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 tabular-nums shrink-0">
              {appState.grid10Total} / 10
            </span>
          </div>

          <div class="space-y-2.5 text-xs">
            {#each GRID10_CRITERIA as crit (crit.id)}
              <div class="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <label for={`grid-${crit.id}`} class="text-slate-800 dark:text-slate-200 font-medium leading-snug">
                  {crit.label}
                </label>
                <div class="flex items-center gap-1.5 shrink-0">
                  <input
                    id={`grid-${crit.id}`}
                    type="number"
                    min="0"
                    max={crit.max}
                    step="0.5"
                    value={appState.grid10Scores[crit.id] ?? 0}
                    oninput={(e) => updateGridScore(crit.id, (e.target as HTMLInputElement).value)}
                    class="w-16 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-md px-2 py-1 text-center font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <span class="font-mono text-slate-500 dark:text-slate-400">/ {crit.max}</span>
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>
    </section>

  <!-- SUB-TAB 2: QUIZ & TROUBLESHOOT -->
  {:else if appState.subTab7 === 'quiz'}
    <div class="space-y-6">
      <RevisionQuiz />
      <BridgeTroubleshoot />
    </div>

  <!-- SUB-TAB 3: GLOSSAIRE CYCLE 4 -->
  {:else}
    <section class="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <h3 class="text-base font-semibold text-slate-900 dark:text-slate-100">Glossaire Interactif Cycle 4</h3>

        <div class="flex flex-wrap items-center gap-2">
          <div class="inline-flex flex-wrap rounded-lg bg-slate-100 dark:bg-slate-800 p-1 gap-1 text-xs">
            {#each ['Toutes', 'Structure & Pont', 'Mécanique & Matériaux', 'Démarche DIY & FabLab'] as cat}
              <button
                type="button"
                onclick={() => (categoryFilter = cat as typeof categoryFilter)}
                class="px-2.5 py-1 rounded-md font-medium cursor-pointer whitespace-nowrap shrink-0 {categoryFilter === cat
                  ? 'bg-white dark:bg-amber-500 text-slate-900 dark:text-slate-950 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'}"
              >
                {cat}
              </button>
            {/each}
          </div>

          <div class="relative w-full sm:w-60">
            <Search class="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              bind:value={searchQuery}
              placeholder="Filtrer un terme..."
              aria-label="Rechercher dans le glossaire"
              class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {#each filteredGlossary as item (item.term)}
          <article class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
            <div class="flex items-center justify-between gap-2">
              <h4 class="text-sm font-bold text-amber-800 dark:text-amber-300">{item.term}</h4>
              <span class="text-[11px] text-slate-500 dark:text-slate-400">{item.category}</span>
            </div>
            <p class="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{item.def}</p>
          </article>
        {/each}
      </div>
    </section>
  {/if}
</div>
