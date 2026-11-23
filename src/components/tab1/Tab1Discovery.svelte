<script lang="ts">
  import {
    AlertTriangle,
    Box,
    CheckCircle2,
    Compass,
    HelpCircle,
    Ruler,
    Wrench,
  } from 'lucide-svelte';
  import {
    BRIDGE_COMPONENTS,
    CAHIER_DES_CHARGES,
    MATERIALS_AND_SAFETY,
    type BridgeComponentSpec,
  } from '../../lib/data/curriculum';
  import { appState } from '../../lib/stores/appState.svelte';
  import BridgeDrawingsSVG from './BridgeDrawingsSVG.svelte';
  import BridgeScene3D from './BridgeScene3D.svelte';

  let viewportRef: BridgeScene3D | undefined = $state();

  const subProblemText = $derived.by(() => {
    if (appState.studentInfo.niveau === '5e') {
      return '5e · Identifier tablier, piles et renforts ; réaliser un pont stable en U franchissant 18 cm.';
    }
    if (appState.studentInfo.niveau === '4e') {
      return '4e · Expliquer la flexion, planifier les 17 min de fabrication et comparer forme plate vs pliage en U / triangles.';
    }
    return '3e · Intégrer l’écoconception (papier/carton), concevoir le protocole complet et relever le défi 22 cm.';
  });

  const activeSpec = $derived(
    BRIDGE_COMPONENTS.find((c) => c.threeTarget === appState.selected3DPart) ?? BRIDGE_COMPONENTS[0],
  );

  function inspectComponent(comp: BridgeComponentSpec) {
    viewportRef?.focusComponent(comp.threeTarget, comp.zoomPreset);
  }
</script>

<div class="space-y-5">
  <!-- Clean Sub-Tab Navigation -->
  <div class="bg-white dark:bg-slate-900 rounded-xl p-2 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
    <div class="flex flex-wrap items-center gap-1.5 text-xs">
      <button
        type="button"
        onclick={() => (appState.subTab1 = '3d')}
        class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer {appState.subTab1 === '3d'
          ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950'
          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}"
      >
        <Box class="w-3.5 h-3.5" /> Maquette 3D & Nomenclature
      </button>
      <button
        type="button"
        onclick={() => (appState.subTab1 = 'mission')}
        class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer {appState.subTab1 === 'mission'
          ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950'
          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}"
      >
        <Compass class="w-3.5 h-3.5" /> Mission & Cahier des charges
      </button>
      <button
        type="button"
        onclick={() => (appState.subTab1 = 'plans')}
        class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer {appState.subTab1 === 'plans'
          ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950'
          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}"
      >
        <Ruler class="w-3.5 h-3.5" /> Plans Techniques ISO E
      </button>
    </div>

    <div class="px-3 text-xs text-slate-500 dark:text-slate-400 hidden md:block">
      Enjeu {appState.studentInfo.niveau} · 3 feuilles A4 max + 2 tubes carton
    </div>
  </div>

  <!-- SUB-TAB 1: 3D PBR VIEWPORT + INTERACTIVE NOMENCLATURE INSPECTOR -->
  {#if appState.subTab1 === '3d'}
    <div class="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
      <div class="xl:col-span-8">
        <BridgeScene3D
          bind:this={viewportRef}
          selectedPart={appState.selected3DPart}
          explodeFactor={appState.explodeFactor}
        />
      </div>

      <!-- Right-Hand Interactive Nomenclature Inspector -->
      <aside class="xl:col-span-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-4">
        <div class="border-b border-slate-200 dark:border-slate-800 pb-3">
          <div class="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
            Inspecteur de Maquette · 5 Sous-Ensembles
          </div>
          <h2 class="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
            Nomenclature interactive
          </h2>
          <p class="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Clique sur un sous-ensemble pour orienter la caméra 3D et analyser son rôle.
          </p>
        </div>

        <div class="space-y-2">
          {#each BRIDGE_COMPONENTS as comp}
            {@const isSelected = appState.selected3DPart === comp.threeTarget}
            <button
              type="button"
              onclick={() => inspectComponent(comp)}
              class="w-full text-left p-3 rounded-lg border transition-colors cursor-pointer {isSelected
                ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/35'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/70'}"
            >
              <div class="flex items-center justify-between gap-2 text-xs">
                <span class="font-bold text-slate-900 dark:text-slate-100">
                  <span class="font-mono text-amber-700 dark:text-amber-400 mr-1.5">{comp.index}</span>{comp.name}
                </span>
                <span class="text-[11px] font-mono text-slate-500 dark:text-slate-400 shrink-0">{comp.dimensions}</span>
              </div>
              {#if isSelected}
                <p class="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mt-1.5">{comp.role}</p>
                <div class="text-[11px] font-mono text-amber-800 dark:text-amber-300 mt-1">Matériau : {comp.material}</div>
              {/if}
            </button>
          {/each}
        </div>

        {#if activeSpec}
          <div class="p-3 rounded-lg bg-slate-900 dark:bg-slate-950 border border-slate-800 text-white text-xs space-y-1">
            <div class="font-semibold text-amber-300">Objectif actif ({appState.studentInfo.niveau})</div>
            <p class="text-slate-200 leading-relaxed">{subProblemText}</p>
          </div>
        {/if}
      </aside>
    </div>

  <!-- SUB-TAB 2: SITUATION-PROBLEME, PROBLEMATIQUE, CAHIER DES CHARGES & SECURITE -->
  {:else if appState.subTab1 === 'mission'}
    <div class="space-y-5">
      <section class="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div class="space-y-2 max-w-3xl">
          <div class="text-xs font-semibold text-amber-700 dark:text-amber-400">
            Fête de la Science 2026 · Thème « Saveur savante » · TechnoLOY
          </div>
          <h2 class="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Situation-Problème : La commande de Monsieur Loyalle pour Kofi & Abénah
          </h2>
          <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Le pâtissier <strong class="text-slate-900 dark:text-white">Monsieur Loyalle</strong> doit réaliser une pièce montée originale pour le mariage de
            <strong class="text-slate-900 dark:text-white">Kofi Seÿkou-Touré</strong> (originaire du <strong class="text-slate-900 dark:text-white">Kenya</strong>) et d’<strong class="text-slate-900 dark:text-white">Abénah Obi-Kâ</strong>
            (originaire du <strong class="text-slate-900 dark:text-white">Nigeria</strong>). Les mariés souhaitent un gâteau en forme de pont symbolisant leur
            devise : <em>« Deux histoires, deux héritages, un pont vers l’avenir. »</em>
          </p>
        </div>

        <div class="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 lg:max-w-sm shrink-0 space-y-1.5">
          <div class="text-xs font-semibold text-slate-500 dark:text-slate-400">Enjeu actif ({appState.studentInfo.niveau})</div>
          <p class="text-sm font-semibold text-slate-900 dark:text-slate-100">{subProblemText}</p>
        </div>
      </section>

      <section class="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl p-5 flex items-start gap-3.5">
        <HelpCircle class="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
        <div class="space-y-1">
          <div class="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">Problématique technologique</div>
          <p class="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
            Comment concevoir et réaliser une maquette de pont stable et résistante, en utilisant des feuilles blanches A4 et des tubes en carton de rouleaux d’essuie-tout, pour représenter une pièce montée symbolisant l’union de deux histoires culturelles ?
          </p>
        </div>
      </section>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section class="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div class="px-5 py-3.5 bg-slate-900 dark:bg-slate-950 text-white border-b border-slate-800 flex items-center justify-between">
            <h3 class="text-sm font-bold">Cahier des Charges de Monsieur Loyalle</h3>
            <span class="text-xs font-mono text-amber-300">8 exigences · Cycle 4</span>
          </div>
          <div class="divide-y divide-slate-100 dark:divide-slate-800">
            {#each CAHIER_DES_CHARGES as req}
              <div class="p-4 grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                <div class="sm:col-span-3 font-bold text-slate-900 dark:text-slate-100">{req.critere}</div>
                <div class="sm:col-span-6 text-slate-700 dark:text-slate-300 leading-relaxed">{req.exigence}</div>
                <div class="sm:col-span-3 text-slate-500 dark:text-slate-400 font-mono text-[11px]">{req.verification}</div>
              </div>
            {/each}
          </div>
        </section>

        <div class="space-y-6">
          <section class="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Wrench class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Matériel & Outils Autorisés
            </h3>
            <ul class="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              {#each MATERIALS_AND_SAFETY.materials as m}
                <li class="flex items-start gap-2">
                  <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>{m}</span>
                </li>
              {/each}
            </ul>
            <div class="pt-2 border-t border-slate-100 dark:border-slate-800">
              <div class="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Outils & finition</div>
              <ul class="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                {#each MATERIALS_AND_SAFETY.tools as t}
                  <li>· {t}</li>
                {/each}
              </ul>
            </div>
          </section>

          <section class="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 rounded-xl p-5 space-y-2">
            <h4 class="text-sm font-bold text-rose-900 dark:text-rose-200 flex items-center gap-2">
              <AlertTriangle class="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              Consignes de Sécurité DIY
            </h4>
            <ul class="space-y-1.5 text-xs text-rose-900 dark:text-rose-200/90 leading-relaxed">
              {#each MATERIALS_AND_SAFETY.safetyRules as r}
                <li>· {r}</li>
              {/each}
            </ul>
          </section>
        </div>
      </div>
    </div>

  <!-- SUB-TAB 3: DESSINS TECHNIQUES ISO E -->
  {:else}
    <BridgeDrawingsSVG />
  {/if}
</div>
