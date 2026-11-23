<script lang="ts">
  import {
    CheckCircle2,
    GitBranch,
    Layers,
    Minus,
    Play,
    Plus,
    RotateCcw,
    SlidersHorizontal,
    SplitSquareHorizontal,
    TriangleAlert,
    Waypoints,
    Zap,
  } from 'lucide-svelte';
  import { appState, type DeckProfile, type ReinforcementType } from '../../lib/stores/appState.svelte';
  import { playBuzzerTone } from '../../lib/utils/audio';
  import BridgeFlowBuilder from './BridgeFlowBuilder.svelte';
  import BridgeLogigramme from './BridgeLogigramme.svelte';
  import ProcessBlockEditor from './ProcessBlockEditor.svelte';

  const deflection = $derived(appState.currentDeflectionMm);
  const sagPx = $derived(appState.testStatus === 'collapsed' ? Math.max(deflection, 34) : deflection);
  const midControlY = $derived(105 + sagPx * 1.3);
  const deckThickness = $derived(appState.deckProfile === 'flat' ? 6 : appState.deckProfile === 'ufold' ? 14 : 18);
  const leftPillarX = $derived(appState.spanCm === 22 ? 65 : 95);
  const rightPillarX = $derived(appState.spanCm === 22 ? 485 : 455);
  const spanLineX1 = $derived(appState.spanCm === 22 ? 120 : 150);
  const spanLineX2 = $derived(appState.spanCm === 22 ? 480 : 450);

  // Reference Flat A vs Configured B deflection for Duel mode
  const flatReferenceDeflection = $derived(
    appState.coinCount === 0
      ? 0
      : Math.round(appState.coinCount * 11 * (appState.spanCm === 22 ? 1.45 : 1.0)),
  );
  const unstableLateral = $derived(
    Math.abs(appState.coinOffsetCm) > 1.2 || appState.pillarMismatchMm > 3,
  );

  function changeCoins(delta: number) {
    appState.coinCount = Math.max(0, Math.min(8, appState.coinCount + delta));
    appState.reset10sTest();
    appState.saveToStorage();
  }

  function startTest() {
    appState.start10sTest((ok) => {
      playBuzzerTone(ok ? 1760 : 310, ok ? 180 : 280, appState.ebepMode);
    });
  }

  function resetTest() {
    appState.reset10sTest();
  }

  function loadChallengePreset(preset: 'flat' | 'u10' | '22cm') {
    appState.reset10sTest();
    if (preset === 'flat') {
      appState.deckProfile = 'flat';
      appState.reinforcementType = 'none';
      appState.spanCm = 18;
      appState.coinCount = 5;
      appState.coinOffsetCm = 0;
      appState.pillarMismatchMm = 0;
    } else if (preset === 'u10') {
      appState.deckProfile = 'ufold';
      appState.reinforcementType = 'accordion';
      appState.spanCm = 18;
      appState.coinCount = 5;
      appState.coinOffsetCm = 0;
      appState.pillarMismatchMm = 0;
    } else {
      appState.deckProfile = 'ufold_tall';
      appState.reinforcementType = 'accordion';
      appState.spanCm = 22;
      appState.coinCount = 5;
      appState.coinOffsetCm = 0;
      appState.pillarMismatchMm = 0;
    }
    appState.saveToStorage();
  }

  function testInJolt3D() {
    appState.activeTab = 1;
    appState.subTab1 = '3d';
    appState.triggerPhysicsDrop();
  }
</script>

<div class="space-y-5">
  <!-- Clean Sub-Tab Navigation -->
  <div class="bg-white dark:bg-slate-900 rounded-xl p-2 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
    <div class="flex flex-wrap items-center gap-1.5 text-xs">
      <button
        type="button"
        onclick={() => (appState.subTab2 = 'sim')}
        class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer {appState.subTab2 === 'sim'
          ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950'
          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}"
      >
        <SlidersHorizontal class="w-3.5 h-3.5" /> Banc Mécanique 10 s & Duel A/B
      </button>
      <button
        type="button"
        onclick={() => (appState.subTab2 = 'blocks')}
        class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer {appState.subTab2 === 'blocks'
          ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950'
          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}"
      >
        <Layers class="w-3.5 h-3.5" /> Gamme de fabrication (Blocs)
      </button>
      <button
        type="button"
        onclick={() => (appState.subTab2 = 'flow')}
        class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer {appState.subTab2 === 'flow'
          ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950'
          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}"
      >
        <Waypoints class="w-3.5 h-3.5" /> Constructeur Schémas (4e–3e)
      </button>
      <button
        type="button"
        onclick={() => (appState.subTab2 = 'logigramme')}
        class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer {appState.subTab2 === 'logigramme'
          ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950'
          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}"
      >
        <GitBranch class="w-3.5 h-3.5" /> Logigramme en direct
      </button>
    </div>

    <div class="px-3 text-xs text-slate-500 dark:text-slate-400 font-mono hidden md:block tabular-nums">
      Budget : {appState.sheetsUsedCount}/3 A4 · {appState.estimatedTapeUsedCm}/40 cm scotch
    </div>
  </div>

  <!-- SUB-TAB 1: MECHANICAL BENCH + PROGRESSIVE CHALLENGES + A/B DUEL -->
  {#if appState.subTab2 === 'sim'}
    <section class="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 space-y-5">
      <!-- Progressive 3-Challenge Guide Strip -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
        <button
          type="button"
          onclick={() => loadChallengePreset('flat')}
          class="p-3 rounded-xl border text-left transition-colors cursor-pointer {appState.hasTestedFlat
            ? 'bg-emerald-50/70 dark:bg-emerald-950/35 border-emerald-200 dark:border-emerald-800/60'
            : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500/60'}"
        >
          <div class="flex items-center justify-between font-bold text-slate-900 dark:text-slate-100">
            <span>Défi 1 · Constat Feuille plate</span>
            {#if appState.hasTestedFlat}
              <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            {/if}
          </div>
          <p class="text-[11px] text-slate-600 dark:text-slate-400 mt-1">Observer l’effondrement en flexion d’une feuille A4 non pliée.</p>
        </button>

        <button
          type="button"
          onclick={() => loadChallengePreset('u10')}
          class="p-3 rounded-xl border text-left transition-colors cursor-pointer {appState.hasTestedReinforced
            ? 'bg-emerald-50/70 dark:bg-emerald-950/35 border-emerald-200 dark:border-emerald-800/60'
            : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500/60'}"
        >
          <div class="flex items-center justify-between font-bold text-slate-900 dark:text-slate-100">
            <span>Défi 2 · Pliage U + Accordéon</span>
            {#if appState.hasTestedReinforced}
              <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            {/if}
          </div>
          <p class="text-[11px] text-slate-600 dark:text-slate-400 mt-1">Valider le protocole officiel : 18 cm · 5 pièces · 10 s.</p>
        </button>

        <button
          type="button"
          onclick={() => loadChallengePreset('22cm')}
          class="p-3 rounded-xl border text-left transition-colors cursor-pointer {appState.hasTested22cm
            ? 'bg-emerald-50/70 dark:bg-emerald-950/35 border-emerald-200 dark:border-emerald-800/60'
            : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500/60'}"
        >
          <div class="flex items-center justify-between font-bold text-slate-900 dark:text-slate-100">
            <span>Défi 3 · Portée 22 cm (3e N4b)</span>
            {#if appState.hasTested22cm}
              <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            {/if}
          </div>
          <p class="text-[11px] text-slate-600 dark:text-slate-400 mt-1">Relever les bords à 3 cm et trianguler pour tenir à 22 cm.</p>
        </button>
      </div>

      <!-- Action Header -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 class="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Simulateur Mécanique du Pont (Protocole 10 secondes)
          </h2>
          <p class="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Ajuste la géométrie, la portée et les défauts d’équilibre puis lance l’essai de 10 s ou la chute physique Jolt 3D.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onclick={() => (appState.duelMode = !appState.duelMode)}
            class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold cursor-pointer {appState.duelMode
              ? 'bg-amber-500 border-amber-500 text-slate-950'
              : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'}"
          >
            <SplitSquareHorizontal class="w-3.5 h-3.5" /> Mode Duel A vs B
          </button>

          <button
            type="button"
            onclick={testInJolt3D}
            class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
          >
            <Zap class="w-3.5 h-3.5" /> Tester en Chute 3D Jolt
          </button>

          <button
            type="button"
            onclick={startTest}
            disabled={appState.testStatus === 'running'}
            class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-xs font-semibold cursor-pointer"
          >
            <Play class="w-3.5 h-3.5" />
            {appState.testStatus === 'running' ? 'Essai en cours…' : 'Lancer le test (10 s)'}
          </button>

          <button
            type="button"
            onclick={resetTest}
            class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer"
          >
            <RotateCcw class="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </div>

      <!-- 4 Main Controls + 2 Stability / Fault Controls -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
        <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
          <label for="simDeckSelect" class="block font-bold text-slate-700 dark:text-slate-300">1. Profil du Tablier (Feuille 1)</label>
          <select
            id="simDeckSelect"
            value={appState.deckProfile}
            onchange={(e) => {
              appState.deckProfile = (e.target as HTMLSelectElement).value as DeckProfile;
              appState.reset10sTest();
              appState.saveToStorage();
            }}
            class="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium text-slate-900 dark:text-slate-100"
          >
            <option value="flat">Feuille A4 plate (sans pli)</option>
            <option value="ufold">Profil en U (bords 2 cm + rebords 1 cm)</option>
            <option value="ufold_tall">Profil en U renforcé (bords 3 cm · défi 3e)</option>
          </select>
        </div>

        <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
          <label for="simReinforceSelect" class="block font-bold text-slate-700 dark:text-slate-300">2. Renforts sous tablier (Feuille 2)</label>
          <select
            id="simReinforceSelect"
            value={appState.reinforcementType}
            onchange={(e) => {
              appState.reinforcementType = (e.target as HTMLSelectElement).value as ReinforcementType;
              appState.reset10sTest();
              appState.saveToStorage();
            }}
            class="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium text-slate-900 dark:text-slate-100"
          >
            <option value="none">Aucun renfort</option>
            <option value="flat_sheet">Feuille supplémentaire à plat</option>
            <option value="accordion">Poutres triangulaires / Accordéon</option>
          </select>
        </div>

        <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
          <label for="simSpanSelect" class="block font-bold text-slate-700 dark:text-slate-300">3. Distance libre entre appuis</label>
          <select
            id="simSpanSelect"
            value={String(appState.spanCm)}
            onchange={(e) => {
              appState.spanCm = Number((e.target as HTMLSelectElement).value) === 22 ? 22 : 18;
              appState.reset10sTest();
              appState.saveToStorage();
            }}
            class="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium text-slate-900 dark:text-slate-100"
          >
            <option value="18">18 cm (Cahier des charges)</option>
            <option value="22">22 cm (Nouvelle exigence 3e · N4b)</option>
          </select>
        </div>

        <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
          <span class="block font-bold text-slate-700 dark:text-slate-300">4. Charge au centre (Pièces 1 €)</span>
          <div class="flex items-center justify-between pt-1">
            <button
              type="button"
              onclick={() => changeCoins(-1)}
              aria-label="Retirer une pièce"
              class="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 flex items-center justify-center font-bold cursor-pointer"
            >
              <Minus class="w-4 h-4" />
            </button>
            <span class="font-mono font-bold text-base text-amber-700 dark:text-amber-400 tabular-nums">
              {appState.coinCount} pièce{appState.coinCount > 1 ? 's' : ''}
            </span>
            <button
              type="button"
              onclick={() => changeCoins(1)}
              aria-label="Ajouter une pièce"
              class="w-8 h-8 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center font-bold cursor-pointer"
            >
              <Plus class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <!-- Optional Stability & Assembly Fault Controls -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
        <label class="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
          <div>
            <span class="font-bold text-slate-800 dark:text-slate-200 block">5. Centrage latéral des pièces (Torsion)</span>
            <span class="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
              Décalage actuel : {appState.coinOffsetCm.toFixed(1)} cm
            </span>
          </div>
          <input
            type="range"
            min="-2"
            max="2"
            step="0.2"
            bind:value={appState.coinOffsetCm}
            oninput={() => {
              appState.reset10sTest();
              appState.saveToStorage();
            }}
            class="w-32 accent-amber-500 cursor-pointer"
          />
        </label>

        <label class="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
          <div>
            <span class="font-bold text-slate-800 dark:text-slate-200 block">6. Écart de hauteur sur un pilier carton</span>
            <span class="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
              Défaut de découpe : {appState.pillarMismatchMm} mm
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="8"
            step="1"
            bind:value={appState.pillarMismatchMm}
            oninput={() => {
              appState.reset10sTest();
              appState.saveToStorage();
            }}
            class="w-32 accent-amber-500 cursor-pointer"
          />
        </label>
      </div>

      <!-- Duel Mode Side-by-Side Comparison -->
      {#if appState.duelMode}
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
          <div class="bg-white dark:bg-slate-900 p-4 rounded-lg border border-rose-200 dark:border-rose-900/60 space-y-2">
            <div class="font-bold text-rose-800 dark:text-rose-300">Pont A (Témoin · Feuille A4 plate)</div>
            <div class="font-mono text-lg font-bold text-rose-700 dark:text-rose-400 tabular-nums">
              Flèche : {flatReferenceDeflection} mm · Rigidité ×1.00
            </div>
            <div class="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                class="h-full bg-rose-600"
                style="width: {Math.min(100, (flatReferenceDeflection / 60) * 100)}%"
              ></div>
            </div>
            <p class="text-[11px] text-slate-600 dark:text-slate-400">
              {flatReferenceDeflection > 26
                ? 'Échec avant 4 s : déformation excessive en flexion.'
                : 'Charge légère : tient provisoirement mais très souple.'}
            </p>
          </div>

          <div class="bg-white dark:bg-slate-900 p-4 rounded-lg border border-emerald-200 dark:border-emerald-900/60 space-y-2">
            <div class="font-bold text-emerald-800 dark:text-emerald-300">Pont B (Ta configuration active)</div>
            <div class="font-mono text-lg font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
              Flèche : {deflection} mm · Rigidité ×{appState.stiffnessFactor}
            </div>
            <div class="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                class="h-full {deflection > 26 || unstableLateral ? 'bg-rose-600' : 'bg-emerald-500'}"
                style="width: {Math.min(100, (deflection / 60) * 100)}%"
              ></div>
            </div>
            <p class="text-[11px] text-slate-600 dark:text-slate-400">
              Gain de rigidité : ×{appState.stiffnessFactor} par rapport à la feuille plate A.
            </p>
          </div>
        </div>
      {/if}

      <!-- Interactive Mechanical Bench Stage -->
      <div class="rounded-xl bg-slate-900 dark:bg-slate-950 text-white p-5 border border-slate-800 space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex flex-wrap items-center gap-3 text-xs">
            <span
              class="px-3 py-1 rounded-md font-bold {appState.testStatus === 'passed'
                ? 'bg-emerald-500 text-slate-950'
                : appState.testStatus === 'collapsed'
                  ? 'bg-rose-600 text-white'
                  : appState.testStatus === 'running'
                    ? 'bg-amber-400 text-slate-950'
                    : 'bg-slate-700 text-amber-200'}"
            >
              {#if appState.testStatus === 'passed'}
                Protocole Validé (10,0 s)
              {:else if appState.testStatus === 'collapsed'}
                Effondrement avant 10 s
              {:else if appState.testStatus === 'running'}
                Essai en cours…
              {:else}
                Prêt pour l’essai
              {/if}
            </span>
            <span class="font-mono tabular-nums text-slate-300">
              Flèche estimée : <strong class="text-white">{deflection} mm</strong> · Rigidité ×{appState.stiffnessFactor}
            </span>
          </div>

          <div class="font-mono text-2xl font-bold text-emerald-400 tabular-nums">
            {appState.testElapsedSec.toFixed(1)} s / 10.0 s
          </div>
        </div>

        <!-- SVG Bridge Side View with Live Parabolic Deflection -->
        <div class="flex justify-center">
          <svg viewBox="0 0 600 235" class="w-full max-w-3xl h-auto">
            <rect x="0" y="205" width="600" height="30" fill="#1e293b" />
            <line x1="0" y1="205" x2="600" y2="205" stroke="#475569" stroke-width="3" />

            <!-- Left Cardboard Pillars -->
            <g transform={`translate(${leftPillarX}, 115)`}>
              <rect x="0" y="0" width="24" height="90" rx="3" fill="#b45309" stroke="#f59e0b" stroke-width="1.5" />
              <rect x="26" y="0" width="24" height="90" rx="3" fill="#d97706" stroke="#f59e0b" stroke-width="1.5" />
            </g>

            <!-- Right Cardboard Pillars (showing optional mismatch) -->
            <g transform={`translate(${rightPillarX}, ${115 + appState.pillarMismatchMm * 1.4})`}>
              <rect x="0" y="0" width="24" height="90" rx="3" fill="#d97706" stroke="#f59e0b" stroke-width="1.5" />
              <rect x="26" y="0" width="24" height="90" rx="3" fill="#b45309" stroke="#f59e0b" stroke-width="1.5" />
            </g>

            <!-- Span Dimension Line -->
            <line x1={spanLineX1} y1="185" x2={spanLineX2} y2="185" stroke="#38bdf8" stroke-width="2" stroke-dasharray="5,5" />
            <text x="300" y="200" text-anchor="middle" fill="#38bdf8" font-size="12" font-weight="bold">
              Espace libre : {appState.spanCm} cm {appState.spanCm === 22 ? '(Défi 3e)' : ''}
            </text>

            <!-- Accordion Truss -->
            {#if appState.reinforcementType === 'accordion'}
              <path
                d={`M145,116 Q300,${134 + sagPx * 1.1} 455,116`}
                fill="none"
                stroke="#fbbf24"
                stroke-width="3.5"
                stroke-dasharray="9,5"
              />
            {:else if appState.reinforcementType === 'flat_sheet'}
              <path
                d={`M110,118 Q300,${120 + sagPx * 1.25} 490,118`}
                fill="none"
                stroke="#94a3b8"
                stroke-width="4"
              />
            {/if}

            <!-- Main Deformable Paper Deck -->
            <path
              d={`M80,105 Q300,${midControlY} 520,105 L520,${105 + deckThickness} Q300,${midControlY + deckThickness} 80,${105 + deckThickness} Z`}
              fill="#f8fafc"
              stroke="#cbd5e1"
              stroke-width="2"
            />

            <!-- 3-Tier Cake + Coins Stack riding midpoint sag -->
            <g transform={`translate(${300 + appState.coinOffsetCm * 14}, ${105 + sagPx * 0.65})`}>
              <rect x="-55" y="-20" width="110" height="20" rx="3" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.5" />
              <rect x="-38" y="-38" width="76" height="18" rx="3" fill="#fde68a" stroke="#f59e0b" stroke-width="1.5" />
              <rect x="-22" y="-54" width="44" height="16" rx="3" fill="#fcd34d" stroke="#f59e0b" stroke-width="1.5" />
              <text x="0" y="-6" text-anchor="middle" fill="#78350f" font-size="9" font-weight="bold">Kofi + Abénah</text>
              {#each Array(appState.coinCount) as _, idx}
                <rect
                  x="-14"
                  y={-61 - idx * 6}
                  width="28"
                  height="5"
                  rx="2"
                  fill="#fbbf24"
                  stroke="#b45309"
                  stroke-width="1"
                />
              {/each}
            </g>
          </svg>
        </div>

        <!-- Pedagogical Diagnosis Banner -->
        <div class="p-3.5 rounded-lg bg-slate-800 border border-slate-700 text-xs leading-relaxed flex items-start gap-2.5">
          {#if appState.testStatus === 'collapsed' || deflection > 26 || unstableLateral}
            <TriangleAlert class="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div class="text-slate-200">
              <strong class="text-rose-300">
                {unstableLateral
                  ? 'Instabilité latérale / Torsion détectée :'
                  : `Déformation critique en flexion (${deflection} mm) :`}
              </strong>
              {#if unstableLateral}
                Recentre la charge (décalage ≤ 1,2 cm) et ajuste les 4 piliers à la même hauteur (écart ≤ 3 mm).
              {:else if appState.deckProfile === 'flat'}
                Une feuille A4 plate possède un moment d’inertie trop faible. Plie les bords en <strong>U (2 cm + 1 cm)</strong> !
              {:else if appState.reinforcementType !== 'accordion'}
                Ajoute des <strong>poutres triangulaires en accordéon</strong> (2e feuille A4) sous le centre du tablier.
              {:else}
                À {appState.spanCm} cm, passe au <strong>profil en U renforcé (bords 3 cm)</strong> pour rigidifier la portée.
              {/if}
            </div>
          {:else}
            <CheckCircle2 class="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div class="text-slate-200">
              <strong class="text-emerald-300">Comportement conforme :</strong>
              Sous {appState.coinCount} pièce(s), le tablier transmet les efforts de flexion vers les 4 piliers en compression avec une flèche maîtrisée de {deflection} mm.
            </div>
          {/if}
        </div>
      </div>
    </section>

  <!-- SUB-TAB 2: DRAG & DROP PROCESS SEQUENCER -->
  {:else if appState.subTab2 === 'blocks'}
    <ProcessBlockEditor />

  <!-- SUB-TAB 3: INTERACTIVE SVELTE FLOW BUILDER (4e-3e) -->
  {:else if appState.subTab2 === 'flow'}
    <BridgeFlowBuilder />

  <!-- SUB-TAB 4: CYTOSCAPE LIVE FLOWCHART -->
  {:else}
    <BridgeLogigramme />
  {/if}
</div>
