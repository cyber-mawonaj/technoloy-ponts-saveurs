<script lang="ts">
  import { CheckCircle2, HelpCircle, RotateCcw, Volume2, XCircle } from 'lucide-svelte';
  import type { GradeLevel } from '../../lib/data/curriculum';
  import { QUIZ_QUESTIONS } from '../../lib/data/pedagogyPlus';
  import { appState } from '../../lib/stores/appState.svelte';
  import { isSpeechAvailable, speakFrench } from '../../lib/utils/speech';

  let selectedLevel = $state<GradeLevel | 'Tous'>(appState.studentInfo.niveau);

  $effect(() => {
    selectedLevel = appState.studentInfo.niveau;
  });

  const visibleQuestions = $derived(
    selectedLevel === 'Tous'
      ? QUIZ_QUESTIONS
      : QUIZ_QUESTIONS.filter((q) => q.level === selectedLevel),
  );

  const scoreStats = $derived.by(() => {
    let answered = 0;
    let correct = 0;
    for (const q of visibleQuestions) {
      const choice = appState.quizAnswers[q.id];
      if (choice !== undefined) {
        answered += 1;
        if (choice === q.correctIndex) correct += 1;
      }
    }
    return { answered, correct, total: visibleQuestions.length };
  });

  function selectChoice(qid: string, idx: number) {
    appState.quizAnswers = { ...appState.quizAnswers, [qid]: idx };
    appState.saveToStorage();
  }

  function resetQuiz() {
    appState.quizAnswers = {};
    appState.saveToStorage();
  }
</script>

<section class="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
  <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
    <div class="flex items-center gap-2">
      <HelpCircle class="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
      <div>
        <h3 class="text-base font-semibold text-slate-900 dark:text-slate-100">Quiz Interactif Auto-Corrigé — Cycle 4</h3>
        <p class="text-xs text-slate-600 dark:text-slate-400">
          Vérifie tes connaissances sur le cahier des charges, la flexion et l’écoconception (sauvegardé hors ligne pour la Fiche Élève).
        </p>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <div class="inline-flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1 gap-1 text-xs">
        {#each ['Tous', '5e', '4e', '3e'] as lvl}
          <button
            type="button"
            onclick={() => (selectedLevel = lvl as GradeLevel | 'Tous')}
            class="px-2.5 py-1 rounded-md font-semibold cursor-pointer whitespace-nowrap shrink-0 {selectedLevel === lvl
              ? 'bg-white dark:bg-amber-500 text-slate-900 dark:text-slate-950 shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'}"
          >
            {lvl}
          </button>
        {/each}
      </div>

      <span class="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300 tabular-nums">
        Score : {scoreStats.correct} / {scoreStats.total}
      </span>

      <button
        type="button"
        onclick={resetQuiz}
        class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer whitespace-nowrap shrink-0"
      >
        <RotateCcw class="w-3.5 h-3.5" /> Effacer
      </button>
    </div>
  </div>

  <div class="space-y-4">
    {#each visibleQuestions as q (q.id)}
      {@const picked = appState.quizAnswers[q.id]}
      {@const isCorrect = picked === q.correctIndex}
      <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 space-y-2.5">
        <div class="flex items-start justify-between gap-2">
          <div>
            <span class="text-[11px] font-mono font-bold text-amber-700 dark:text-amber-400">{q.level} · {q.competency}</span>
            <h4 class="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{q.question}</h4>
          </div>
          {#if isSpeechAvailable()}
            <button
              type="button"
              onclick={() => speakFrench(`${q.question}. ${q.choices.join('. ')}`)}
              title="Lire la question à voix haute (EBEP)"
              class="p-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-amber-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer shrink-0"
              aria-label="Écouter la question"
            >
              <Volume2 class="w-3.5 h-3.5" />
            </button>
          {/if}
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {#each q.choices as choice, idx}
            {@const chosen = picked === idx}
            {@const showRight = picked !== undefined && idx === q.correctIndex}
            {@const showWrong = chosen && idx !== q.correctIndex}
            <button
              type="button"
              onclick={() => selectChoice(q.id, idx)}
              class="text-left p-2.5 rounded-lg border font-medium transition-colors cursor-pointer flex items-center justify-between gap-2 {showRight
                ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-400 dark:border-emerald-600 text-emerald-950 dark:text-emerald-100 font-semibold'
                : showWrong
                  ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-400 dark:border-rose-600 text-rose-950 dark:text-rose-100'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-600 text-slate-800 dark:text-slate-200'}"
            >
              <span>{choice}</span>
              {#if showRight}
                <CheckCircle2 class="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              {:else if showWrong}
                <XCircle class="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              {/if}
            </button>
          {/each}
        </div>

        {#if picked !== undefined}
          <div class="text-xs px-3 py-2 rounded-lg border {isCorrect ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200' : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-200'}">
            <strong>{isCorrect ? 'Bonne réponse :' : 'Correction :'}</strong> {q.explanation}
          </div>
        {/if}
      </div>
    {/each}
  </div>
</section>
