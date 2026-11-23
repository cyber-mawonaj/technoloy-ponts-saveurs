<script lang="ts">
  import { onDestroy } from 'svelte';
  import {
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    Clock,
    FlaskConical,
    Lightbulb,
    Mic,
    Pause,
    Play,
    RotateCcw,
    Volume2,
  } from 'lucide-svelte';
  import { CULINARY_PRESETS, DIY_STEPS_META } from '../../lib/data/curriculum';
  import { appState } from '../../lib/stores/appState.svelte';
  import { isSpeechAvailable, speakFrench } from '../../lib/utils/speech';
  import Sketchpad from './Sketchpad.svelte';

  const canSpeak = isSpeechAvailable();

  // Oral Teleprompter state (Step 7)
  let prompterOpen = $state(false);
  let oralSeconds = $state(180);
  let oralRunning = $state(false);
  let oralTimerHandle: number | null = null;

  onDestroy(() => {
    if (oralTimerHandle !== null) {
      window.clearInterval(oralTimerHandle);
    }
  });

  const formattedTimer = $derived.by(() => {
    const mins = Math.floor(appState.globalSeconds / 60)
      .toString()
      .padStart(2, '0');
    const secs = (appState.globalSeconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  });

  const formattedOralTimer = $derived.by(() => {
    const mins = Math.floor(oralSeconds / 60)
      .toString()
      .padStart(2, '0');
    const secs = (oralSeconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  });

  const s4DoneCount = $derived(appState.diySteps.s4_checks.filter(Boolean).length);

  function isStepFilled(step: number): boolean {
    const d = appState.diySteps;
    if (step === 1) return Boolean(d.s1_q1.trim() && d.s1_q2.trim());
    if (step === 2) return Boolean(appState.sketchSnapshotUrl || d.culture_kenya.trim() || d.culture_nigeria.trim());
    if (step === 3) return Boolean(d.s3_q1.trim() || d.s3_q2.trim());
    if (step === 4) return d.s4_checks.filter(Boolean).length >= 8;
    if (step === 5) return d.s5_checks.filter(Boolean).length >= 2;
    if (step === 6) return Boolean(d.s6_analyse1.trim());
    return Boolean(d.comm_1.trim() && d.comm_2.trim());
  }

  function toggleOralTimer() {
    if (oralRunning) {
      if (oralTimerHandle !== null) window.clearInterval(oralTimerHandle);
      oralTimerHandle = null;
      oralRunning = false;
    } else {
      oralRunning = true;
      oralTimerHandle = window.setInterval(() => {
        if (oralSeconds > 0) {
          oralSeconds -= 1;
        } else {
          toggleOralTimer();
        }
      }, 1000);
    }
  }

  function resetOralTimer() {
    if (oralTimerHandle !== null) window.clearInterval(oralTimerHandle);
    oralTimerHandle = null;
    oralRunning = false;
    oralSeconds = 180;
  }

  function prefillStep1Hints() {
    appState.diySteps.s1_q1 =
      'Concevoir une structure en forme de pont rigide et stable pouvant accueillir symboliquement la pièce montée du mariage de Kofi et Abénah.';
    appState.diySteps.s1_q2 =
      'Représenter un pont en forme de pièce montée à 3 étages franchissant 18 cm entre deux appuis.';
    appState.diySteps.s1_q3 =
      '3 feuilles blanches A4 maximum, 2 tubes en carton d’essuie-tout et 40 cm max de ruban adhésif.';
    appState.diySteps.s1_q4 =
      'Franchir un espace libre de 18 cm (largeur ≥ 5 cm) et supporter 5 pièces de 1 € au centre pendant 10 secondes sans s’effondrer.';
    appState.saveToStorage();
    appState.showToast('Coup de pouce chargé pour l’Étape 1 (tu peux adapter avec tes mots).', 'info');
  }

  function saveInput() {
    appState.saveToStorage();
  }

  const STEP4_GROUPS = [
    {
      badge: 'A',
      title: 'Réaliser les supports',
      items: [
        'Découpe les 2 tubes en carton en deux parties de longueur égale (4 piliers).',
        'Dispose deux morceaux côte à côte à chaque extrémité.',
        'Mesure et respecte exactement 18 cm entre les deux lignes d’appui (22 cm défi 3e).',
      ],
      startIdx: 0,
    },
    {
      badge: 'B',
      title: 'Réaliser le tablier (Feuille 1)',
      items: [
        'Prends la 1re feuille A4 dans le sens de la longueur (29,7 cm).',
        'Plie les deux grands côtés vers le haut sur environ 2 cm.',
        'Replie le bord supérieur de chaque côté vers l’intérieur sur 1 cm.',
        'Vérifie que la largeur du tablier fait au moins 5 cm.',
      ],
      startIdx: 3,
    },
    {
      badge: 'C',
      title: 'Renforcer (Feuille 2)',
      items: [
        'Découpe deux longues bandes dans la 2e feuille A4.',
        'Plie-les pour obtenir des profils triangulaires ou en accordéon.',
        'Fixe-les sous le tablier avec le ruban adhésif (40 cm maximum au total).',
        'Pose le tablier sur les 4 piliers en respectant l’espace libre.',
      ],
      startIdx: 7,
    },
  ];
</script>

<div class="space-y-6">
  <!-- 7-Step ABC Learning Design Stepper + 45-min Chronometer -->
  <section class="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
      <div>
        <h2 class="text-lg font-bold text-slate-900 dark:text-slate-100">
          Parcours DIY en 7 Étapes (ABC Learning Design · 45 min)
        </h2>
        <p class="text-xs text-slate-600 dark:text-slate-400">
          Étape {appState.activeDiyStep} sur 7 · Sauvegarde automatique pour ta Fiche Élève A4.
        </p>
      </div>

      <!-- Integrated 45-min Global Timer -->
      <div class="flex items-center gap-2.5 bg-slate-900 dark:bg-slate-950 border border-slate-800 text-white px-3.5 py-2 rounded-xl shrink-0">
        <Clock class="w-4 h-4 text-amber-400" />
        <span class="text-xs text-slate-300 hidden sm:inline">Chrono séance :</span>
        <span class="font-mono font-bold text-base text-amber-400 tabular-nums">{formattedTimer}</span>
        <button
          type="button"
          onclick={() => appState.toggleTimer()}
          class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs cursor-pointer"
        >
          {#if appState.isTimerRunning}
            <Pause class="w-3 h-3" /> Pause
          {:else}
            <Play class="w-3 h-3" /> Démarrer
          {/if}
        </button>
        <button
          type="button"
          onclick={() => appState.resetTimer()}
          title="Réinitialiser le chronomètre (45:00)"
          class="p-1 text-slate-400 hover:text-white cursor-pointer"
        >
          <RotateCcw class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    <!-- 7 Step Navigation Tiles with Completion Indicator -->
    <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
      {#each DIY_STEPS_META as s (s.step)}
        {@const active = appState.activeDiyStep === s.step}
        {@const done = isStepFilled(s.step)}
        <button
          type="button"
          onclick={() => (appState.activeDiyStep = s.step)}
          class="p-2.5 rounded-xl border text-left transition-colors cursor-pointer {active
            ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/50 text-amber-950 dark:text-amber-200'
            : done
              ? 'border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/30 text-slate-800 dark:text-slate-100 hover:bg-emerald-50 dark:hover:bg-emerald-950/50'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-300'}"
        >
          <div class="flex items-center justify-between gap-1 text-[10px] font-mono font-semibold {active ? 'text-amber-700 dark:text-amber-400' : 'text-slate-400 dark:text-slate-500'}">
            <span>Ét. {s.step} · {s.minutes} min</span>
            {#if done}
              <CheckCircle2 class="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
            {/if}
          </div>
          <div class="text-xs font-bold truncate mt-0.5">{s.title}</div>
        </button>
      {/each}
    </div>
  </section>

  <!-- STEP 1: ACQUISITION -->
  {#if appState.activeDiyStep === 1}
    <section class="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 space-y-5">
      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <span class="text-xs font-mono font-bold text-sky-700 dark:text-sky-400">Étape 1 · Acquisition (4 min)</span>
          <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">Comprendre la commande et le cahier des charges</h3>
        </div>
        <div class="flex items-center gap-2">
          {#if canSpeak}
            <button
              type="button"
              onclick={() => speakFrench('Étape 1 Acquisition. Réponds aux quatre questions sur le besoin de Monsieur Loyalle, la fonction d’usage, les matériaux autorisés et les contraintes de la structure.')}
              class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              <Volume2 class="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" /> Écouter
            </button>
          {/if}
          <button
            type="button"
            onclick={prefillStep1Hints}
            class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-800/60 text-xs font-semibold text-amber-800 dark:text-amber-300 cursor-pointer"
          >
            <Lightbulb class="w-3.5 h-3.5" /> Coup de pouce
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
        <div>
          <label for="s1q1" class="block font-semibold text-slate-800 dark:text-slate-200 mb-1.5">1. Quel est le besoin du pâtissier Monsieur Loyalle ?</label>
          <textarea
            id="s1q1"
            rows="3"
            bind:value={appState.diySteps.s1_q1}
            oninput={saveInput}
            placeholder="Réaliser une structure rigide et stable en forme de pont..."
            class="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
          ></textarea>
        </div>
        <div>
          <label for="s1q2" class="block font-semibold text-slate-800 dark:text-slate-200 mb-1.5">2. Quelle est la fonction d’usage de la maquette ?</label>
          <textarea
            id="s1q2"
            rows="3"
            bind:value={appState.diySteps.s1_q2}
            oninput={saveInput}
            placeholder="Franchir 18 cm tout en représentant une pièce montée à 3 étages..."
            class="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
          ></textarea>
        </div>
        <div>
          <label for="s1q3" class="block font-semibold text-slate-800 dark:text-slate-200 mb-1.5">3. Quels sont les matériaux autorisés pour construire ?</label>
          <textarea
            id="s1q3"
            rows="2"
            bind:value={appState.diySteps.s1_q3}
            oninput={saveInput}
            placeholder="Liste les matériaux et leurs quantités maximales..."
            class="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
          ></textarea>
        </div>
        <div>
          <label for="s1q4" class="block font-semibold text-slate-800 dark:text-slate-200 mb-1.5">4. Quelles sont les deux contraintes principales concernant la structure ?</label>
          <textarea
            id="s1q4"
            rows="2"
            bind:value={appState.diySteps.s1_q4}
            oninput={saveInput}
            placeholder="Distance à franchir et charge à supporter pendant 10 s..."
            class="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
          ></textarea>
        </div>
      </div>

      <div class="flex justify-end pt-2">
        <button
          type="button"
          onclick={() => (appState.activeDiyStep = 2)}
          class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-400 text-white dark:text-slate-950 text-xs font-semibold cursor-pointer"
        >
          Étape suivante : Investigation <ArrowRight class="w-3.5 h-3.5" />
        </button>
      </div>
    </section>

  <!-- STEP 2: INVESTIGATION (SKETCHPAD + KENYA / NIGERIA) -->
  {:else if appState.activeDiyStep === 2}
    <section class="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 space-y-6">
      <div class="border-b border-slate-100 dark:border-slate-800 pb-4">
        <span class="text-xs font-mono font-bold text-purple-700 dark:text-purple-400">Étape 2 · Investigation (5 min)</span>
        <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
          Imaginer la structure, dessiner le croquis et documenter les saveurs
        </h3>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div class="lg:col-span-7">
          <Sketchpad />
        </div>

        <div class="lg:col-span-5 space-y-4 bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
          <h4 class="font-bold text-sm text-slate-900 dark:text-slate-100">
            Réflexion sur les Saveurs et les Cultures
          </h4>

          <details class="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 text-xs text-slate-600 dark:text-slate-300">
            <summary class="font-semibold text-slate-800 dark:text-slate-100 cursor-pointer">
              Consigne documentaire & vigilance culturelle
            </summary>
            <p class="mt-1.5 leading-relaxed">
              Prépare deux références culinaires documentées (visible en direct sur la maquette 3D). Un aliment ou un motif choisi ne représente pas à lui seul l’ensemble de la population d’un pays.
            </p>
          </details>

          <div class="space-y-1.5">
            <div class="flex items-center justify-between gap-2">
              <label for="cultKenya" class="text-xs font-bold text-rose-800 dark:text-rose-300">Saveur / Recette du Kenya</label>
              <select
                aria-label="Exemples documentés Kenya"
                onchange={(e) => {
                  const val = (e.target as HTMLSelectElement).value;
                  if (val) {
                    appState.diySteps.culture_kenya = val;
                    saveInput();
                  }
                }}
                class="text-[11px] border border-slate-300 dark:border-slate-700 rounded-md px-2 py-1 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              >
                <option value="">-- Idées documentées --</option>
                {#each CULINARY_PRESETS.kenya as item}
                  <option value={item}>{item.split('(')[0].trim()}</option>
                {/each}
              </select>
            </div>
            <input
              id="cultKenya"
              type="text"
              bind:value={appState.diySteps.culture_kenya}
              oninput={saveInput}
              placeholder="Ex : Mandazi parfumés à la cardamome (Côte swahilie)"
              class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs"
            />
          </div>

          <div class="space-y-1.5">
            <div class="flex items-center justify-between gap-2">
              <label for="cultNigeria" class="text-xs font-bold text-emerald-800 dark:text-emerald-300">Saveur / Recette du Nigeria</label>
              <select
                aria-label="Exemples documentés Nigeria"
                onchange={(e) => {
                  const val = (e.target as HTMLSelectElement).value;
                  if (val) {
                    appState.diySteps.culture_nigeria = val;
                    saveInput();
                  }
                }}
                class="text-[11px] border border-slate-300 dark:border-slate-700 rounded-md px-2 py-1 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              >
                <option value="">-- Idées documentées --</option>
                {#each CULINARY_PRESETS.nigeria as item}
                  <option value={item}>{item.split('(')[0].trim()}</option>
                {/each}
              </select>
            </div>
            <input
              id="cultNigeria"
              type="text"
              bind:value={appState.diySteps.culture_nigeria}
              oninput={saveInput}
              placeholder="Ex : Chin Chin parfumés à la noix de muscade"
              class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs"
            />
          </div>

          <div>
            <label for="cultSource" class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Source d’information / Provenance :
            </label>
            <input
              id="cultSource"
              type="text"
              bind:value={appState.diySteps.culture_source}
              oninput={saveInput}
              placeholder="Ex : Recette familiale, encyclopédie culinaire, FDS 2026..."
              class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs"
            />
          </div>
        </div>
      </div>

      <div class="flex justify-between pt-2">
        <button
          type="button"
          onclick={() => (appState.activeDiyStep = 1)}
          class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer"
        >
          <ArrowLeft class="w-3.5 h-3.5" /> Précédent
        </button>
        <button
          type="button"
          onclick={() => (appState.activeDiyStep = 3)}
          class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-400 text-white dark:text-slate-950 text-xs font-semibold cursor-pointer"
        >
          Étape suivante : Discussion <ArrowRight class="w-3.5 h-3.5" />
        </button>
      </div>
    </section>

  <!-- STEP 3: DISCUSSION -->
  {:else if appState.activeDiyStep === 3}
    <section class="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 space-y-5">
      <div class="border-b border-slate-100 dark:border-slate-800 pb-4">
        <span class="text-xs font-mono font-bold text-amber-700 dark:text-amber-400">Étape 3 · Discussion (2 min)</span>
        <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">Justifier son choix technique</h3>
      </div>

      <p class="text-xs text-slate-600 dark:text-slate-400">
        Explique à voix haute à un camarade ou un membre de ta famille, puis note tes justifications avant de découper :
      </p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
        <div>
          <label for="s3q1" class="block font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
            Pourquoi as-tu choisi cette forme de tablier (en U, rebords, accordéon) ?
          </label>
          <textarea
            id="s3q1"
            rows="3"
            bind:value={appState.diySteps.s3_q1}
            oninput={saveInput}
            placeholder="J’ai choisi un tablier plié en U avec rebords de 1 cm car..."
            class="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs"
          ></textarea>
        </div>
        <div>
          <label for="s3q2" class="block font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
            Comment comptes-tu rendre ton pont plus résistant à la flexion ?
          </label>
          <textarea
            id="s3q2"
            rows="3"
            bind:value={appState.diySteps.s3_q2}
            oninput={saveInput}
            placeholder="En fixant deux bandes en accordéon triangulaire sous le centre du tablier..."
            class="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs"
          ></textarea>
        </div>
      </div>

      <div class="flex justify-between pt-2">
        <button
          type="button"
          onclick={() => (appState.activeDiyStep = 2)}
          class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer"
        >
          <ArrowLeft class="w-3.5 h-3.5" /> Précédent
        </button>
        <button
          type="button"
          onclick={() => (appState.activeDiyStep = 4)}
          class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-400 text-white dark:text-slate-950 text-xs font-semibold cursor-pointer"
        >
          Étape suivante : Fabrication <ArrowRight class="w-3.5 h-3.5" />
        </button>
      </div>
    </section>

  <!-- STEP 4: FABRICATION (17 MIN) -->
  {:else if appState.activeDiyStep === 4}
    <section class="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 space-y-6">
      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <span class="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">Étape 4 · Practice / Fabriquer le pont (17 min)</span>
          <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">Guide de fabrication pas-à-pas</h3>
        </div>
        <span class="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-300 tabular-nums">
          {s4DoneCount} / 11 gestes validés
        </span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        {#each STEP4_GROUPS as grp}
          <div class="p-5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
            <div class="w-8 h-8 rounded-lg bg-amber-600 text-white font-bold text-sm flex items-center justify-center">
              {grp.badge}
            </div>
            <h4 class="font-bold text-sm text-slate-900 dark:text-slate-100">{grp.title}</h4>
            <ul class="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
              {#each grp.items as item, offset}
                {@const idx = grp.startIdx + offset}
                <li>
                  <label class="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!appState.diySteps.s4_checks[idx]}
                      onchange={(e) => {
                        appState.diySteps.s4_checks[idx] = (e.target as HTMLInputElement).checked;
                        saveInput();
                      }}
                      class="mt-0.5 w-4 h-4 accent-amber-500 rounded cursor-pointer shrink-0"
                    />
                    <span class={appState.diySteps.s4_checks[idx] ? 'line-through text-slate-400 dark:text-slate-500' : ''}>
                      {offset + 1}. {item}
                    </span>
                  </label>
                </li>
              {/each}
            </ul>
          </div>
        {/each}
      </div>

      <div class="flex justify-between pt-2">
        <button
          type="button"
          onclick={() => (appState.activeDiyStep = 3)}
          class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer"
        >
          <ArrowLeft class="w-3.5 h-3.5" /> Précédent
        </button>
        <button
          type="button"
          onclick={() => (appState.activeDiyStep = 5)}
          class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-400 text-white dark:text-slate-950 text-xs font-semibold cursor-pointer"
        >
          Étape suivante : Pièce montée <ArrowRight class="w-3.5 h-3.5" />
        </button>
      </div>
    </section>

  <!-- STEP 5: PIÈCE MONTÉE (7 MIN) -->
  {:else if appState.activeDiyStep === 5}
    <section class="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 space-y-5">
      <div class="border-b border-slate-100 dark:border-slate-800 pb-4">
        <span class="text-xs font-mono font-bold text-rose-700 dark:text-rose-400">Étape 5 · Production : La Pièce Montée (7 min)</span>
        <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">Réaliser les 3 étages et la symbolique culturelle</h3>
      </div>

      <p class="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
        Avec la <strong class="text-slate-900 dark:text-white">3e feuille A4</strong>, forme trois anneaux cylindriques de diamètres décroissants et superpose-les au centre du tablier.
      </p>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div class="p-4 rounded-xl border border-rose-200 dark:border-rose-800/60 bg-rose-50/50 dark:bg-rose-950/30 space-y-1">
          <div class="text-[11px] font-bold uppercase text-rose-700 dark:text-rose-400">Partie Gauche du Pont</div>
          <div class="font-bold text-base text-slate-900 dark:text-slate-100">KENYA</div>
          <p class="text-xs text-slate-600 dark:text-slate-300">
            {appState.diySteps.culture_kenya || 'Inscris « Kenya » et ta référence culinaire documentée.'}
          </p>
        </div>

        <div class="p-4 rounded-xl border border-amber-300 dark:border-amber-700/70 bg-amber-50/70 dark:bg-amber-950/35 space-y-1">
          <div class="text-[11px] font-bold uppercase text-amber-800 dark:text-amber-400">Au Centre du Pont</div>
          <div class="font-bold text-sm text-slate-900 dark:text-slate-100">Kofi Seÿkou-Touré + Abénah Obi-Kâ</div>
          <p class="text-xs italic text-amber-900 dark:text-amber-200">
            « Deux histoires, deux héritages, un pont vers l’avenir. »
          </p>
        </div>

        <div class="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/30 space-y-1">
          <div class="text-[11px] font-bold uppercase text-emerald-700 dark:text-emerald-400">Partie Droite du Pont</div>
          <div class="font-bold text-base text-slate-900 dark:text-slate-100">NIGERIA</div>
          <p class="text-xs text-slate-600 dark:text-slate-300">
            {appState.diySteps.culture_nigeria || 'Inscris « Nigeria » et ta référence culinaire documentée.'}
          </p>
        </div>
      </div>

      <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs text-slate-700 dark:text-slate-300">
        <div class="font-semibold text-slate-800 dark:text-slate-200">Contrôles de finition (Étape 5) :</div>
        {#each [
          'Les 3 étages décroissants de la 3e feuille A4 tiennent sans bloquer la zone de test.',
          'Les prénoms Kofi et Abénah + « Kenya » à gauche et « Nigeria » à droite sont lisibles.',
          'Les couleurs et motifs choisis respectent la diversité culturelle des deux pays.',
        ] as label, idx}
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={!!appState.diySteps.s5_checks[idx]}
              onchange={(e) => {
                appState.diySteps.s5_checks[idx] = (e.target as HTMLInputElement).checked;
                saveInput();
              }}
              class="w-4 h-4 accent-amber-500 rounded cursor-pointer"
            />
            <span>{label}</span>
          </label>
        {/each}
      </div>

      <div class="flex justify-between pt-2">
        <button
          type="button"
          onclick={() => (appState.activeDiyStep = 4)}
          class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer"
        >
          <ArrowLeft class="w-3.5 h-3.5" /> Précédent
        </button>
        <button
          type="button"
          onclick={() => (appState.activeDiyStep = 6)}
          class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-400 text-white dark:text-slate-950 text-xs font-semibold cursor-pointer"
        >
          Étape suivante : Validation <ArrowRight class="w-3.5 h-3.5" />
        </button>
      </div>
    </section>

  <!-- STEP 6: VALIDATION (7 MIN) -->
  {:else if appState.activeDiyStep === 6}
    <section class="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 space-y-6">
      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <span class="text-xs font-mono font-bold text-indigo-700 dark:text-indigo-400">Étape 6 · Validation (7 min)</span>
          <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">Tester la résistance du pont pendant 10 s et analyser</h3>
        </div>
        <button
          type="button"
          onclick={() => {
            appState.activeTab = 2;
            appState.subTab2 = 'sim';
          }}
          class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
        >
          <FlaskConical class="w-3.5 h-3.5" /> Ouvrir le Simulateur 10 s
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
        <div class="space-y-3">
          <h4 class="font-bold text-sm text-slate-900 dark:text-slate-100">Tableau des résultats du protocole d’essai :</h4>
          <div class="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-slate-700 dark:text-slate-200">
            <div class="p-3 flex items-center justify-between gap-2 bg-slate-50 dark:bg-slate-950">
              <span>Distance libre de {appState.spanCm} cm respectée</span>
              <select bind:value={appState.diySteps.val_c1} onchange={saveInput} class="border border-slate-300 dark:border-slate-700 rounded-md px-2 py-1 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold">
                <option value="Oui">Oui</option>
                <option value="Non">Non</option>
              </select>
            </div>
            <div class="p-3 flex items-center justify-between gap-2 bg-white dark:bg-slate-900">
              <span>5 pièces (ou bouchons) supportées pendant 10 s</span>
              <select bind:value={appState.diySteps.val_c2} onchange={saveInput} class="border border-slate-300 dark:border-slate-700 rounded-md px-2 py-1 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-semibold">
                <option value="Oui">Oui</option>
                <option value="Non">Non</option>
              </select>
            </div>
            <div class="p-3 flex items-center justify-between gap-2 bg-slate-50 dark:bg-slate-950">
              <span>Structure stable (pas de basculement latéral)</span>
              <select bind:value={appState.diySteps.val_c3} onchange={saveInput} class="border border-slate-300 dark:border-slate-700 rounded-md px-2 py-1 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold">
                <option value="Oui">Oui</option>
                <option value="Non">Non</option>
              </select>
            </div>
            <div class="p-3 flex items-center justify-between gap-2 bg-white dark:bg-slate-900">
              <span>Tablier sans effondrement ni contact sous le pont</span>
              <select bind:value={appState.diySteps.val_c4} onchange={saveInput} class="border border-slate-300 dark:border-slate-700 rounded-md px-2 py-1 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-semibold">
                <option value="Oui">Oui</option>
                <option value="Non">Non</option>
              </select>
            </div>
            <div class="p-3 flex items-center justify-between gap-2 bg-slate-50 dark:bg-slate-950">
              <span>4 supports carton de hauteur égale et bien alignés</span>
              <select bind:value={appState.diySteps.val_c5} onchange={saveInput} class="border border-slate-300 dark:border-slate-700 rounded-md px-2 py-1 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold">
                <option value="Oui">Oui</option>
                <option value="Non">Non</option>
              </select>
            </div>
          </div>
        </div>

        <div class="space-y-3">
          <h4 class="font-bold text-sm text-slate-900 dark:text-slate-100">Analyse des résultats :</h4>
          <div>
            <label for="s6a1" class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Quelle partie de la structure s’est le plus déformée ? Pourquoi les plis améliorent-ils le comportement sous charge ?
            </label>
            <textarea
              id="s6a1"
              rows="3"
              bind:value={appState.diySteps.s6_analyse1}
              oninput={saveInput}
              placeholder="Le centre du tablier subit une flexion. Les plis en U augmentent la rigidité..."
              class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            ></textarea>
          </div>
          <div>
            <label for="s6a2" class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Quelle modification proposerais-tu pour améliorer ton pont ?
            </label>
            <textarea
              id="s6a2"
              rows="2"
              bind:value={appState.diySteps.s6_analyse2}
              oninput={saveInput}
              placeholder="Ajouter une poutre triangulaire ou resserrer l’accordéon au centre..."
              class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            ></textarea>
          </div>
        </div>
      </div>

      <div class="flex justify-between pt-2">
        <button
          type="button"
          onclick={() => (appState.activeDiyStep = 5)}
          class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer"
        >
          <ArrowLeft class="w-3.5 h-3.5" /> Précédent
        </button>
        <button
          type="button"
          onclick={() => (appState.activeDiyStep = 7)}
          class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-400 text-white dark:text-slate-950 text-xs font-semibold cursor-pointer"
        >
          Étape suivante : Communiquer <ArrowRight class="w-3.5 h-3.5" />
        </button>
      </div>
    </section>

  <!-- STEP 7: COMMUNIQUER (3 MIN) + ORAL TELEPROMPTER MODE -->
  {:else}
    <section class="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 space-y-5">
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <span class="text-xs font-mono font-bold text-teal-700 dark:text-teal-400">Étape 7 · Communiquer (3 min)</span>
          <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">Présenter sa réalisation</h3>
        </div>

        <button
          type="button"
          onclick={() => (prompterOpen = !prompterOpen)}
          class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer {prompterOpen
            ? 'bg-amber-500 text-slate-950'
            : 'bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white'}"
        >
          <Mic class="w-3.5 h-3.5" />
          {prompterOpen ? 'Masquer Mode Prompteur' : 'Mode Prompteur Oral (3 min)'}
        </button>
      </div>

      {#if prompterOpen}
        <div class="bg-slate-900 dark:bg-slate-950 text-white rounded-xl p-6 border border-slate-800 space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div class="text-xs font-semibold text-amber-300">
              Prompteur Oral · Présentation devant le groupe (3 minutes)
            </div>
            <div class="flex items-center gap-2">
              <span class="font-mono text-lg font-bold text-emerald-400 tabular-nums">{formattedOralTimer}</span>
              <button
                type="button"
                onclick={toggleOralTimer}
                class="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer"
              >
                {oralRunning ? 'Pause' : 'Démarrer 3:00'}
              </button>
              <button
                type="button"
                onclick={resetOralTimer}
                class="p-1.5 rounded bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                title="Réinitialiser 3:00"
              >
                <RotateCcw class="w-3.5 h-3.5" />
              </button>
              {#if canSpeak}
                <button
                  type="button"
                  onclick={() =>
                    speakFrench(
                      `J'ai conçu ce pont en utilisant ${appState.diySteps.comm_1 || '3 feuilles A4 et 2 tubes en carton'}. J'ai renforcé sa structure grâce à ${appState.diySteps.comm_2 || 'un pliage en U et des poutres en accordéon'}. Mon essai a montré que ${appState.diySteps.comm_3 || 'le pont supporte 5 pièces pendant 10 secondes'}. Cette pièce montée symbolise ${appState.diySteps.comm_4 || 'l’union de Kofi et Abénah entre le Kenya et le Nigeria'}.`,
                    )}
                  class="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-semibold cursor-pointer"
                >
                  <Volume2 class="w-3.5 h-3.5" /> Écouter
                </button>
              {/if}
            </div>
          </div>

          <div class="space-y-3 text-base sm:text-lg leading-relaxed text-slate-100">
            <p>
              « <span class="text-amber-300 font-semibold">J’ai conçu ce pont en utilisant</span>
              {appState.diySteps.comm_1 || '3 feuilles A4 et 2 tubes en carton découpés en 4 piliers'}.
            </p>
            <p>
              <span class="text-amber-300 font-semibold">J’ai renforcé sa structure grâce à</span>
              {appState.diySteps.comm_2 || 'un pliage en U du tablier et des profils en accordéon'}.
            </p>
            <p>
              <span class="text-amber-300 font-semibold">Mon essai a montré que</span>
              {appState.diySteps.comm_3 || 'le pont supporte les 5 pièces pendant 10 secondes sans fléchir'}.
            </p>
            <p>
              <span class="text-amber-300 font-semibold">Cette pièce montée symbolise</span>
              {appState.diySteps.comm_4 || 'l’union de Kofi et Abénah ainsi que le partage entre Kenya et Nigeria'}. »
            </p>
          </div>
        </div>
      {/if}

      <div class="bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
        <div class="font-bold text-sm text-slate-900 dark:text-slate-100">Complète ton texte de présentation orale / écrite :</div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="c1" class="font-semibold text-slate-700 dark:text-slate-300 block mb-1">« J’ai conçu ce pont en utilisant…</label>
            <input
              id="c1"
              type="text"
              bind:value={appState.diySteps.comm_1}
              oninput={saveInput}
              placeholder="3 feuilles A4 et 2 tubes en carton découpés en 4 piliers"
              class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>
          <div>
            <label for="c2" class="font-semibold text-slate-700 dark:text-slate-300 block mb-1">J’ai renforcé sa structure grâce à…</label>
            <input
              id="c2"
              type="text"
              bind:value={appState.diySteps.comm_2}
              oninput={saveInput}
              placeholder="un pliage en U du tablier et des profils en accordéon"
              class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>
          <div>
            <label for="c3" class="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Mon essai a montré que…</label>
            <input
              id="c3"
              type="text"
              bind:value={appState.diySteps.comm_3}
              oninput={saveInput}
              placeholder="le pont supporte les 5 pièces pendant 10 secondes sans fléchir"
              class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>
          <div>
            <label for="c4" class="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Cette pièce montée symbolise… »</label>
            <input
              id="c4"
              type="text"
              bind:value={appState.diySteps.comm_4}
              oninput={saveInput}
              placeholder="l’union de Kofi et Abénah ainsi que le partage entre Kenya et Nigeria"
              class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>
        </div>
      </div>

      <div class="flex justify-between pt-2">
        <button
          type="button"
          onclick={() => (appState.activeDiyStep = 6)}
          class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer"
        >
          <ArrowLeft class="w-3.5 h-3.5" /> Précédent
        </button>
        <button
          type="button"
          onclick={() => (appState.activeTab = 4)}
          class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold cursor-pointer"
        >
          Passer aux Évaluations ({appState.studentInfo.niveau}) <ArrowRight class="w-3.5 h-3.5" />
        </button>
      </div>
    </section>
  {/if}
</div>
