<script lang="ts">
  import { onMount } from 'svelte';
  import { CheckCircle2, RefreshCw, WifiOff, X } from 'lucide-svelte';
  import { useRegisterSW } from 'virtual:pwa-register/svelte';

  let isOnline = $state(typeof navigator !== 'undefined' ? navigator.onLine : true);
  let isUpdating = $state(false);
  let dismissedUpdate = $state(false);
  let dismissedOfflineReady = $state(false);
  let swActive = $state(false);

  const { needRefresh, offlineReady, updateServiceWorker } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (registration) {
        swActive = true;
      }
    },
    onNeedRefresh() {
      dismissedUpdate = false;
    },
    onOfflineReady() {
      dismissedOfflineReady = false;
    },
  });

  onMount(() => {
    const onOnline = () => (isOnline = true);
    const onOffline = () => (isOnline = false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  });

  async function handleUpdate() {
    isUpdating = true;
    try {
      await updateServiceWorker(true);
    } finally {
      isUpdating = false;
    }
  }
</script>

<!-- Compact Header Status + Action Button -->
<div class="flex items-center gap-2 shrink-0">
  {#if $needRefresh}
    <button
      type="button"
      onclick={handleUpdate}
      disabled={isUpdating}
      class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-slate-950 text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
    >
      <RefreshCw class="w-3.5 h-3.5 {isUpdating ? 'animate-spin' : ''}" />
      {isUpdating ? 'Mise à jour…' : 'Mettre à jour'}
    </button>
  {:else if !isOnline}
    <span class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 text-xs font-semibold whitespace-nowrap shrink-0">
      <WifiOff class="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
      Hors ligne
    </span>
  {:else if $offlineReady || swActive}
    <span
      title="Application prête pour une utilisation hors ligne"
      class="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800/70 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-medium whitespace-nowrap shrink-0"
    >
      <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
      Hors ligne prêt
    </span>
  {/if}
</div>

<!-- Floating Update Banner when a new Service Worker version is waiting -->
{#if $needRefresh && !dismissedUpdate}
  <div
    role="alert"
    class="fixed bottom-4 left-4 z-50 max-w-sm rounded-xl bg-white dark:bg-slate-900 border border-sky-300 dark:border-sky-700 shadow-xl p-3.5 text-xs space-y-2.5 no-print"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="flex items-start gap-2">
        <RefreshCw class="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
        <div>
          <div class="font-bold text-slate-900 dark:text-slate-100">Nouvelle version disponible</div>
          <p class="text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
            Une mise à jour du kit pédagogique est prête. Cliquez pour actualiser sans perte de vos saisies.
          </p>
        </div>
      </div>
      <button
        type="button"
        onclick={() => (dismissedUpdate = true)}
        class="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
        aria-label="Fermer la notification de mise à jour"
      >
        <X class="w-3.5 h-3.5" />
      </button>
    </div>
    <div class="flex items-center justify-end gap-2">
      <button
        type="button"
        onclick={() => (dismissedUpdate = true)}
        class="px-2.5 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold cursor-pointer"
      >
        Plus tard
      </button>
      <button
        type="button"
        onclick={handleUpdate}
        disabled={isUpdating}
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white font-semibold cursor-pointer"
      >
        <RefreshCw class="w-3.5 h-3.5 {isUpdating ? 'animate-spin' : ''}" />
        Mettre à jour
      </button>
    </div>
  </div>
{:else if $offlineReady && !dismissedOfflineReady}
  <div
    role="status"
    class="fixed bottom-4 left-4 z-50 max-w-sm rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 shadow-lg px-3.5 py-2.5 text-xs flex items-center justify-between gap-3 no-print"
  >
    <div class="flex items-center gap-2 text-emerald-900 dark:text-emerald-200 font-medium">
      <CheckCircle2 class="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
      <span>Kit mis en cache : utilisable hors ligne en classe.</span>
    </div>
    <button
      type="button"
      onclick={() => (dismissedOfflineReady = true)}
      class="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
      aria-label="Fermer"
    >
      <X class="w-3.5 h-3.5" />
    </button>
  </div>
{:else if !isOnline}
  <div class="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white shadow-lg no-print">
    <WifiOff class="w-3.5 h-3.5" />
    <span>Mode hors ligne actif · Ressources locales en cache</span>
  </div>
{/if}
