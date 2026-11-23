<script lang="ts">
  import {
    Accessibility,
    ChevronDown,
    ChevronUp,
    Download,
    FileDown,
    FolderUp,
    Moon,
    Printer,
    Sun,
    UserCheck,
  } from 'lucide-svelte';
  import type { GradeLevel } from '../../lib/data/curriculum';
  import { appState } from '../../lib/stores/appState.svelte';
  import { generateStudentSheetPdf } from '../../lib/utils/pdfExport';
  import PWAControls from '../pwa/PWAControls.svelte';
  import PwaStatus from '../pwa/PwaStatus.svelte';

  let fileInputEl: HTMLInputElement | undefined = $state();
  let isGeneratingPdf = $state(false);

  const TABS = [
    { id: 1, label: '1. Découverte 3D' },
    { id: 2, label: '2. Simulateur 10s' },
    { id: 3, label: '3. Atelier DIY' },
    { id: 4, label: '4. Évaluations' },
    { id: 5, label: '5. Comparatifs' },
    { id: 6, label: '6. Guide Prof' },
    { id: 7, label: '7. Bilan & Révision' },
  ];

  const identitySummary = $derived.by(() => {
    const fullName = [appState.studentInfo.prenom, appState.studentInfo.nom]
      .filter((s) => s.trim().length > 0)
      .join(' ');
    const parts = [
      fullName || 'Élève non renseigné',
      appState.studentInfo.classe || null,
      appState.studentInfo.groupe || null,
    ].filter(Boolean);
    return parts.join(' · ');
  });

  function handleLevelChange(e: Event) {
    const val = (e.target as HTMLSelectElement).value as GradeLevel;
    appState.syncNiveau(val);
  }

  function handlePrint() {
    appState.capturePrintSnapshots();
    window.setTimeout(() => window.print(), 80);
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

  function handleImportFile(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      appState.importStudentJSON(file);
      input.value = '';
    }
  }
</script>

<!-- Top Bar Contract: strictly single-row, 3 zones cleanly separated -->
<header class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 no-print">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
    <!-- Zone 1: Brand Wordmark -->
    <button
      type="button"
      onclick={() => (appState.activeTab = 1)}
      class="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap shrink-0 cursor-pointer"
    >
      Pont des Saveurs · TechnoLOY
    </button>

    <!-- Zone 2: Clean Single-Line Navigation Links -->
    <nav aria-label="Navigation principale" class="hidden xl:flex items-center gap-3.5 text-xs font-medium">
      {#each TABS as tab}
        <button
          type="button"
          onclick={() => (appState.activeTab = tab.id)}
          class="py-1.5 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer {appState.activeTab === tab.id
            ? 'border-amber-600 dark:border-amber-400 text-amber-800 dark:text-amber-300 font-semibold'
            : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'}"
        >
          {tab.label}
        </button>
      {/each}
    </nav>

    <!-- Zone 3: Primary Action & PWA -->
    <div class="flex items-center gap-2 shrink-0">
      <PwaStatus />
      <PWAControls />
      <button
        type="button"
        onclick={handlePrint}
        class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
      >
        <Printer class="w-3.5 h-3.5" />
        Imprimer A4
      </button>
    </div>
  </div>

  <!-- Responsive Tab Bar for tablet / mobile / standard laptops -->
  <div class="xl:hidden border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90">
    <div class="max-w-7xl mx-auto px-4 py-1.5 flex items-center gap-1.5 overflow-x-auto">
      {#each TABS as tab}
        <button
          type="button"
          onclick={() => (appState.activeTab = tab.id)}
          class="px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer {appState.activeTab === tab.id
            ? 'bg-amber-600 dark:bg-amber-500 text-white dark:text-slate-950 font-semibold'
            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}"
        >
          {tab.label}
        </button>
      {/each}
    </div>
  </div>
</header>

<!-- Compact Workspace Strip + Collapsible Student Identity & JSON Drawer -->
<section class="bg-slate-100 dark:bg-slate-900/75 border-b border-slate-200 dark:border-slate-800 no-print">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2.5 text-xs">
    <div class="flex flex-wrap items-center gap-2.5">
      <label class="inline-flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
        <span>Niveau</span>
        <select
          aria-label="Niveau scolaire"
          value={appState.studentInfo.niveau}
          onchange={handleLevelChange}
          class="bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-500/50 rounded-md px-2 py-1 text-amber-950 dark:text-amber-200 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
        >
          <option value="5e">5e · Découverte &amp; Pliage</option>
          <option value="4e">4e · Flexion &amp; 17 min</option>
          <option value="3e">3e · Écoconception 22 cm</option>
        </select>
      </label>

      <button
        type="button"
        onclick={() => (appState.studentDrawerOpen = !appState.studentDrawerOpen)}
        aria-expanded={appState.studentDrawerOpen}
        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium whitespace-nowrap cursor-pointer"
      >
        <UserCheck class="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
        <span class="truncate max-w-[220px] sm:max-w-xs">{identitySummary}</span>
        {#if appState.studentDrawerOpen}
          <ChevronUp class="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
        {:else}
          <ChevronDown class="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
        {/if}
      </button>
    </div>

    <div class="flex flex-wrap items-center gap-2 shrink-0">
      <button
        type="button"
        onclick={() => appState.toggleTheme()}
        aria-label={appState.theme === 'dark' ? 'Passer au thème clair' : 'Passer au thème sombre'}
        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer"
      >
        {#if appState.theme === 'dark'}
          <Sun class="w-3.5 h-3.5 text-amber-400" />
          Clair
        {:else}
          <Moon class="w-3.5 h-3.5 text-slate-600" />
          Sombre
        {/if}
      </button>

      <button
        type="button"
        onclick={() => appState.toggleEbep()}
        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer {appState.ebepMode
          ? 'bg-amber-500 border-amber-600 text-slate-950'
          : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'}"
      >
        <Accessibility class="w-3.5 h-3.5" />
        {appState.ebepMode ? 'EBEP actif' : 'Mode EBEP'}
      </button>

      <button
        type="button"
        onclick={handleGeneratePdf}
        disabled={isGeneratingPdf}
        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-semibold whitespace-nowrap cursor-pointer"
      >
        <FileDown class="w-3.5 h-3.5" />
        {isGeneratingPdf ? 'PDF…' : 'Fiche PDF'}
      </button>

      {#if appState.lastSavedAt}
        <span class="text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums whitespace-nowrap hidden sm:inline">
          Enregistré {appState.lastSavedAt}
        </span>
      {/if}
    </div>
  </div>

  {#if appState.studentDrawerOpen}
    <div class="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col lg:flex-row lg:items-end justify-between gap-3">
        <div class="grid grid-cols-2 sm:grid-cols-5 gap-2.5 flex-grow text-xs">
          <div>
            <label for="stuNom" class="block text-slate-600 dark:text-slate-400 font-medium mb-1">Nom</label>
            <input
              id="stuNom"
              type="text"
              bind:value={appState.studentInfo.nom}
              oninput={() => appState.saveToStorage()}
              placeholder="ex : SEŸKOU"
              class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2.5 py-1.5 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label for="stuPrenom" class="block text-slate-600 dark:text-slate-400 font-medium mb-1">Prénom</label>
            <input
              id="stuPrenom"
              type="text"
              bind:value={appState.studentInfo.prenom}
              oninput={() => appState.saveToStorage()}
              placeholder="ex : Abénah"
              class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2.5 py-1.5 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label for="stuClasse" class="block text-slate-600 dark:text-slate-400 font-medium mb-1">Classe</label>
            <input
              id="stuClasse"
              type="text"
              bind:value={appState.studentInfo.classe}
              oninput={() => appState.saveToStorage()}
              placeholder="ex : 4e A"
              class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2.5 py-1.5 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label for="stuGroupe" class="block text-slate-600 dark:text-slate-400 font-medium mb-1">Équipe / Îlot</label>
            <input
              id="stuGroupe"
              type="text"
              bind:value={appState.studentInfo.groupe}
              oninput={() => appState.saveToStorage()}
              placeholder="ex : Îlot 2"
              class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2.5 py-1.5 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label for="stuDate" class="block text-slate-600 dark:text-slate-400 font-medium mb-1">Date</label>
            <input
              id="stuDate"
              type="date"
              bind:value={appState.studentInfo.date}
              oninput={() => appState.saveToStorage()}
              class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2 py-1.5 text-slate-900 dark:text-slate-100 font-mono text-[11px] focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2 shrink-0 text-xs">
          <button
            type="button"
            onclick={() => appState.exportStudentJSON()}
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold whitespace-nowrap cursor-pointer"
          >
            <Download class="w-3.5 h-3.5" />
            Export JSON
          </button>

          <button
            type="button"
            onclick={() => fileInputEl?.click()}
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold whitespace-nowrap cursor-pointer"
          >
            <FolderUp class="w-3.5 h-3.5" />
            Importer JSON
          </button>
          <input
            bind:this={fileInputEl}
            type="file"
            accept="application/json"
            onchange={handleImportFile}
            class="hidden"
          />
        </div>
      </div>
    </div>
  {/if}
</section>
