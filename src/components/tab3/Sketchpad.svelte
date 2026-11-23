<script lang="ts">
  import { Eraser, PenTool, Sparkles, Trash2 } from 'lucide-svelte';
  import { onDestroy, onMount } from 'svelte';
  import { appState } from '../../lib/stores/appState.svelte';

  let canvasEl: HTMLCanvasElement | undefined = $state();
  let brushColor = $state('#0f172a');
  let eraserActive = $state(false);
  let drawing = false;
  let resizeObserver: ResizeObserver | null = null;

  const COLORS = [
    { hex: '#0f172a', label: 'Noir' },
    { hex: '#d97706', label: 'Ambre' },
    { hex: '#2563eb', label: 'Bleu' },
    { hex: '#16a34a', label: 'Vert' },
    { hex: '#dc2626', label: 'Rouge' },
  ];

  function saveSnapshot() {
    if (!canvasEl) return;
    try {
      appState.sketchSnapshotUrl = canvasEl.toDataURL('image/png');
      appState.saveToStorage();
    } catch {
      // Ignore export error
    }
  }

  function restoreFromSnapshot() {
    if (!canvasEl || !appState.sketchSnapshotUrl) return;
    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;
    const img = new Image();
    img.onload = () => {
      if (!canvasEl) return;
      ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
      ctx.drawImage(img, 0, 0, canvasEl.width, canvasEl.height);
    };
    img.src = appState.sketchSnapshotUrl;
  }

  function resizeCanvas() {
    if (!canvasEl || !canvasEl.parentElement) return;
    const targetW = Math.max(canvasEl.parentElement.clientWidth, 320);
    const targetH = 290;
    if (canvasEl.width === targetW && canvasEl.height === targetH) return;

    const ctx = canvasEl.getContext('2d');
    let prevDataUrl = '';
    if (canvasEl.width > 0 && canvasEl.height > 0) {
      try {
        prevDataUrl = canvasEl.toDataURL('image/png');
      } catch {
        prevDataUrl = '';
      }
    }

    canvasEl.width = targetW;
    canvasEl.height = targetH;

    const src = prevDataUrl || appState.sketchSnapshotUrl;
    if (ctx && src) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, targetW, targetH);
      };
      img.src = src;
    }
  }

  onMount(() => {
    if (!canvasEl) return;
    resizeCanvas();
    restoreFromSnapshot();

    appState.registerSnapshotCapturer('sketchpad', () => {
      return canvasEl ? canvasEl.toDataURL('image/png') : appState.sketchSnapshotUrl;
    });

    if (canvasEl.parentElement) {
      resizeObserver = new ResizeObserver(() => resizeCanvas());
      resizeObserver.observe(canvasEl.parentElement);
    }
  });

  onDestroy(() => {
    appState.unregisterSnapshotCapturer('sketchpad');
    resizeObserver?.disconnect();
  });

  function getPos(e: PointerEvent): { x: number; y: number } {
    if (!canvasEl) return { x: 0, y: 0 };
    const rect = canvasEl.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvasEl.width,
      y: ((e.clientY - rect.top) / rect.height) * canvasEl.height,
    };
  }

  function handlePointerDown(e: PointerEvent) {
    if (!canvasEl) return;
    canvasEl.setPointerCapture(e.pointerId);
    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;
    drawing = true;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }

  function handlePointerMove(e: PointerEvent) {
    if (!drawing || !canvasEl) return;
    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    if (eraserActive) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = 14;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = 2.6;
    }
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  }

  function handlePointerUp() {
    if (!drawing) return;
    drawing = false;
    const ctx = canvasEl?.getContext('2d');
    if (ctx) ctx.globalCompositeOperation = 'source-over';
    saveSnapshot();
  }

  function clearSketchpad() {
    if (!canvasEl) return;
    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
    appState.sketchSnapshotUrl = '';
    appState.saveToStorage();
  }

  function loadTemplateSketch() {
    if (!canvasEl) return;
    resizeCanvas();
    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
    ctx.globalCompositeOperation = 'source-over';

    const w = canvasEl.width;
    const h = canvasEl.height;

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;

    // 4 Pillars (left pair + right pair)
    ctx.fillStyle = '#fde68a';
    ctx.fillRect(w * 0.14, h * 0.56, 36, 94);
    ctx.strokeRect(w * 0.14, h * 0.56, 36, 94);
    ctx.fillRect(w * 0.86 - 36, h * 0.56, 36, 94);
    ctx.strokeRect(w * 0.86 - 36, h * 0.56, 36, 94);

    // U-folded Deck
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(w * 0.11, h * 0.49, w * 0.78, 18);
    ctx.strokeRect(w * 0.11, h * 0.49, w * 0.78, 18);

    // Accordion reinforcement under deck
    ctx.beginPath();
    ctx.strokeStyle = '#d97706';
    const startX = w * 0.22;
    const endX = w * 0.78;
    const steps = 10;
    for (let i = 0; i <= steps; i++) {
      const px = startX + ((endX - startX) * i) / steps;
      const py = i % 2 === 0 ? h * 0.55 : h * 0.62;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // 3-Tier Cake
    ctx.strokeStyle = '#0f172a';
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(w * 0.36, h * 0.38, w * 0.28, 30);
    ctx.strokeRect(w * 0.36, h * 0.38, w * 0.28, 30);
    ctx.fillRect(w * 0.41, h * 0.27, w * 0.18, 28);
    ctx.strokeRect(w * 0.41, h * 0.27, w * 0.18, 28);
    ctx.fillRect(w * 0.455, h * 0.17, w * 0.09, 25);
    ctx.strokeRect(w * 0.455, h * 0.17, w * 0.09, 25);

    // Dimension & Legend Annotations
    ctx.fillStyle = '#0284c7';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`← Espace libre : ${appState.spanCm} cm →`, w * 0.5, h * 0.86);

    ctx.fillStyle = '#0f172a';
    ctx.fillText('Pièce montée (3 étages)', w * 0.5, h * 0.12);
    ctx.fillText('Tablier U + Renforts accordéon', w * 0.5, h * 0.72);
    ctx.fillStyle = '#b45309';
    ctx.fillText('Appuis carton', w * 0.17, h * 0.96);
    ctx.fillText('Appuis carton', w * 0.83, h * 0.96);

    saveSnapshot();
    appState.showToast('Modèle de croquis annoté (5 repères) inséré et sauvegardé !', 'info');
  }
</script>

<div class="space-y-3">
  <div class="flex flex-wrap items-center justify-between gap-2">
    <div class="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-100">
      <PenTool class="w-4 h-4 text-amber-600 dark:text-amber-400" />
      <span>Espace de Croquis Numérique</span>
    </div>

    <div class="flex flex-wrap items-center gap-1.5">
      {#each COLORS as c}
        <button
          type="button"
          onclick={() => {
            brushColor = c.hex;
            eraserActive = false;
          }}
          title={`Couleur ${c.label}`}
          aria-label={`Couleur ${c.label}`}
          class="w-6 h-6 rounded-full border-2 cursor-pointer transition-transform {brushColor === c.hex && !eraserActive
            ? 'border-amber-500 scale-110 shadow'
            : 'border-white dark:border-slate-600 shadow-xs'}"
          style="background-color: {c.hex};"
        ></button>
      {/each}

      <button
        type="button"
        onclick={() => (eraserActive = !eraserActive)}
        class="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg font-medium border cursor-pointer {eraserActive
          ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 border-slate-900 dark:border-amber-500'
          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}"
      >
        <Eraser class="w-3.5 h-3.5" /> Gomme
      </button>

      <button
        type="button"
        onclick={loadTemplateSketch}
        class="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 rounded-lg font-semibold hover:bg-amber-200 dark:hover:bg-amber-900/60 cursor-pointer"
      >
        <Sparkles class="w-3.5 h-3.5" /> + Modèle d’aide
      </button>

      <button
        type="button"
        onclick={clearSketchpad}
        class="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 rounded-lg font-semibold hover:bg-rose-200 dark:hover:bg-rose-900/60 cursor-pointer"
      >
        <Trash2 class="w-3.5 h-3.5" /> Effacer
      </button>
    </div>
  </div>

  <!-- Crisp white drawing paper preserved for dark ink legibility & A4 PDF export -->
  <div class="border-2 border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden bg-white shadow-inner">
    <canvas
      bind:this={canvasEl}
      onpointerdown={handlePointerDown}
      onpointermove={handlePointerMove}
      onpointerup={handlePointerUp}
      onpointercancel={handlePointerUp}
      class="sketchpad-grid w-full h-[290px] cursor-crosshair block"
    ></canvas>
  </div>

  <p class="text-xs text-slate-500 dark:text-slate-400">
    <strong class="text-slate-700 dark:text-slate-200">5 repères obligatoires sur ton croquis :</strong> les 2 lignes d’appui, la portée libre ({appState.spanCm} cm), le tablier, les renforts et la pièce montée à 3 étages. (Sauvegardé automatiquement pour l’export PDF A4.)
  </p>
</div>
