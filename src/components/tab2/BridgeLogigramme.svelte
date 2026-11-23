<script lang="ts">
  import cytoscape, { type Core, type StylesheetStyle } from 'cytoscape';
  import { onDestroy, onMount } from 'svelte';
  import { appState } from '../../lib/stores/appState.svelte';

  let containerEl: HTMLDivElement | undefined = $state();
  let cy: Core | null = null;

  function buildCyStyle(isDark: boolean): StylesheetStyle[] {
    return [
      {
        selector: 'node',
        style: {
          label: 'data(label)',
          'text-valign': 'center',
          'text-halign': 'center',
          'font-size': '11px',
          'font-weight': 'bold',
          'font-family': 'DM Sans, sans-serif',
          color: isDark ? '#f1f5f9' : '#0f172a',
          width: '175px',
          height: '44px',
          'border-width': 2,
          'border-color': isDark ? '#475569' : '#64748b',
          'background-color': isDark ? '#1e293b' : '#ffffff',
        },
      },
      {
        selector: 'node[shape="ellipse"]',
        style: {
          shape: 'ellipse',
          'background-color': isDark ? '#451a03' : '#fef3c7',
          'border-color': '#f59e0b',
          color: isDark ? '#fef3c7' : '#0f172a',
        },
      },
      {
        selector: 'node[shape="rhombus"]',
        style: {
          shape: 'diamond',
          width: '190px',
          height: '66px',
          'background-color': isDark ? '#0c4a6e' : '#e0f2fe',
          'border-color': isDark ? '#38bdf8' : '#0284c7',
          color: isDark ? '#f0f9ff' : '#0f172a',
        },
      },
      {
        selector: 'node[shape="parallelogram"]',
        style: {
          shape: 'rhomboid',
          'background-color': isDark ? '#064e3b' : '#d1fae5',
          'border-color': '#10b981',
          color: isDark ? '#ecfdf5' : '#0f172a',
        },
      },
      {
        selector: 'edge',
        style: {
          width: 2.5,
          'line-color': isDark ? '#64748b' : '#94a3b8',
          'target-arrow-color': isDark ? '#64748b' : '#94a3b8',
          'target-arrow-shape': 'triangle',
          'curve-style': 'bezier',
          label: 'data(label)',
          'font-size': '10px',
          'font-weight': 'bold',
          color: isDark ? '#cbd5e1' : '#475569',
          'text-background-color': isDark ? '#0f172a' : '#f8fafc',
          'text-background-opacity': 1,
          'text-background-padding': '3px',
        },
      },
      {
        selector: '.active-node',
        style: {
          'background-color': '#059669',
          color: '#ffffff',
          'border-color': '#34d399',
          'border-width': 3.5,
        },
      },
      {
        selector: '.error-node',
        style: {
          'background-color': '#dc2626',
          color: '#ffffff',
          'border-color': '#f87171',
          'border-width': 3.5,
        },
      },
      {
        selector: '.active-edge',
        style: {
          'line-color': '#10b981',
          'target-arrow-color': '#10b981',
          width: 4,
        },
      },
    ];
  }

  onMount(() => {
    if (!containerEl) return;
    cy = cytoscape({
      container: containerEl,
      style: buildCyStyle(appState.theme === 'dark'),
      elements: [
        { data: { id: 'start', label: 'DÉBUT PROTOCOLE', shape: 'ellipse' }, position: { x: 340, y: 38 } },
        { data: { id: 'measure', label: 'Contrôler portée 18 cm', shape: 'parallelogram' }, position: { x: 340, y: 112 } },
        { data: { id: 'load', label: 'Poser 5 pièces + Chrono 10 s', shape: 'rectangle' }, position: { x: 340, y: 186 } },
        { data: { id: 'test', label: 'Tient ≥ 10 s sans fléchir ?', shape: 'rhombus' }, position: { x: 340, y: 274 } },
        { data: { id: 'ok', label: 'Cahier des charges VALIDÉ', shape: 'rectangle' }, position: { x: 165, y: 374 } },
        { data: { id: 'improve', label: 'Ajouter pli U + Accordéon', shape: 'rectangle' }, position: { x: 515, y: 374 } },
        { data: { id: 'e1', source: 'start', target: 'measure' } },
        { data: { id: 'e2', source: 'measure', target: 'load' } },
        { data: { id: 'e3', source: 'load', target: 'test' } },
        { data: { id: 'e4', source: 'test', target: 'ok', label: 'OUI (Flèche ≤ 26 mm)' } },
        { data: { id: 'e5', source: 'test', target: 'improve', label: 'NON (Effondrement)' } },
      ],
      layout: { name: 'preset' },
      userZoomingEnabled: false,
      userPanningEnabled: false,
    });

    cy.fit(undefined, 20);

    appState.registerSnapshotCapturer('logigramme', () => {
      if (!cy) return '';
      const wasDark = appState.theme === 'dark';
      if (wasDark) cy.style(buildCyStyle(false));
      const img = cy.png({ full: true, scale: 2, bg: '#ffffff' });
      if (wasDark) cy.style(buildCyStyle(true));
      return img;
    });

    const onResize = () => {
      cy?.resize();
      cy?.fit(undefined, 20);
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
    };
  });

  onDestroy(() => {
    appState.unregisterSnapshotCapturer('logigramme');
    cy?.destroy();
    cy = null;
  });

  $effect(() => {
    if (!cy) return;
    cy.style(buildCyStyle(appState.theme === 'dark'));
  });

  $effect(() => {
    if (!cy) return;
    const span = appState.spanCm;
    const coins = appState.coinCount;
    const deflection = appState.currentDeflectionMm;
    const stepNode = appState.activeStepCyNode;
    const isCollapsed = appState.testStatus === 'collapsed' || deflection > 26;

    cy.$('#measure').data('label', `Contrôler portée ${span} cm`);
    cy.$('#load').data('label', `Poser ${coins} pièce(s) · ${deflection} mm`);

    cy.elements().removeClass('active-node active-edge error-node');

    if (stepNode) {
      cy.$(`#${stepNode}`).addClass(stepNode === 'improve' ? 'error-node' : 'active-node');
      return;
    }

    cy.$('#start, #measure, #load, #test, #e1, #e2, #e3').addClass('active-node active-edge');

    if (isCollapsed) {
      cy.$('#improve').addClass('error-node');
      cy.$('#e5').addClass('active-edge');
    } else if (coins >= 5) {
      cy.$('#ok, #e4').addClass('active-node active-edge');
    }
  });
</script>

<section class="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 space-y-3">
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
    <div>
      <h3 class="text-base font-semibold text-slate-900 dark:text-slate-100">
        Logigramme Décisionnel du Protocole d’Essai (Cytoscape.js)
      </h3>
      <p class="text-xs text-slate-600 dark:text-slate-400">
        La branche active réagit en direct à la portée ({appState.spanCm} cm), au profil du tablier et au résultat de flexion.
      </p>
    </div>
    <div class="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 font-mono">
      <span>Ovale : Début</span>
      <span>·</span>
      <span>Losange : Critère 10 s</span>
    </div>
  </div>

  <div bind:this={containerEl} class="w-full h-[430px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"></div>
</section>
