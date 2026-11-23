<script lang="ts">
  import {
    ArrowLeft,
    ArrowRight,
    CheckCheck,
    CheckCircle2,
    Download,
    FileDown,
    KeyRound,
    Volume2,
  } from 'lucide-svelte';
  import type { GradeLevel } from '../../lib/data/curriculum';
  import { appState } from '../../lib/stores/appState.svelte';
  import { generateStudentSheetPdf } from '../../lib/utils/pdfExport';
  import { isSpeechAvailable, speakFrench } from '../../lib/utils/speech';

  let isGeneratingPdf = $state(false);
  const canSpeak = isSpeechAvailable();

  const TIERS = [
    { id: 'N1', label: 'N1 · Connaissance', pts: '5 pts' },
    { id: 'N2', label: 'N2 · Compréhension', pts: '5 pts' },
    { id: 'N3', label: 'N3 · Application', pts: '5 pts' },
    { id: 'N4', label: 'N4 · Maîtrise', pts: '5 pts' },
  ] as const;

  const level = $derived(appState.studentInfo.niveau);
  const currentScore = $derived(appState.lastEvalScore[level]);
  const sum4eTime = $derived(
    Number(appState.eval4e.t1) +
      Number(appState.eval4e.t2) +
      Number(appState.eval4e.t3) +
      Number(appState.eval4e.t4),
  );

  const tierIndex = $derived(TIERS.findIndex((t) => t.id === appState.evalTier));

  function tierStarted(tier: 'N1' | 'N2' | 'N3' | 'N4'): boolean {
    if (level === '5e') {
      const e = appState.eval5e;
      if (tier === 'N1') return Boolean(e.n1a_1 && e.n1b_1);
      if (tier === 'N2') return Boolean(e.n2a && e.n2b);
      if (tier === 'N3') return e.n3b_checked;
      return Boolean(e.n4a || e.n4b_text.trim());
    }
    if (level === '4e') {
      const e = appState.eval4e;
      if (tier === 'N1') return Boolean(e.n1a_1 && e.n1b);
      if (tier === 'N2') return Boolean(e.n2a_choice || e.n2b_exp.trim());
      if (tier === 'N3') return sum4eTime === 17 && Boolean(e.n3b_proto.trim());
      return Boolean(e.n4a_proto || e.n4b_choice);
    }
    const e = appState.eval3e;
    if (tier === 'N1') return Boolean(e.n1a_dist.trim() && e.n1b_pliage);
    if (tier === 'N2') return Boolean(e.n2a_eco.trim() || e.n2b_valid);
    if (tier === 'N3') return Boolean(e.n3a_proc.trim() || e.n3b_proto.trim());
    return Boolean(e.n4a_justif.trim() || e.n4b_22cm.trim());
  }

  function prevTier() {
    if (tierIndex > 0) appState.evalTier = TIERS[tierIndex - 1].id;
  }

  function nextTier() {
    if (tierIndex < TIERS.length - 1) appState.evalTier = TIERS[tierIndex + 1].id;
  }

  function save() {
    appState.saveToStorage();
  }

  function switchLevel(lvl: GradeLevel) {
    appState.syncNiveau(lvl);
  }

  function gradeNow() {
    const score = appState.computeEvalScore(level);
    appState.profMode = true;
    appState.showToast(`Correction affichée · Score estimé (${level}) : ${score} / 20`, 'success');
  }

  async function handleGeneratePdf() {
    if (isGeneratingPdf) return;
    isGeneratingPdf = true;
    try {
      await generateStudentSheetPdf();
    } finally {
      isGeneratingPdf = false;
    }
  }
</script>

<div class="space-y-5">
  <!-- Header, Level Switcher & Tier Stepper -->
  <section class="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div>
        <div class="text-xs font-semibold text-amber-700 dark:text-amber-400">
          Évaluations Différenciées · Cycle 4 (Paliers N1 à N4 · /20 points)
        </div>
        <h2 class="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
          Évaluation Officielle — Niveau {level}
        </h2>
        <p class="text-xs text-slate-600 dark:text-slate-400">
          {level === '5e'
            ? 'Compétences CCRI1, CCRI2, SFC1 · Durée indicative 25–30 min'
            : level === '4e'
              ? 'Compétences CCRI11, CCRI13, CCRI17, CCRI22, CCRI23, SFC13 · Durée indicative 30–35 min'
              : 'Compétences CCRI11–23, SFC1.2.3a (Écoconception & 22 cm) · Durée indicative 35–40 min'}
        </p>
      </div>

      <div class="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
        {#each (['5e', '4e', '3e'] as const) as lvl}
          <button
            type="button"
            onclick={() => switchLevel(lvl)}
            class="px-4 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer {level === lvl
              ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'}"
          >
            Sujet {lvl}
          </button>
        {/each}
      </div>
    </div>

    <!-- Tier Stepper Tabs (N1 -> N2 -> N3 -> N4) -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
      {#each TIERS as t}
        {@const active = appState.evalTier === t.id}
        {@const done = tierStarted(t.id)}
        <button
          type="button"
          onclick={() => (appState.evalTier = t.id)}
          class="p-2.5 rounded-xl border text-left transition-colors cursor-pointer {active
            ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/50 text-amber-950 dark:text-amber-200'
            : done
              ? 'border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/30 text-slate-800 dark:text-slate-100 hover:bg-emerald-50 dark:hover:bg-emerald-950/50'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-300'}"
        >
          <div class="flex items-center justify-between text-[11px] font-mono font-semibold {active ? 'text-amber-700 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'}">
            <span>{t.pts}</span>
            {#if done}
              <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            {/if}
          </div>
          <div class="text-xs font-bold mt-0.5">{t.label}</div>
        </button>
      {/each}
    </div>

    <!-- Action Bar & Score -->
    <div class="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 no-print">
      <span class="px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 font-mono text-xs font-bold text-amber-950 dark:text-amber-300 tabular-nums">
        Note estimée ({level}) : {currentScore !== null ? `${currentScore} / 20` : '-- / 20'}
      </span>

      <div class="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onclick={gradeNow}
          class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
        >
          <CheckCheck class="w-3.5 h-3.5" /> Corriger & Voir le barème
        </button>

        <button
          type="button"
          onclick={() => (appState.profMode = !appState.profMode)}
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer {appState.profMode
            ? 'bg-amber-500 border-amber-500 text-slate-950'
            : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'}"
        >
          <KeyRound class="w-3.5 h-3.5" /> {appState.profMode ? 'Masquer Corrigé' : 'Mode Prof'}
        </button>

        <button
          type="button"
          onclick={handleGeneratePdf}
          disabled={isGeneratingPdf}
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-400 disabled:opacity-60 text-white dark:text-slate-950 text-xs font-semibold cursor-pointer"
        >
          <FileDown class="w-3.5 h-3.5" /> {isGeneratingPdf ? 'PDF…' : 'PDF A4'}
        </button>

        <button
          type="button"
          onclick={() => appState.exportStudentJSON()}
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer"
        >
          <Download class="w-3.5 h-3.5" /> JSON
        </button>
      </div>
    </div>
  </section>

  <!-- ==================== SUJET 5e ==================== -->
  {#if level === '5e'}
    {#if appState.evalTier === 'N1'}
      <section class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <h3 class="text-sm font-bold text-sky-800 dark:text-sky-400">N1 · CONNAISSANCE (5 pts)</h3>
          {#if canSpeak}
            <button type="button" onclick={() => speakFrench('N1a : Relie chaque élément du pont à sa définition. N1b : Complète avec papier, carton, pliage ou assemblage.')} class="text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white inline-flex items-center gap-1 cursor-pointer">
              <Volume2 class="w-3.5 h-3.5" /> Écouter
            </button>
          {/if}
        </div>

        <div class="space-y-2 text-xs">
          <p class="font-bold text-slate-800 dark:text-slate-100">N1a — Relie chaque élément constitutif du pont à sa définition (2,5 pts) :</p>
          <div class="flex flex-wrap items-center justify-between gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded-lg">
            <span class="font-semibold text-slate-900 dark:text-slate-100">1. Tablier</span>
            <select bind:value={appState.eval5e.n1a_1} onchange={save} class="border border-slate-300 dark:border-slate-700 rounded px-2 py-1 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
              <option value="">-- Choisir --</option>
              <option value="A">A. Éléments qui soutiennent le pont</option>
              <option value="B">B. Partie horizontale du pont</option>
              <option value="C">C. Éléments qui améliorent la résistance</option>
            </select>
          </div>
          <div class="flex flex-wrap items-center justify-between gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded-lg">
            <span class="font-semibold text-slate-900 dark:text-slate-100">2. Piles (Supports)</span>
            <select bind:value={appState.eval5e.n1a_2} onchange={save} class="border border-slate-300 dark:border-slate-700 rounded px-2 py-1 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
              <option value="">-- Choisir --</option>
              <option value="A">A. Éléments qui soutiennent le pont</option>
              <option value="B">B. Partie horizontale du pont</option>
              <option value="C">C. Éléments qui améliorent la résistance</option>
            </select>
          </div>
          <div class="flex flex-wrap items-center justify-between gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded-lg">
            <span class="font-semibold text-slate-900 dark:text-slate-100">3. Renforts</span>
            <select bind:value={appState.eval5e.n1a_3} onchange={save} class="border border-slate-300 dark:border-slate-700 rounded px-2 py-1 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
              <option value="">-- Choisir --</option>
              <option value="A">A. Éléments qui soutiennent le pont</option>
              <option value="B">B. Partie horizontale du pont</option>
              <option value="C">C. Éléments qui améliorent la résistance</option>
            </select>
          </div>
        </div>

        <div class="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <p class="font-bold text-slate-800 dark:text-slate-100">N1b — Complète avec : carton, papier, pliage, assemblage (2,5 pts) :</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label for="e5n1b1" class="text-slate-600 dark:text-slate-300 block mb-1">Feuilles A4 fabriquées en :</label>
              <select id="e5n1b1" bind:value={appState.eval5e.n1b_1} onchange={save} class="w-full border border-slate-300 dark:border-slate-700 rounded p-2 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
                <option value="">--</option><option value="papier">papier</option><option value="carton">carton</option><option value="pliage">pliage</option><option value="assemblage">assemblage</option>
              </select>
            </div>
            <div>
              <label for="e5n1b2" class="text-slate-600 dark:text-slate-300 block mb-1">Tubes d’essuie-tout en :</label>
              <select id="e5n1b2" bind:value={appState.eval5e.n1b_2} onchange={save} class="w-full border border-slate-300 dark:border-slate-700 rounded p-2 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
                <option value="">--</option><option value="papier">papier</option><option value="carton">carton</option><option value="pliage">pliage</option><option value="assemblage">assemblage</option>
              </select>
            </div>
            <div>
              <label for="e5n1b3" class="text-slate-600 dark:text-slate-300 block mb-1">Pour renforcer le tablier :</label>
              <select id="e5n1b3" bind:value={appState.eval5e.n1b_3} onchange={save} class="w-full border border-slate-300 dark:border-slate-700 rounded p-2 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
                <option value="">--</option><option value="papier">papier</option><option value="carton">carton</option><option value="pliage">pliage</option><option value="assemblage">assemblage</option>
              </select>
            </div>
            <div>
              <label for="e5n1b4" class="text-slate-600 dark:text-slate-300 block mb-1">Pour fixer les éléments :</label>
              <select id="e5n1b4" bind:value={appState.eval5e.n1b_4} onchange={save} class="w-full border border-slate-300 dark:border-slate-700 rounded p-2 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
                <option value="">--</option><option value="papier">papier</option><option value="carton">carton</option><option value="pliage">pliage</option><option value="assemblage">assemblage</option>
              </select>
            </div>
          </div>
        </div>
      </section>
    {:else if appState.evalTier === 'N2'}
      <section class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
        <div class="border-b border-slate-100 dark:border-slate-800 pb-2">
          <h3 class="text-sm font-bold text-emerald-800 dark:text-emerald-400">N2 · COMPRÉHENSION (5 pts)</h3>
        </div>

        <div class="space-y-2">
          <p class="font-bold text-slate-800 dark:text-slate-100">N2a — Intérêt du pliage du papier (2,5 pts) :</p>
          <p class="text-slate-600 dark:text-slate-400">Quelle forme résiste mieux à la déformation lorsqu’on la charge ?</p>
          <div class="flex flex-wrap gap-4 text-slate-800 dark:text-slate-200">
            <label class="flex items-center gap-1.5 cursor-pointer">
              <input type="radio" name="e5n2a" value="A" bind:group={appState.eval5e.n2a} onchange={save} class="accent-amber-500" /> Forme A : feuille plate
            </label>
            <label class="flex items-center gap-1.5 cursor-pointer">
              <input type="radio" name="e5n2a" value="B" bind:group={appState.eval5e.n2a} onchange={save} class="accent-amber-500" /> Forme B : feuille pliée en U
            </label>
          </div>
          <input type="text" bind:value={appState.eval5e.n2a_justif} oninput={save} placeholder="Explique ton choix en une phrase..." class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500" />
        </div>

        <div class="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <p class="font-bold text-slate-800 dark:text-slate-100">N2b — Rôle des supports en carton (2,5 pts) :</p>
          <div class="space-y-1.5 text-slate-800 dark:text-slate-200">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="e5n2b" value="deco" bind:group={appState.eval5e.n2b} onchange={save} class="accent-amber-500" /> Pour décorer le pont uniquement.
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="e5n2b" value="soutenir" bind:group={appState.eval5e.n2b} onchange={save} class="accent-amber-500" /> Pour soutenir le tablier et transmettre les charges vers les appuis.
            </label>
          </div>
          <input type="text" bind:value={appState.eval5e.n2b_justif} oninput={save} placeholder="Explique avec tes mots..." class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500" />
        </div>
      </section>
    {:else if appState.evalTier === 'N3'}
      <section class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
        <div class="border-b border-slate-100 dark:border-slate-800 pb-2">
          <h3 class="text-sm font-bold text-amber-800 dark:text-amber-400">N3 · APPLICATION (5 pts)</h3>
        </div>

        <div class="space-y-2">
          <p class="font-bold text-slate-800 dark:text-slate-100">N3a — Remets les étapes de fabrication dans l’ordre de 1 à 4 (2,5 pts) :</p>
          <div class="space-y-1.5 text-slate-800 dark:text-slate-200">
            <div class="flex items-center justify-between bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded-lg">
              <span>Assembler le tablier et les supports</span>
              <input type="number" min="1" max="4" bind:value={appState.eval5e.n3a_assemble} onchange={save} class="w-14 border border-slate-300 dark:border-slate-700 rounded p-1 text-center font-bold bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 tabular-nums" />
            </div>
            <div class="flex items-center justify-between bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded-lg">
              <span>Réaliser le croquis</span>
              <input type="number" min="1" max="4" bind:value={appState.eval5e.n3a_croquis} onchange={save} class="w-14 border border-slate-300 dark:border-slate-700 rounded p-1 text-center font-bold bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 tabular-nums" />
            </div>
            <div class="flex items-center justify-between bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded-lg">
              <span>Préparer et plier le papier</span>
              <input type="number" min="1" max="4" bind:value={appState.eval5e.n3a_plier} onchange={save} class="w-14 border border-slate-300 dark:border-slate-700 rounded p-1 text-center font-bold bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 tabular-nums" />
            </div>
            <div class="flex items-center justify-between bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded-lg">
              <span>Tester la stabilité du pont</span>
              <input type="number" min="1" max="4" bind:value={appState.eval5e.n3a_tester} onchange={save} class="w-14 border border-slate-300 dark:border-slate-700 rounded p-1 text-center font-bold bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 tabular-nums" />
            </div>
          </div>
        </div>

        <div class="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <p class="font-bold text-slate-800 dark:text-slate-100">N3b — Appliquer le protocole de test (2,5 pts) :</p>
          <label class="flex items-center gap-2 cursor-pointer text-slate-800 dark:text-slate-200">
            <input type="checkbox" bind:checked={appState.eval5e.n3b_checked} onchange={save} class="w-4 h-4 accent-amber-500 rounded" />
            <span>J’ai renseigné le tableau de vérification après l’essai de 10 secondes (5 pièces).</span>
          </label>
        </div>
      </section>
    {:else}
      <section class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
        <div class="border-b border-slate-100 dark:border-slate-800 pb-2">
          <h3 class="text-sm font-bold text-purple-800 dark:text-purple-400">N4 · MAÎTRISE (5 pts)</h3>
        </div>

        <div class="space-y-2">
          <p class="font-bold text-slate-800 dark:text-slate-100">N4a — Le milieu du tablier se courbe. Quelle solution choisir ? (2,5 pts)</p>
          <div class="space-y-1.5 text-slate-800 dark:text-slate-200">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="e5n4a" value="retirer" bind:group={appState.eval5e.n4a} onchange={save} class="accent-amber-500" /> Retirer les renforts.
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="e5n4a" value="ajouter" bind:group={appState.eval5e.n4a} onchange={save} class="accent-amber-500" /> Ajouter un pli de renforcement sous le tablier.
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="e5n4a" value="supprimer" bind:group={appState.eval5e.n4a} onchange={save} class="accent-amber-500" /> Supprimer un support.
            </label>
          </div>
          <input type="text" bind:value={appState.eval5e.n4a_justif} oninput={save} placeholder="Explique pourquoi ta solution améliore le pont..." class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500" />
        </div>

        <div class="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <p class="font-bold text-slate-800 dark:text-slate-100">N4b — Vérifier le cahier des charges et proposer une amélioration (2,5 pts) :</p>
          <textarea rows="3" bind:value={appState.eval5e.n4b_text} oninput={save} placeholder="Exigence à améliorer et comment procéder..." class="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"></textarea>
        </div>
      </section>
    {/if}

    {#if appState.profMode}
      <section class="bg-emerald-50 dark:bg-emerald-950/35 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-5 space-y-1.5 text-xs text-emerald-950 dark:text-emerald-200">
        <h4 class="font-bold text-sm text-emerald-900 dark:text-emerald-300">Corrigé & Barème Officiel — 5e (/20)</h4>
        <p><strong>N1a (2,5 pts) :</strong> 1-B (Tablier) ; 2-A (Piles) ; 3-C (Renforts).</p>
        <p><strong>N1b (2,5 pts) :</strong> Papier ; carton ; pliage ; assemblage.</p>
        <p><strong>N2a & N2b (5 pts) :</strong> Forme B (pliée en U) car les bords relevés rigidifient ; les supports soutiennent le tablier et transmettent les charges aux appuis.</p>
        <p><strong>N3a & N3b (5 pts) :</strong> 1 Croquis · 2 Préparer/plier · 3 Assembler · 4 Tester ; protocole 10 s complété.</p>
        <p><strong>N4a & N4b (5 pts) :</strong> Ajouter un pli/renfort sous le centre + amélioration argumentée d’un critère du cahier des charges.</p>
      </section>
    {/if}

  <!-- ==================== SUJET 4e ==================== -->
  {:else if level === '4e'}
    {#if appState.evalTier === 'N1'}
      <section class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
        <div class="border-b border-slate-100 dark:border-slate-800 pb-2">
          <h3 class="text-sm font-bold text-sky-800 dark:text-sky-400">N1 · CONNAISSANCE (5 pts)</h3>
        </div>
        <div class="space-y-2">
          <p class="font-bold text-slate-800 dark:text-slate-100">N1a — Caractéristiques des matériaux (2,5 pts) :</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg space-y-2">
              <span class="font-bold block text-slate-900 dark:text-slate-100">Papier A4</span>
              <select bind:value={appState.eval4e.n1a_1} onchange={save} class="w-full border border-slate-300 dark:border-slate-700 rounded p-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                <option value="">Utilisation...</option><option value="tablier">Tablier</option><option value="support">Support</option>
              </select>
              <select bind:value={appState.eval4e.n1a_2} onchange={save} class="w-full border border-slate-300 dark:border-slate-700 rounded p-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                <option value="">Caractéristique...</option><option value="leger">Léger / Pliable</option><option value="rigidite">Rigidité en compression</option>
              </select>
            </div>
            <div class="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg space-y-2">
              <span class="font-bold block text-slate-900 dark:text-slate-100">Carton du tube</span>
              <select bind:value={appState.eval4e.n1a_3} onchange={save} class="w-full border border-slate-300 dark:border-slate-700 rounded p-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                <option value="">Utilisation...</option><option value="support">Support</option><option value="tablier">Tablier</option>
              </select>
              <select bind:value={appState.eval4e.n1a_4} onchange={save} class="w-full border border-slate-300 dark:border-slate-700 rounded p-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                <option value="">Caractéristique...</option><option value="rigidite">Rigidité</option><option value="leger">Léger</option>
              </select>
            </div>
          </div>
        </div>

        <div class="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <p class="font-bold text-slate-800 dark:text-slate-100">N1b — Mode de sollicitation mécanique du tablier sous les 5 pièces (2,5 pts) :</p>
          <div class="flex flex-wrap gap-4 text-slate-800 dark:text-slate-200">
            <label class="flex items-center gap-1.5 cursor-pointer"><input type="radio" name="e4n1b" value="compression" bind:group={appState.eval4e.n1b} onchange={save} class="accent-amber-500" /> Compression</label>
            <label class="flex items-center gap-1.5 cursor-pointer"><input type="radio" name="e4n1b" value="flexion" bind:group={appState.eval4e.n1b} onchange={save} class="accent-amber-500" /> Flexion</label>
            <label class="flex items-center gap-1.5 cursor-pointer"><input type="radio" name="e4n1b" value="torsion" bind:group={appState.eval4e.n1b} onchange={save} class="accent-amber-500" /> Torsion</label>
          </div>
          <input type="text" bind:value={appState.eval4e.n1b_def} oninput={save} placeholder="Définis ce terme avec tes mots..." class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500" />
        </div>
      </section>
    {:else if appState.evalTier === 'N2'}
      <section class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
        <div class="border-b border-slate-100 dark:border-slate-800 pb-2">
          <h3 class="text-sm font-bold text-emerald-800 dark:text-emerald-400">N2 · COMPRÉHENSION (5 pts)</h3>
        </div>
        <div class="space-y-2">
          <p class="font-bold text-slate-800 dark:text-slate-100">N2a — Comparer deux formes de tablier (A : plate vs B : pliée en U) (2,5 pts) :</p>
          <select bind:value={appState.eval4e.n2a_choice} onchange={save} class="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
            <option value="">Quelle solution est la plus résistante à la flexion ?</option>
            <option value="A">Solution A (Feuille plate)</option>
            <option value="B">Solution B (Feuille pliée en U avec bords relevés)</option>
          </select>
          <input type="text" bind:value={appState.eval4e.n2a_exp} oninput={save} placeholder="Quelle caractéristique géométrique explique cette différence ?" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500" />
        </div>

        <div class="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <p class="font-bold text-slate-800 dark:text-slate-100">N2b — Relation entre matériau, forme et résistance (2,5 pts) :</p>
          <textarea rows="3" bind:value={appState.eval4e.n2b_exp} oninput={save} placeholder="Explique pourquoi matériaux et formes doivent être adaptés à la fonction de chaque élément..." class="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"></textarea>
        </div>
      </section>
    {:else if appState.evalTier === 'N3'}
      <section class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
        <div class="border-b border-slate-100 dark:border-slate-800 pb-2">
          <h3 class="text-sm font-bold text-amber-800 dark:text-amber-400">N3 · APPLICATION (5 pts)</h3>
        </div>
        <div class="space-y-2">
          <p class="font-bold text-slate-800 dark:text-slate-100">N3a — Planifier la fabrication en 17 minutes exactes (2,5 pts) :</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-slate-800 dark:text-slate-200">
            <div class="flex items-center justify-between bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded">
              <span>1. Préparer & tracer</span>
              <input type="number" min="1" max="15" bind:value={appState.eval4e.t1} oninput={save} class="w-14 border border-slate-300 dark:border-slate-700 rounded text-center font-bold bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-1 tabular-nums" />
            </div>
            <div class="flex items-center justify-between bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded">
              <span>2. Supports carton</span>
              <input type="number" min="1" max="15" bind:value={appState.eval4e.t2} oninput={save} class="w-14 border border-slate-300 dark:border-slate-700 rounded text-center font-bold bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-1 tabular-nums" />
            </div>
            <div class="flex items-center justify-between bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded">
              <span>3. Tablier & renforts</span>
              <input type="number" min="1" max="15" bind:value={appState.eval4e.t3} oninput={save} class="w-14 border border-slate-300 dark:border-slate-700 rounded text-center font-bold bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-1 tabular-nums" />
            </div>
            <div class="flex items-center justify-between bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded">
              <span>4. Assembler</span>
              <input type="number" min="1" max="15" bind:value={appState.eval4e.t4} oninput={save} class="w-14 border border-slate-300 dark:border-slate-700 rounded text-center font-bold bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-1 tabular-nums" />
            </div>
          </div>
          <div class="text-right font-mono font-bold tabular-nums {sum4eTime === 17 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}">
            Total planifié : {sum4eTime} / 17 min
          </div>
          <input type="text" bind:value={appState.eval4e.n3a_justif} oninput={save} placeholder="Justifie l’ordre choisi..." class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500" />
        </div>

        <div class="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <p class="font-bold text-slate-800 dark:text-slate-100">N3b — Proposer les étapes du protocole de test et le critère de validation (2,5 pts) :</p>
          <textarea rows="3" bind:value={appState.eval4e.n3b_proto} oninput={save} placeholder="1. Mesurer 18 cm 2. Poser 5 pièces au centre 3. Chronométrer 10 s..." class="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"></textarea>
        </div>
      </section>
    {:else}
      <section class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
        <div class="border-b border-slate-100 dark:border-slate-800 pb-2">
          <h3 class="text-sm font-bold text-purple-800 dark:text-purple-400">N4 · MAÎTRISE (5 pts)</h3>
        </div>
        <div class="space-y-2">
          <p class="font-bold text-slate-800 dark:text-slate-100">N4a — Analyser un essai (Pont A : 4 s vs Pont B : 12 s) (2,5 pts) :</p>
          <select bind:value={appState.eval4e.n4a_proto} onchange={save} class="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
            <option value="">Quel prototype respecte l’exigence de 10 secondes ?</option>
            <option value="A">Prototype Pont A (4 secondes)</option>
            <option value="B">Prototype Pont B (12 secondes)</option>
          </select>
          <input type="text" bind:value={appState.eval4e.n4a_justif} oninput={save} placeholder="Justifie avec les données (12 s > 10 s)..." class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500" />
        </div>

        <div class="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <p class="font-bold text-slate-800 dark:text-slate-100">N4b — Comparer Solution A (feuille plate) vs B (renfort triangulaire) et papier vs carton (2,5 pts) :</p>
          <select bind:value={appState.eval4e.n4b_choice} onchange={save} class="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
            <option value="">Mon choix de solution pour améliorer le pont :</option>
            <option value="A">Solution A : feuille supplémentaire à plat</option>
            <option value="B">Solution B : feuille pliée en renfort triangulaire</option>
          </select>
          <textarea rows="3" bind:value={appState.eval4e.n4b_justif} oninput={save} placeholder="Justifie ton choix et compare les propriétés mécaniques du papier et du carton..." class="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"></textarea>
        </div>
      </section>
    {/if}

    {#if appState.profMode}
      <section class="bg-emerald-50 dark:bg-emerald-950/35 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-5 space-y-1.5 text-xs text-emerald-950 dark:text-emerald-200">
        <h4 class="font-bold text-sm text-emerald-900 dark:text-emerald-300">Corrigé & Barème Officiel — 4e (/20)</h4>
        <p><strong>N1a (2,5 pts) :</strong> Papier A4 -> Tablier (léger, pliable) · Carton du tube -> Support (rigidité).</p>
        <p><strong>N1b (2,5 pts) :</strong> Flexion : courbure d’un élément sous une charge perpendiculaire à son axe.</p>
        <p><strong>N2a & N2b (5 pts) :</strong> Solution B (U) ; l’élévation des bords augmente la rigidité géométrique ; adaptation matériau/forme aux efforts.</p>
        <p><strong>N3a & N3b (5 pts) :</strong> Total exact 17 min justifié + protocole 18 cm / 5 pièces / 10 s / critère non-effondrement.</p>
        <p><strong>N4a & N4b (5 pts) :</strong> Prototype B (12 s &gt; 10 s). Solution B (triangulation) plus rigide à quantité de matière égale ; carton rigide en compression, papier léger mis en forme par pliage.</p>
      </section>
    {/if}

  <!-- ==================== SUJET 3e ==================== -->
  {:else}
    {#if appState.evalTier === 'N1'}
      <section class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
        <div class="border-b border-slate-100 dark:border-slate-800 pb-2">
          <h3 class="text-sm font-bold text-sky-800 dark:text-sky-400">N1 · CONNAISSANCE (5 pts)</h3>
        </div>
        <div class="space-y-2">
          <p class="font-bold text-slate-800 dark:text-slate-100">N1a — Identifier les exigences du cahier des charges (2,5 pts) :</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <input type="text" bind:value={appState.eval3e.n1a_dist} oninput={save} placeholder="Distance à franchir (ex : 18 cm)" class="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg p-2" />
            <input type="text" bind:value={appState.eval3e.n1a_pieces} oninput={save} placeholder="Nombre de pièces (ex : 5)" class="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg p-2" />
            <input type="text" bind:value={appState.eval3e.n1a_duree} oninput={save} placeholder="Durée du test (ex : 10 s)" class="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg p-2" />
            <input type="text" bind:value={appState.eval3e.n1a_etages} oninput={save} placeholder="Nombre d’étages (ex : 3)" class="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg p-2" />
          </div>
          <input type="text" bind:value={appState.eval3e.n1a_mats} oninput={save} placeholder="Matériaux autorisés (ex : 3 feuilles A4 + 2 tubes carton + 40 cm scotch)" class="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg p-2" />
        </div>

        <div class="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <p class="font-bold text-slate-800 dark:text-slate-100">N1b — Associe chaque terme technique à sa définition (2,5 pts) :</p>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-slate-800 dark:text-slate-200">
            <div>
              <label for="e3pli" class="font-semibold block mb-1">Pliage :</label>
              <select id="e3pli" bind:value={appState.eval3e.n1b_pliage} onchange={save} class="w-full border border-slate-300 dark:border-slate-700 rounded p-2 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
                <option value="">--</option>
                <option value="A">A · Charge transversale</option>
                <option value="B">B · Donner un angle</option>
                <option value="C">C · Réunir éléments</option>
              </select>
            </div>
            <div>
              <label for="e3ass" class="font-semibold block mb-1">Assemblage :</label>
              <select id="e3ass" bind:value={appState.eval3e.n1b_assemblage} onchange={save} class="w-full border border-slate-300 dark:border-slate-700 rounded p-2 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
                <option value="">--</option>
                <option value="A">A · Charge transversale</option>
                <option value="B">B · Donner un angle</option>
                <option value="C">C · Réunir éléments</option>
              </select>
            </div>
            <div>
              <label for="e3flex" class="font-semibold block mb-1">Flexion :</label>
              <select id="e3flex" bind:value={appState.eval3e.n1b_flexion} onchange={save} class="w-full border border-slate-300 dark:border-slate-700 rounded p-2 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
                <option value="">--</option>
                <option value="A">A · Charge transversale</option>
                <option value="B">B · Donner un angle</option>
                <option value="C">C · Réunir éléments</option>
              </select>
            </div>
          </div>
        </div>
      </section>
    {:else if appState.evalTier === 'N2'}
      <section class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
        <div class="border-b border-slate-100 dark:border-slate-800 pb-2">
          <h3 class="text-sm font-bold text-emerald-800 dark:text-emerald-400">N2 · COMPRÉHENSION (5 pts)</h3>
        </div>
        <div class="space-y-2">
          <p class="font-bold text-slate-800 dark:text-slate-100">N2a — Choix techniques et environnementaux (SFC1.2.3a écoconception / recyclage) (2,5 pts) :</p>
          <textarea rows="3" bind:value={appState.eval3e.n2a_eco} oninput={save} placeholder="Explique pourquoi le papier et le carton sont pertinents (mécanique, pliage sans énergie, réemploi, recyclage)..." class="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"></textarea>
        </div>

        <div class="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <p class="font-bold text-slate-800 dark:text-slate-100">N2b — Interpréter 3 essais (Essai 3 : affaissement à 7 s sous 5 pièces) (2,5 pts) :</p>
          <select bind:value={appState.eval3e.n2b_valid} onchange={save} class="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
            <option value="">L’exigence de résistance de 10 s est-elle respectée ?</option>
            <option value="Non">Non, car le pont s’affaisse à 7 s (&lt; 10 s)</option>
            <option value="Oui">Oui, elle est respectée</option>
          </select>
          <input type="text" bind:value={appState.eval3e.n2b_prio} oninput={save} placeholder="Élément à examiner en priorité (ex : le tablier et ses renforts centraux)" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500" />
        </div>
      </section>
    {:else if appState.evalTier === 'N3'}
      <section class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
        <div class="border-b border-slate-100 dark:border-slate-800 pb-2">
          <h3 class="text-sm font-bold text-amber-800 dark:text-amber-400">N3 · APPLICATION (5 pts)</h3>
        </div>
        <div class="space-y-2">
          <p class="font-bold text-slate-800 dark:text-slate-100">N3a — Processus complet de fabrication avec Actions et Contrôles sur 4 étapes (2,5 pts) :</p>
          <textarea rows="3" bind:value={appState.eval3e.n3a_proc} oninput={save} placeholder="1. Traçage/découpe (Contrôle cotes) ; 2. Pliage en U & triangles (Contrôle largeur ≥ 5 cm) ; 3. Assemblage ; 4. Essai 10 s..." class="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"></textarea>
        </div>
        <div class="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <p class="font-bold text-slate-800 dark:text-slate-100">N3b — Concevoir un protocole de validation complet (grandeurs, matériel, étapes, critères) (2,5 pts) :</p>
          <textarea rows="3" bind:value={appState.eval3e.n3b_proto} oninput={save} placeholder="Grandeurs : portée (18 cm), masse (5 pièces), durée (10 s) ; matériel : règle, chrono..." class="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"></textarea>
        </div>
      </section>
    {:else}
      <section class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
        <div class="border-b border-slate-100 dark:border-slate-800 pb-2">
          <h3 class="text-sm font-bold text-purple-800 dark:text-purple-400">N4 · MAÎTRISE (5 pts)</h3>
        </div>
        <div class="space-y-2">
          <p class="font-bold text-slate-800 dark:text-slate-100">N4a — Justifier couche plate (A) vs renfort triangulaire (B) (flexion, rigidité, matière, recyclage) (2,5 pts) :</p>
          <textarea rows="3" bind:value={appState.eval3e.n4a_justif} oninput={save} placeholder="Compare la rigidité en flexion, le moment d’inertie, la quantité de papier et la recyclabilité..." class="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"></textarea>
        </div>
        <div class="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <p class="font-bold text-slate-800 dark:text-slate-100">N4b — Nouvelle exigence : franchir 22 cm au lieu de 18 cm sans matériaux ajoutés (2,5 pts) :</p>
          <textarea rows="3" bind:value={appState.eval3e.n4b_22cm} oninput={save} placeholder="Décris les modifications (hauteur des bords en U, concentration des renforts triangulaires au tiers central)..." class="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"></textarea>
        </div>
      </section>
    {/if}

    {#if appState.profMode}
      <section class="bg-emerald-50 dark:bg-emerald-950/35 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-5 space-y-1.5 text-xs text-emerald-950 dark:text-emerald-200">
        <h4 class="font-bold text-sm text-emerald-900 dark:text-emerald-300">Corrigé & Barème Officiel — 3e (/20)</h4>
        <p><strong>N1a (2,5 pts) :</strong> 18 cm ; 5 pièces ; 10 s ; 3 étages ; papier A4 &amp; carton.</p>
        <p><strong>N1b (2,5 pts) :</strong> Pliage = B · Assemblage = C · Flexion = A.</p>
        <p><strong>N2a & N2b (5 pts) :</strong> Justesse mécanique + écoconception (réemploi/recyclage). Essai 3 non validé (7 s &lt; 10 s), inspecter le tablier et les renforts centraux.</p>
        <p><strong>N3a & N3b (5 pts) :</strong> Gamme structurée Actions + Contrôles et protocole métrologique reproductible.</p>
        <p><strong>N4a & N4b (5 pts) :</strong> Triangulation (B) optimise le rapport rigidité/matière tout en restant 100 % recyclable. À 22 cm : augmenter la hauteur des flancs du U et densifier l’accordéon sous le centre.</p>
      </section>
    {/if}
  {/if}

  <!-- Stepped Previous / Next Tier Footer -->
  <div class="flex items-center justify-between pt-1 no-print">
    <button
      type="button"
      onclick={prevTier}
      disabled={tierIndex === 0}
      class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer"
    >
      <ArrowLeft class="w-3.5 h-3.5" /> Palier précédent
    </button>
    <span class="text-xs font-mono text-slate-500 dark:text-slate-400">
      Palier {tierIndex + 1} / 4 · {TIERS[tierIndex].label}
    </span>
    <button
      type="button"
      onclick={nextTier}
      disabled={tierIndex === TIERS.length - 1}
      class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-400 disabled:opacity-40 text-white dark:text-slate-950 text-xs font-semibold cursor-pointer"
    >
      Palier suivant <ArrowRight class="w-3.5 h-3.5" />
    </button>
  </div>
</div>
