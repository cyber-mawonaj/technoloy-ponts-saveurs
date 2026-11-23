<script lang="ts">
  import { Activity, Layers, Scale, ShieldCheck, Sparkles } from 'lucide-svelte';
  import { appState } from '../../lib/stores/appState.svelte';

  const PROFILE_ROWS = [
    {
      critere: 'Forme géométrique',
      plat: 'Feuille A4 posée à plat (épaisseur ~0,1 mm)',
      u: 'Plis verticaux 2 cm + rebords intérieurs 1 cm',
      tri: 'U + deux bandes pliées en triangles / accordéon',
    },
    {
      critere: 'Moment d’inertie face à la flexion',
      plat: 'Très faible : s’affaisse rapidement sous 1 à 2 pièces',
      u: 'Élevé : les flancs verticaux bloquent la courbure',
      tri: 'Optimal : répartit la charge et évite le voilement',
    },
    {
      critere: 'Masse de papier ajoutée',
      plat: '1 feuille A4 (≈ 5 g)',
      u: '1 feuille A4 (≈ 5 g, 0 g ajouté)',
      tri: '2 feuilles A4 (≈ 10 g)',
    },
    {
      critere: 'Portée maximale validée (5 pièces / 10 s)',
      plat: '< 8 cm (échec à 18 cm)',
      u: '18 cm (avec appuis bien centrés)',
      tri: '18 cm et jusqu’à 22 cm (défi 3e N4b)',
    },
  ];

  const MATERIAL_COMPARISON = [
    {
      material: 'Papier blanc A4 (80 g/m²)',
      role: 'Tablier (Feuille 1), Renforts (Feuille 2), Pièce montée (Feuille 3)',
      stiffness: 'Souple à plat, devient très rigide après pliage en U ou triangles',
      mass: 'Très léger (~5 g / feuille)',
      eco: 'Fibre cellulosique recyclable (tri sélectif, sans colle chaude)',
    },
    {
      material: 'Carton spiralé (Tubes essuie-tout)',
      role: '4 piliers verticaux (2 paires d’appuis)',
      stiffness: 'Haute rigidité en compression verticale grâce à la forme cylindrique',
      mass: 'Léger mais épais (~25–35 g / tube)',
      eco: 'Réemploi direct d’emballages domestiques, 100 % biodégradable / recyclable',
    },
    {
      material: 'Ruban adhésif (≤ 40 cm)',
      role: 'Assemblage ponctuel des jonctions et des renforts',
      stiffness: 'Travaillé uniquement en maintien (sans fonction porteuse)',
      mass: 'Négligeable',
      eco: 'Limité à 40 cm max pour préserver la sobriété matière et faciliter le démontage',
    },
  ];
</script>

<div class="space-y-5">
  <!-- Clean Sub-Tab Navigation -->
  <div class="bg-white dark:bg-slate-900 rounded-xl p-2 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-1.5 text-xs">
    <button
      type="button"
      onclick={() => (appState.subTab5 = 'profiles')}
      class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer {appState.subTab5 === 'profiles'
        ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950'
        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}"
    >
      <Layers class="w-3.5 h-3.5" /> Profils A / B / C
    </button>
    <button
      type="button"
      onclick={() => (appState.subTab5 = 'materials')}
      class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer {appState.subTab5 === 'materials'
        ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950'
        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}"
    >
      <Scale class="w-3.5 h-3.5" /> Matériaux & Écoconception
    </button>
    <button
      type="button"
      onclick={() => (appState.subTab5 = 'forces')}
      class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer {appState.subTab5 === 'forces'
        ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950'
        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}"
    >
      <Activity class="w-3.5 h-3.5" /> 3 Sollicitations Mécaniques
    </button>
    <button
      type="button"
      onclick={() => (appState.subTab5 = 'fablab')}
      class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer {appState.subTab5 === 'fablab'
        ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950'
        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}"
    >
      <Sparkles class="w-3.5 h-3.5" /> FabLab LEARN · MAKE · SHARE
    </button>
  </div>

  <!-- 1. Comparatif Géométrique des Profils -->
  {#if appState.subTab5 === 'profiles'}
    <section class="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
      <div>
        <h2 class="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Layers class="w-5 h-5 text-amber-600 dark:text-amber-400" />
          Comparatif Mécanique : Feuille Plate vs Pli en U vs Triangulation
        </h2>
        <p class="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
          Explique comment la mise en forme par pliage transforme un matériau souple en structure porteuse sans ajouter de masse excessive.
        </p>
      </div>

      <div class="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
        <table class="w-full text-xs text-left border-collapse">
          <thead>
            <tr class="bg-slate-900 dark:bg-slate-950 text-white border-b border-slate-800">
              <th class="p-3 font-semibold">Critère technique</th>
              <th class="p-3 font-semibold">Solution A · Feuille plate</th>
              <th class="p-3 font-semibold">Solution B · Profil en U</th>
              <th class="p-3 font-semibold">Solution C · U + Accordéon / Triangles</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
            {#each PROFILE_ROWS as row}
              <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td class="p-3 font-semibold text-slate-900 dark:text-slate-100">{row.critere}</td>
                <td class="p-3 text-rose-700 dark:text-rose-400">{row.plat}</td>
                <td class="p-3 text-sky-800 dark:text-sky-400">{row.u}</td>
                <td class="p-3 text-emerald-800 dark:text-emerald-400 font-medium">{row.tri}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </section>

  <!-- 2. Comparatif des Matériaux (Papier A4 vs Carton vs Adhésif) -->
  {:else if appState.subTab5 === 'materials'}
    <section class="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
      <div>
        <h2 class="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Scale class="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          Propriétés des Matériaux & Écoconception (4e / 3e · SFC1.2.3a)
        </h2>
        <p class="text-xs text-slate-600 dark:text-slate-400">
          Justifie l’association de chaque matériau à la fonction mécanique et environnementale qui lui convient.
        </p>
      </div>

      <div class="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
        <table class="w-full text-xs text-left border-collapse">
          <thead>
            <tr class="bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800">
              <th class="p-2.5 font-semibold">Matériau</th>
              <th class="p-2.5 font-semibold">Fonction dans la maquette</th>
              <th class="p-2.5 font-semibold">Comportement mécanique</th>
              <th class="p-2.5 font-semibold">Masse</th>
              <th class="p-2.5 font-semibold">Impact & Fin de vie</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
            {#each MATERIAL_COMPARISON as m}
              <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td class="p-2.5 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">{m.material}</td>
                <td class="p-2.5 text-slate-700 dark:text-slate-300">{m.role}</td>
                <td class="p-2.5 text-slate-700 dark:text-slate-300">{m.stiffness}</td>
                <td class="p-2.5 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">{m.mass}</td>
                <td class="p-2.5 text-emerald-800 dark:text-emerald-400">{m.eco}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </section>

  <!-- 3. Les 3 Sollicitations Mécaniques -->
  {:else if appState.subTab5 === 'forces'}
    <section class="grid grid-cols-1 md:grid-cols-3 gap-5">
      <div class="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 space-y-2">
        <div class="text-xs font-mono font-bold text-rose-700 dark:text-rose-400">Sollicitation n° 1</div>
        <h3 class="text-base font-bold text-slate-900 dark:text-slate-100">La Flexion (Tablier)</h3>
        <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Sous l’effet vertical des 5 pièces au centre, le tablier tend à se courber vers le bas : la face supérieure est comprimée, la face inférieure est étirée.
        </p>
      </div>
      <div class="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 space-y-2">
        <div class="text-xs font-mono font-bold text-sky-700 dark:text-sky-400">Sollicitation n° 2</div>
        <h3 class="text-base font-bold text-slate-900 dark:text-slate-100">La Compression (4 Piliers)</h3>
        <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Les 4 moitiés de tubes en carton supportent l’ensemble du poids transmis par les appuis du tablier et travaillent en écrasement vertical.
        </p>
      </div>
      <div class="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 space-y-2">
        <div class="text-xs font-mono font-bold text-amber-700 dark:text-amber-400">Sollicitation n° 3</div>
        <h3 class="text-base font-bold text-slate-900 dark:text-slate-100">La Torsion (À éviter !)</h3>
        <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Si la pièce montée ou les pièces ne sont pas centrées, le tablier vrille et risque de basculer : d’où l’exigence d’une largeur ≥ 5 cm.
        </p>
      </div>
    </section>

  <!-- 4. Culture Technologique : Esprit DIY & FabLab (Page 32) -->
  {:else}
    <section class="bg-slate-900 dark:bg-slate-900 text-white rounded-xl p-6 border border-slate-800 space-y-5">
      <div class="space-y-2 max-w-3xl">
        <div class="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-amber-300">
          <Sparkles class="w-4 h-4" /> Culture Technologique · Page 32 du dossier
        </div>
        <h2 class="text-xl font-bold tracking-tight">
          L’esprit DIY (« Do It Yourself ») et la démarche FabLab
        </h2>
        <p class="text-xs text-slate-300 leading-relaxed">
          Le <strong>DIY (« Fais-le toi-même »)</strong> consiste à imaginer, fabriquer ou améliorer un objet avec les ressources disponibles, en respectant les règles de sécurité. Le mouvement <strong>FabLab</strong> repose sur trois piliers complémentaires :
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div class="bg-slate-800/80 dark:bg-slate-950 rounded-xl p-4 border border-slate-700 dark:border-slate-800 space-y-1">
          <div class="text-amber-400 font-bold text-sm">1. LEARN (Apprendre)</div>
          <p class="text-slate-200 leading-relaxed">
            Observer la flexion, comprendre le rôle géométrique des plis et documenter les saveurs du Kenya et du Nigeria.
          </p>
        </div>
        <div class="bg-slate-800/80 dark:bg-slate-950 rounded-xl p-4 border border-slate-700 dark:border-slate-800 space-y-1">
          <div class="text-emerald-400 font-bold text-sm">2. MAKE (Fabriquer)</div>
          <p class="text-slate-200 leading-relaxed">
            Prototyper concrètement avec 3 A4, 2 tubes carton et 40 cm d’adhésif, puis tester pendant 10 secondes.
          </p>
        </div>
        <div class="bg-slate-800/80 dark:bg-slate-950 rounded-xl p-4 border border-slate-700 dark:border-slate-800 space-y-1">
          <div class="text-sky-400 font-bold text-sm flex items-center gap-1.5">
            <ShieldCheck class="w-4 h-4" /> 3. SHARE (Partager)
          </div>
          <p class="text-slate-200 leading-relaxed">
            Présenter ses choix, partager ses résultats d’essais et améliorer sa structure : l’erreur fait partie de l’apprentissage.
          </p>
        </div>
      </div>
    </section>
  {/if}
</div>
