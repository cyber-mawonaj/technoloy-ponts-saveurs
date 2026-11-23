<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import {
    Activity,
    ChevronDown,
    ChevronUp,
    Eye,
    Flame,
    Layers,
    Play,
    RotateCcw,
    Ruler,
    Sparkles,
    Zap,
  } from 'lucide-svelte';
  import { BRIDGE_COMPONENTS, type BridgeCameraPreset } from '../../lib/data/curriculum';
  import { appState, type CulturalTheme3D } from '../../lib/stores/appState.svelte';
  import { BridgeSceneController } from '../../lib/three/BridgeScene';
  import { playBuzzerTone } from '../../lib/utils/audio';

  interface Props {
    selectedPart?: string;
    explodeFactor?: number;
    onSelectPart?: (partKey: string) => void;
  }

  let {
    selectedPart = appState.selected3DPart,
    explodeFactor = appState.explodeFactor,
    onSelectPart,
  }: Props = $props();

  let mountEl: HTMLDivElement | undefined = $state();
  let controller: BridgeSceneController | null = null;
  let dockCollapsed = $state(false);
  let dockMode = $state<'camera' | 'physics'>('camera');
  let contextLost = $state(false);
  let activePreset = $state<BridgeCameraPreset>('ensemble');

  let lastSeenDropReq = appState.physicsDropRequested;
  let lastSeenResetReq = appState.physicsResetRequested;

  const currentSelectedPart = $derived(selectedPart ?? appState.selected3DPart);
  const currentExplodeFactor = $derived(explodeFactor ?? appState.explodeFactor);

  const selectedSpec = $derived(
    BRIDGE_COMPONENTS.find((c) => c.threeTarget === currentSelectedPart) ?? null,
  );

  onMount(() => {
    if (!mountEl) return;
    controller = new BridgeSceneController(mountEl, {
      onSelectPart: (partKey) => {
        appState.selected3DPart = partKey;
        onSelectPart?.(partKey);
        const found = BRIDGE_COMPONENTS.find((c) => c.threeTarget === partKey);
        if (found) {
          appState.showToast(`Élément inspecté : ${found.name} (${found.material})`, 'info');
        }
      },
      onContextLost: (lost) => {
        contextLost = lost;
      },
      onPhysicsUpdate: (result, statusLabel) => {
        appState.physicsSimResult = result;
        appState.physicsStatusLabel = statusLabel;
        if (result === 'holding' || result === 'tipped' || result === 'collapsed') {
          playBuzzerTone(result === 'holding' ? 1600 : 280, result === 'holding' ? 160 : 280, appState.ebepMode);
        }
      },
    });

    controller.setTheme(appState.theme);

    appState.registerSnapshotCapturer('three', () => {
      return controller ? controller.captureSnapshot() : '';
    });
    appState.registerSnapshotCapturer('threeExploded', () => {
      return controller ? controller.captureExplodedSnapshot() : '';
    });

    const initialSnapTimer = window.setTimeout(() => {
      if (controller) {
        const snap = controller.captureSnapshot();
        if (snap) appState.threeSnapshotUrl = snap;
        const explodedSnap = controller.captureExplodedSnapshot();
        if (explodedSnap) appState.threeExplodedSnapshotUrl = explodedSnap;
      }
    }, 350);

    if (appState.pendingPhysicsDrop) {
      appState.pendingPhysicsDrop = false;
      lastSeenDropReq = appState.physicsDropRequested;
      launchJoltPhysics();
    }

    return () => {
      window.clearTimeout(initialSnapTimer);
    };
  });

  onDestroy(() => {
    if (controller) {
      try {
        const snap = controller.captureSnapshot();
        if (snap) appState.threeSnapshotUrl = snap;
        const explodedSnap = controller.captureExplodedSnapshot();
        if (explodedSnap) appState.threeExplodedSnapshotUrl = explodedSnap;
      } catch {
        // Ignore if context already lost
      }
    }
    appState.unregisterSnapshotCapturer('three');
    appState.unregisterSnapshotCapturer('threeExploded');
    controller?.dispose();
    controller = null;
  });

  $effect(() => {
    if (!controller) return;
    controller.syncBridgeConfiguration(
      appState.deckProfile,
      appState.reinforcementType,
      appState.spanCm,
      appState.coinCount,
      appState.currentDeflectionMm,
      appState.testStatus,
      appState.coinOffsetCm,
      appState.pillarMismatchMm,
    );
  });

  $effect(() => {
    controller?.setExplodeFactor(currentExplodeFactor);
  });

  $effect(() => {
    controller?.setShowFlows(appState.showStressFlows3D);
  });

  $effect(() => {
    controller?.setShowStressHeatmap(appState.showStressHeatmap3D);
  });

  $effect(() => {
    controller?.setXrayDeck(appState.xrayDeck3D);
  });

  $effect(() => {
    controller?.setShowDimensions(appState.showDimensions3D);
  });

  $effect(() => {
    controller?.setFoldProgress(appState.foldProgress3D);
  });

  $effect(() => {
    controller?.updateCulturalBranding(
      appState.culturalTheme3D,
      appState.diySteps.culture_kenya,
      appState.diySteps.culture_nigeria,
    );
  });

  $effect(() => {
    controller?.setIsolateStructure(appState.isolateStructure3D);
  });

  $effect(() => {
    controller?.setTheme(appState.theme);
  });

  $effect(() => {
    if (controller && (appState.pendingPhysicsDrop || appState.physicsDropRequested !== lastSeenDropReq)) {
      appState.pendingPhysicsDrop = false;
      lastSeenDropReq = appState.physicsDropRequested;
      launchJoltPhysics();
    }
  });

  $effect(() => {
    if (appState.physicsResetRequested !== lastSeenResetReq) {
      lastSeenResetReq = appState.physicsResetRequested;
      controller?.resetPhysicsDrop();
    }
  });

  function launchJoltPhysics() {
    if (!controller) return;
    if (appState.explodeFactor > 0.05) {
      appState.explodeFactor = 0;
      appState.viewMode3D = 'assembled';
    }
    controller.startPhysicsDrop({
      deckProfile: appState.deckProfile,
      reinforcement: appState.reinforcementType,
      spanCm: appState.spanCm,
      coinCount: appState.coinCount,
      coinOffsetCm: appState.coinOffsetCm,
      pillarMismatchMm: appState.pillarMismatchMm,
      stiffnessFactor: appState.stiffnessFactor,
    });
  }

  function resetJoltPhysics() {
    appState.triggerPhysicsReset();
    controller?.resetPhysicsDrop();
  }

  function setAssembled() {
    appState.viewMode3D = 'assembled';
    appState.explodeFactor = 0;
  }

  function setExploded() {
    appState.viewMode3D = 'exploded';
    appState.explodeFactor = 1;
  }

  function handleExplodeSlider(e: Event) {
    const val = parseFloat((e.target as HTMLInputElement).value);
    appState.explodeFactor = val;
    appState.viewMode3D = val > 0.15 ? 'exploded' : 'assembled';
  }

  function handleFoldSlider(e: Event) {
    appState.foldProgress3D = parseInt((e.target as HTMLInputElement).value, 10);
  }

  function zoomPreset(preset: BridgeCameraPreset) {
    activePreset = preset;
    controller?.setCameraPreset(preset);
  }

  function resetCamera() {
    appState.selected3DPart = 'ensemble';
    activePreset = 'ensemble';
    controller?.setCameraPreset('ensemble');
  }

  function runQuickTest3D() {
    if (appState.testStatus === 'running') return;
    if (appState.testStatus === 'passed' || appState.testStatus === 'collapsed') {
      appState.reset10sTest();
    }
    appState.start10sTest((ok) => {
      playBuzzerTone(ok ? 1600 : 320, ok ? 180 : 280, appState.ebepMode);
    });
  }

  export function focusComponent(target: string, preset: BridgeCameraPreset) {
    appState.selected3DPart = target;
    activePreset = preset;
    controller?.setCameraPreset(preset);
  }
</script>

<div class="relative w-full h-[540px] rounded-xl border border-slate-200 dark:border-slate-800 bg-[#f4f1ea] dark:bg-[#0b1220] overflow-hidden select-none">
  <!-- Isolated Three.js WebGL Mount Container -->
  <div bind:this={mountEl} class="w-full h-full"></div>

  {#if contextLost}
    <div class="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/95 text-white p-6 text-center">
      <p class="font-semibold text-base">Contexte WebGL interrompu</p>
      <p class="text-xs text-slate-300 mt-1">La vue 3D reprendra automatiquement dès la restauration du pilote graphique.</p>
    </div>
  {/if}

  <!-- Top-Left Spec Card (clean high-contrast surface, no backdrop-blur over WebGL) -->
  <div class="absolute top-3 left-3 z-10 pointer-events-none flex flex-col gap-1 max-w-xs">
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 shadow-sm">
      <div class="text-xs font-semibold text-slate-900 dark:text-slate-100">
        {selectedSpec ? `${selectedSpec.index}. ${selectedSpec.name}` : 'Maquette 3D — Pont Pièce Montée'}
      </div>
      <div class="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 tabular-nums">
        {selectedSpec
          ? `${selectedSpec.material} · ${selectedSpec.dimensions}`
          : `Portée ${appState.spanCm} cm · Flèche ${appState.currentDeflectionMm} mm · ${appState.coinCount} pièce(s)`}
      </div>
    </div>
  </div>

  <!-- Top-Right Live Test & Jolt Physics Status -->
  <div class="hidden sm:flex absolute top-3 right-3 z-10 pointer-events-none flex-col items-end gap-1.5">
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 shadow-xs">
      Glisser : orbiter · Molette : zoomer · Cliquer une pièce
    </div>

    {#if appState.physicsSimResult !== 'idle'}
      <div
        class="px-3 py-1 rounded-lg border text-xs font-semibold shadow-xs {appState.physicsSimResult === 'holding'
          ? 'bg-emerald-600 border-emerald-700 text-white'
          : appState.physicsSimResult === 'tipped' || appState.physicsSimResult === 'collapsed'
            ? 'bg-rose-600 border-rose-700 text-white'
            : 'bg-indigo-600 border-indigo-700 text-white'}"
      >
        JoltPhysics : {appState.physicsStatusLabel}
      </div>
    {/if}

    {#if appState.testStatus !== 'idle'}
      <div
        class="px-3 py-1 rounded-lg border text-xs font-mono font-bold tabular-nums shadow-xs {appState.testStatus === 'passed'
          ? 'bg-emerald-600 border-emerald-700 text-white'
          : appState.testStatus === 'collapsed'
            ? 'bg-rose-600 border-rose-700 text-white'
            : 'bg-amber-500 border-amber-600 text-slate-950'}"
      >
        Essai : {appState.testElapsedSec.toFixed(1)} s / 10.0 s
        {appState.testStatus === 'passed' ? ' · VALIDÉ' : appState.testStatus === 'collapsed' ? ' · EFFONDRÉ' : ''}
      </div>
    {/if}
  </div>

  <!-- Collapsible Bottom Center Control Dock with 2 Clean Mini-Tabs -->
  <div class="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 w-[min(940px,96%)] flex flex-col items-center">
    <button
      type="button"
      onclick={() => (dockCollapsed = !dockCollapsed)}
      class="flex items-center gap-1.5 px-3 py-1 rounded-t-lg bg-white dark:bg-slate-900 border border-b-0 border-slate-300 dark:border-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white shadow-sm cursor-pointer whitespace-nowrap"
    >
      {#if dockCollapsed}
        <ChevronUp class="w-3.5 h-3.5" /> Afficher les commandes 3D
      {:else}
        <ChevronDown class="w-3.5 h-3.5" /> Masquer les commandes
      {/if}
    </button>

    {#if !dockCollapsed}
      <div class="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 shadow-md space-y-2 text-xs">
        <!-- Mini-Tab Switcher + Quick Jolt Trigger -->
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
          <div class="inline-flex p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onclick={() => (dockMode = 'camera')}
              class="px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer {dockMode === 'camera'
                ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-amber-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'}"
            >
              Caméra & Éclaté
            </button>
            <button
              type="button"
              onclick={() => (dockMode = 'physics')}
              class="px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer {dockMode === 'physics'
                ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-amber-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'}"
            >
              Pliage, Contraintes & Jolt 3D
            </button>
          </div>

          <div class="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onclick={launchJoltPhysics}
              class="px-2.5 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1 whitespace-nowrap cursor-pointer"
            >
              <Zap class="w-3.5 h-3.5" /> Chute Physique Jolt
            </button>
            {#if appState.physicsSimResult !== 'idle'}
              <button
                type="button"
                onclick={resetJoltPhysics}
                title="Réinitialiser la simulation Jolt"
                class="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold flex items-center gap-1 whitespace-nowrap cursor-pointer"
              >
                <RotateCcw class="w-3 h-3" /> Reset Jolt
              </button>
            {/if}
            <button
              type="button"
              onclick={runQuickTest3D}
              class="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1 whitespace-nowrap cursor-pointer"
            >
              <Play class="w-3.5 h-3.5" /> Essai 10 s
            </button>
          </div>
        </div>

        {#if dockMode === 'camera'}
          <div class="flex flex-wrap items-center justify-between gap-2">
            <!-- Assembly / Exploded Slider -->
            <div class="flex items-center gap-2">
              <button
                type="button"
                onclick={setAssembled}
                class="px-2.5 py-1 rounded-md font-semibold transition-colors whitespace-nowrap cursor-pointer {currentExplodeFactor <= 0.15
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'}"
              >
                Assemblé
              </button>
              <button
                type="button"
                onclick={setExploded}
                class="px-2.5 py-1 rounded-md font-semibold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1 {currentExplodeFactor > 0.15
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'}"
              >
                <Layers class="w-3.5 h-3.5" /> Éclaté
              </button>
              <label class="flex items-center gap-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-300 pl-1">
                <span>Écartement</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.02"
                  value={currentExplodeFactor}
                  oninput={handleExplodeSlider}
                  aria-label="Facteur de vue éclatée"
                  class="w-20 accent-amber-500 cursor-pointer"
                />
              </label>
            </div>

            <!-- Camera Presets -->
            <div class="flex items-center gap-1 flex-wrap">
              {#each [
                { id: 'ensemble', label: 'Ensemble' },
                { id: 'pillars', label: '4 Piliers' },
                { id: 'deck', label: 'Tablier U' },
                { id: 'reinforcement', label: 'Renforts' },
                { id: 'cake', label: 'Pièce montée' },
              ] as item}
                <button
                  type="button"
                  onclick={() => zoomPreset(item.id as BridgeCameraPreset)}
                  class="px-2 py-1 rounded font-medium whitespace-nowrap cursor-pointer {activePreset === item.id
                    ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 font-semibold'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'}"
                >
                  {item.label}
                </button>
              {/each}
              <button
                type="button"
                onclick={resetCamera}
                title="Réinitialiser la caméra"
                class="p-1.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                <RotateCcw class="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              onclick={() => (appState.isolateStructure3D = !appState.isolateStructure3D)}
              title="Masquer la pièce montée pour inspecter uniquement la structure porteuse"
              class="px-2.5 py-1 rounded-md font-semibold whitespace-nowrap cursor-pointer {appState.isolateStructure3D
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'}"
            >
              Structure seule
            </button>
          </div>
        {:else}
          <div class="flex flex-wrap items-center justify-between gap-2">
            <!-- Origami Fold Slider -->
            <label class="flex items-center gap-2 text-[11px] font-semibold text-slate-700 dark:text-slate-200">
              <span class="tabular-nums">Pliage U ({appState.foldProgress3D}%)</span>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={appState.foldProgress3D}
                oninput={handleFoldSlider}
                aria-label="Animation pliage origami en U"
                class="w-24 accent-amber-500 cursor-pointer"
              />
            </label>

            <!-- Structural Inspection Overlays -->
            <div class="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onclick={() => (appState.showStressHeatmap3D = !appState.showStressHeatmap3D)}
                class="px-2 py-1 rounded-md font-semibold flex items-center gap-1 whitespace-nowrap cursor-pointer {appState.showStressHeatmap3D
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'}"
              >
                <Flame class="w-3.5 h-3.5" /> Contraintes
              </button>

              <button
                type="button"
                onclick={() => (appState.xrayDeck3D = !appState.xrayDeck3D)}
                class="px-2 py-1 rounded-md font-semibold flex items-center gap-1 whitespace-nowrap cursor-pointer {appState.xrayDeck3D
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'}"
              >
                <Eye class="w-3.5 h-3.5" /> Rayons X
              </button>

              <button
                type="button"
                onclick={() => (appState.showDimensions3D = !appState.showDimensions3D)}
                class="px-2 py-1 rounded-md font-semibold flex items-center gap-1 whitespace-nowrap cursor-pointer {appState.showDimensions3D
                  ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'}"
              >
                <Ruler class="w-3.5 h-3.5" /> Cotes
              </button>

              <button
                type="button"
                onclick={() => (appState.showStressFlows3D = !appState.showStressFlows3D)}
                class="px-2 py-1 rounded-md font-semibold flex items-center gap-1 whitespace-nowrap cursor-pointer {appState.showStressFlows3D
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'}"
              >
                <Activity class="w-3.5 h-3.5" /> Flux
              </button>

              <button
                type="button"
                onclick={() => {
                  appState.spanCm = appState.spanCm === 18 ? 22 : 18;
                  appState.reset10sTest();
                  appState.saveToStorage();
                }}
                class="px-2 py-1 rounded-md font-semibold whitespace-nowrap cursor-pointer {appState.spanCm === 22
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'}"
              >
                Portée {appState.spanCm} cm
              </button>
            </div>

            <!-- Cultural Theme Switcher -->
            <div class="flex items-center gap-1">
              <Sparkles class="w-3.5 h-3.5 text-amber-500" />
              {#each [
                { id: 'fusion', label: 'Fusion' },
                { id: 'kenya', label: 'Kenya' },
                { id: 'nigeria', label: 'Nigeria' },
              ] as t}
                <button
                  type="button"
                  onclick={() => {
                    appState.culturalTheme3D = t.id as CulturalTheme3D;
                    appState.saveToStorage();
                  }}
                  class="px-2 py-1 rounded font-semibold whitespace-nowrap cursor-pointer {appState.culturalTheme3D === t.id
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'}"
                >
                  {t.label}
                </button>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>
