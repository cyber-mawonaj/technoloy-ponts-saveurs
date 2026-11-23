<script lang="ts">
  import { onMount } from 'svelte';
  import { Download, X } from 'lucide-svelte';

  interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  }

  let deferredPrompt = $state<BeforeInstallPromptEvent | null>(null);
  let isInstalled = $state(false);
  let isIOS = $state(false);
  let showIOSGuide = $state(false);

  onMount(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    isInstalled = standalone;

    const ua = window.navigator.userAgent.toLowerCase();
    isIOS = /iphone|ipad|ipod/.test(ua);

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      deferredPrompt = e as BeforeInstallPromptEvent;
    };
    const onAppInstalled = () => {
      isInstalled = true;
      deferredPrompt = null;
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  });

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      isInstalled = true;
      deferredPrompt = null;
    }
  }
</script>

{#if !isInstalled && deferredPrompt}
  <button
    type="button"
    onclick={handleInstall}
    class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 border border-transparent dark:border-slate-700 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
  >
    <Download class="w-3.5 h-3.5" />
    Installer PWA
  </button>
{:else if !isInstalled && isIOS}
  <button
    type="button"
    onclick={() => (showIOSGuide = true)}
    class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer"
  >
    <Download class="w-3.5 h-3.5" />
    Installer (iOS)
  </button>
{/if}

{#if showIOSGuide}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 no-print">
    <div class="w-full max-w-sm rounded-xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-700 shadow-xl space-y-3">
      <div class="flex items-center justify-between">
        <h3 class="text-base font-bold text-slate-900 dark:text-slate-100">Installer sur iPhone / iPad</h3>
        <button
          type="button"
          onclick={() => (showIOSGuide = false)}
          class="p-1 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          aria-label="Fermer"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
      <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
        1. Appuyez sur le bouton <strong>Partager</strong> dans Safari.<br />
        2. Sélectionnez <strong>Sur l’écran d’accueil</strong> pour utiliser le kit hors ligne en classe.
      </p>
      <button
        type="button"
        onclick={() => (showIOSGuide = false)}
        class="w-full py-2 rounded-lg bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 text-xs font-semibold cursor-pointer"
      >
        Compris
      </button>
    </div>
  </div>
{/if}
