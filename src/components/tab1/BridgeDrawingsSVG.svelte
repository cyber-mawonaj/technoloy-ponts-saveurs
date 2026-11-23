<script lang="ts">
  import { Compass } from 'lucide-svelte';
  import { appState } from '../../lib/stores/appState.svelte';

  const DRAWING_OPTIONS = [
    { value: 'ortho3', label: 'Vue d’ensemble (3 Vues ISO E : Face, Gauche, Dessus)' },
    { value: 'exploded_annotated', label: 'Vue éclatée annotée des sous-ensembles (A4 + Tubes)' },
    { value: 'profiles_u', label: 'Coupes mécaniques : Feuille plate vs Pli en U (2+1 cm) vs Triangulation' },
    { value: 'span_22cm', label: 'Cotes d’implantation : Portée 18 cm vs Défi 3e (22 cm)' },
    { value: 'cake_symbol', label: 'Pièce montée 3 étages : Symbolique Kenya · Kofi & Abénah · Nigeria' },
  ];
</script>

<section class="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 space-y-4 print-break-inside-avoid">
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
    <div>
      <h3 class="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
        <Compass class="w-4 h-4 text-amber-600 dark:text-amber-400" />
        Dessins Techniques Normalisés (Projection Européenne ISO E & Cartouche)
      </h3>
      <p class="text-xs text-slate-600 dark:text-slate-400">
        Planche vectorielle synchronisée automatiquement avec le cartouche élève (NF EN ISO 7200).
      </p>
    </div>

    <div class="flex items-center gap-2 no-print">
      <label for="techDrawSelect" class="text-xs font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">Planche :</label>
      <select
        id="techDrawSelect"
        bind:value={appState.techDrawMode}
        class="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs rounded-lg px-2.5 py-1.5 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
      >
        {#each DRAWING_OPTIONS as opt}
          <option value={opt.value}>{opt.label}</option>
        {/each}
      </select>
    </div>
  </div>

  <div class="bg-slate-900 dark:bg-slate-950 rounded-xl p-3 border border-slate-800 overflow-x-auto">
    <svg viewBox="0 0 900 540" class="w-full h-auto min-w-[680px] max-h-[540px] font-mono">
      <defs>
        <pattern id="bridgeCadGrid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" stroke-width="0.6" />
        </pattern>
      </defs>

      <rect width="900" height="540" fill="#0f172a" />
      <rect width="900" height="540" fill="url(#bridgeCadGrid)" />
      <rect x="12" y="12" width="876" height="516" fill="none" stroke="#334155" stroke-width="1.5" />

      {#if appState.techDrawMode === 'ortho3'}
        <text x="235" y="42" fill="#fbbf24" font-size="13" font-weight="bold" text-anchor="middle">VUE DE FACE</text>
        <text x="660" y="42" fill="#fbbf24" font-size="13" font-weight="bold" text-anchor="middle">VUE DE GAUCHE</text>
        <text x="235" y="276" fill="#fbbf24" font-size="13" font-weight="bold" text-anchor="middle">VUE DE DESSUS</text>

        <!-- Front View -->
        <g stroke="#e2e8f0" stroke-width="2" fill="none">
          <!-- Support surface -->
          <line x1="45" y1="220" x2="425" y2="220" stroke="#64748b" stroke-width="1.5" />
          <!-- Left & Right Pillars -->
          <rect x="75" y="150" width="38" height="70" rx="2" stroke="#d97706" />
          <rect x="357" y="150" width="38" height="70" rx="2" stroke="#d97706" />
          <!-- U-Deck + Accordion -->
          <rect x="65" y="132" width="340" height="18" rx="2" />
          <polyline
            points="113,150 133,164 153,150 173,164 193,150 213,164 235,150 257,164 277,150 297,164 317,150 337,164 357,150"
            stroke="#fbbf24"
            stroke-width="1.8"
          />
          <!-- 3-Tier Cake -->
          <rect x="175" y="106" width="120" height="26" rx="2" stroke="#fef3c7" />
          <rect x="195" y="82" width="80" height="24" rx="2" stroke="#fde68a" />
          <rect x="212" y="60" width="46" height="22" rx="2" stroke="#fcd34d" />
          <!-- Dimension 18 cm / 22 cm -->
          <line x1="113" y1="238" x2="357" y2="238" stroke="#38bdf8" stroke-width="1.3" />
          <line x1="113" y1="220" x2="113" y2="245" stroke="#38bdf8" stroke-width="1" />
          <line x1="357" y1="220" x2="357" y2="245" stroke="#38bdf8" stroke-width="1" />
          <text x="235" y="253" fill="#38bdf8" font-size="11" stroke="none" text-anchor="middle">
            Portée libre = {appState.spanCm} cm
          </text>
        </g>

        <!-- Left View (right of Front View per ISO E) -->
        <g stroke="#e2e8f0" stroke-width="2" fill="none">
          <line x1="560" y1="220" x2="770" y2="220" stroke="#64748b" stroke-width="1.5" />
          <rect x="615" y="150" width="42" height="70" rx="2" stroke="#d97706" />
          <rect x="673" y="150" width="42" height="70" rx="2" stroke="#d97706" />
          <!-- U-profile cross-section -->
          <path d="M 622 122 L 622 150 L 708 150 L 708 122 L 696 122" stroke="#f8fafc" stroke-width="2.2" />
          <line x1="622" y1="122" x2="634" y2="122" stroke="#f8fafc" stroke-width="2.2" />
          <!-- Cake rings -->
          <rect x="632" y="106" width="66" height="26" stroke="#fef3c7" />
          <rect x="644" y="82" width="42" height="24" stroke="#fde68a" />
          <rect x="652" y="60" width="26" height="22" stroke="#fcd34d" />
          <!-- Projection construction lines -->
          <line x1="405" y1="132" x2="622" y2="132" stroke="#475569" stroke-width="1" stroke-dasharray="3,3" />
          <line x1="395" y1="220" x2="615" y2="220" stroke="#475569" stroke-width="1" stroke-dasharray="3,3" />
          <text x="665" y="253" fill="#fbbf24" font-size="10.5" stroke="none" text-anchor="middle">Largeur tablier ≥ 5 cm</text>
        </g>

        <!-- Top View (below Front View per ISO E) -->
        <g stroke="#e2e8f0" stroke-width="2" fill="none">
          <rect x="65" y="318" width="340" height="84" rx="3" />
          <line x1="65" y1="330" x2="405" y2="330" stroke="#94a3b8" stroke-dasharray="4,3" />
          <line x1="65" y1="390" x2="405" y2="390" stroke="#94a3b8" stroke-dasharray="4,3" />
          <circle cx="235" cy="360" r="30" stroke="#fef3c7" />
          <circle cx="235" cy="360" r="20" stroke="#fde68a" />
          <circle cx="235" cy="360" r="11" stroke="#fcd34d" />
          <text x="122" y="364" fill="#f87171" font-size="10.5" stroke="none" text-anchor="middle">KENYA</text>
          <text x="348" y="364" fill="#34d399" font-size="10.5" stroke="none" text-anchor="middle">NIGERIA</text>
          <line x1="65" y1="150" x2="65" y2="318" stroke="#475569" stroke-width="1" stroke-dasharray="3,3" />
          <line x1="405" y1="150" x2="405" y2="318" stroke="#475569" stroke-width="1" stroke-dasharray="3,3" />
          <text x="235" y="424" fill="#94a3b8" font-size="10" stroke="none" text-anchor="middle">Longueur feuille A4 : 29,7 cm</text>
        </g>
      {:else if appState.techDrawMode === 'exploded_annotated'}
        <text x="450" y="42" fill="#fbbf24" font-size="14" font-weight="bold" text-anchor="middle">
          VUE ÉCLATÉE ANNOTÉE — SOUS-ENSEMBLES DU PONT PIÈCE MONTÉE
        </text>
        <g stroke="#fbbf24" stroke-width="1.8" fill="#1e293b">
          <rect x="330" y="70" width="240" height="44" rx="6" stroke="#f43f5e" />
          <text x="450" y="96" fill="#fda4af" font-size="11" stroke="none" text-anchor="middle">05 · Charge d’essai : 5 pièces 1 € (10 s)</text>

          <rect x="295" y="135" width="310" height="52" rx="6" stroke="#fde68a" />
          <text x="450" y="165" fill="#fef3c7" font-size="11" stroke="none" text-anchor="middle">04 · Pièce montée 3 étages (Feuille 3 A4)</text>

          <rect x="210" y="212" width="480" height="52" rx="6" stroke="#38bdf8" />
          <text x="450" y="242" fill="#e0f2fe" font-size="11.5" stroke="none" text-anchor="middle">02 · Tablier plié en U : bords 2 cm + rebords 1 cm (Feuille 1 A4)</text>

          <rect x="245" y="286" width="410" height="48" rx="6" stroke="#10b981" />
          <text x="450" y="314" fill="#a7f3d0" font-size="11" stroke="none" text-anchor="middle">03 · Renforts triangulaires / accordéon (Feuille 2 A4 + scotch)</text>

          <rect x="110" y="365" width="210" height="50" rx="6" stroke="#d97706" />
          <text x="215" y="394" fill="#fcd34d" font-size="11" stroke="none" text-anchor="middle">01a · 2 Piliers Gauche (Carton)</text>

          <rect x="580" y="365" width="210" height="50" rx="6" stroke="#d97706" />
          <text x="685" y="394" fill="#fcd34d" font-size="11" stroke="none" text-anchor="middle">01b · 2 Piliers Droite (Carton)</text>
        </g>
        <g stroke="#64748b" stroke-width="1.4" stroke-dasharray="4,3">
          <line x1="450" y1="114" x2="450" y2="135" />
          <line x1="450" y1="187" x2="450" y2="212" />
          <line x1="450" y1="264" x2="450" y2="286" />
          <line x1="215" y1="334" x2="215" y2="365" />
          <line x1="685" y1="334" x2="685" y2="365" />
        </g>
      {:else if appState.techDrawMode === 'profiles_u'}
        <text x="450" y="45" fill="#fbbf24" font-size="15" font-weight="bold" text-anchor="middle">
          COUPES MÉCANIQUES : INFLUENCE DE LA FORME SUR LA RIGIDITÉ
        </text>
        <!-- Profile 1: Flat -->
        <g transform="translate(90, 120)">
          <rect x="0" y="0" width="200" height="220" rx="8" fill="#1e293b" stroke="#f43f5e" stroke-width="1.5" />
          <text x="100" y="30" fill="#fda4af" font-size="12" font-weight="bold" text-anchor="middle">A · FEUILLE PLATE</text>
          <line x1="30" y1="115" x2="170" y2="115" stroke="#f8fafc" stroke-width="4" />
          <path d="M 30 115 Q 100 148 170 115" fill="none" stroke="#f43f5e" stroke-width="2" stroke-dasharray="4,3" />
          <text x="100" y="180" fill="#fca5a5" font-size="10.5" text-anchor="middle">Forte flèche en flexion</text>
          <text x="100" y="198" fill="#94a3b8" font-size="10" text-anchor="middle">Moment d’inertie faible</text>
        </g>
        <!-- Profile 2: U-Fold -->
        <g transform="translate(350, 120)">
          <rect x="0" y="0" width="200" height="220" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5" />
          <text x="100" y="30" fill="#7dd3fc" font-size="12" font-weight="bold" text-anchor="middle">B · PROFIL EN U</text>
          <path d="M 55 82 L 38 82 L 38 135 L 162 135 L 162 82 L 145 82" fill="none" stroke="#f8fafc" stroke-width="4" />
          <text x="100" y="156" fill="#38bdf8" font-size="10" text-anchor="middle">Fond ≥ 5 cm · Bords 2 cm + 1 cm</text>
          <text x="100" y="185" fill="#bae6fd" font-size="10.5" text-anchor="middle">Rigidité verticale accrue</text>
        </g>
        <!-- Profile 3: U-Fold + Accordion -->
        <g transform="translate(610, 120)">
          <rect x="0" y="0" width="200" height="220" rx="8" fill="#1e293b" stroke="#10b981" stroke-width="1.5" />
          <text x="100" y="30" fill="#6ee7b7" font-size="12" font-weight="bold" text-anchor="middle">C · U + TRIANGULATION</text>
          <path d="M 55 78 L 38 78 L 38 122 L 162 122 L 162 78 L 145 78" fill="none" stroke="#f8fafc" stroke-width="3.5" />
          <polyline points="42,124 62,150 82,124 102,150 122,124 142,150 158,124" fill="none" stroke="#fbbf24" stroke-width="2.8" />
          <text x="100" y="180" fill="#6ee7b7" font-size="10.5" text-anchor="middle">Résistance maximale (10 s)</text>
          <text x="100" y="198" fill="#94a3b8" font-size="10" text-anchor="middle">Adapté défi 3e à 22 cm</text>
        </g>
      {:else if appState.techDrawMode === 'span_22cm'}
        <text x="450" y="45" fill="#fbbf24" font-size="15" font-weight="bold" text-anchor="middle">
          COMPARATIF DES PORTÉES : 18 CM (BASE) VS 22 CM (RÉINVESTISSEMENT 3e N4b)
        </text>
        <g stroke="#e2e8f0" stroke-width="2" fill="none">
          <!-- 18 cm -->
          <text x="140" y="100" fill="#38bdf8" font-size="12" stroke="none">1. Cahier des charges standard : 18 cm</text>
          <rect x="150" y="128" width="32" height="55" stroke="#d97706" />
          <rect x="520" y="128" width="32" height="55" stroke="#d97706" />
          <rect x="135" y="114" width="430" height="14" fill="#1e293b" />
          <line x1="182" y1="196" x2="520" y2="196" stroke="#38bdf8" stroke-width="1.5" />
          <text x="351" y="213" fill="#38bdf8" font-size="11" stroke="none" text-anchor="middle">18,0 cm libre</text>

          <!-- 22 cm -->
          <text x="140" y="262" fill="#f43f5e" font-size="12" stroke="none">2. Nouvelle exigence 3e (N4b) : 22 cm sans matériau ajouté</text>
          <rect x="110" y="290" width="32" height="55" stroke="#d97706" />
          <rect x="560" y="290" width="32" height="55" stroke="#d97706" />
          <rect x="98" y="276" width="504" height="14" fill="#1e293b" />
          <line x1="142" y1="358" x2="560" y2="358" stroke="#f43f5e" stroke-width="1.5" />
          <text x="351" y="375" fill="#f43f5e" font-size="11" stroke="none" text-anchor="middle">
            22,0 cm libre (+4 cm -> moment fléchissant accru au centre)
          </text>
        </g>
      {:else}
        <text x="450" y="45" fill="#fbbf24" font-size="15" font-weight="bold" text-anchor="middle">
          PIÈCE MONTÉE À 3 ÉTAGES — SYMBOLIQUE KENYA & NIGERIA
        </text>
        <g stroke="#e2e8f0" stroke-width="2" fill="none">
          <rect x="130" y="280" width="640" height="24" rx="4" fill="#1e293b" />
          <rect x="295" y="228" width="310" height="52" rx="4" fill="#334155" stroke="#fef3c7" />
          <rect x="345" y="178" width="210" height="50" rx="4" fill="#334155" stroke="#fde68a" />
          <rect x="390" y="132" width="120" height="46" rx="4" fill="#334155" stroke="#fcd34d" />

          <text x="205" y="260" fill="#f87171" font-size="14" stroke="none" text-anchor="middle">KENYA</text>
          <text x="205" y="275" fill="#fca5a5" font-size="9.5" stroke="none" text-anchor="middle">(Saveur documentée)</text>

          <text x="695" y="260" fill="#34d399" font-size="14" stroke="none" text-anchor="middle">NIGERIA</text>
          <text x="695" y="275" fill="#6ee7b7" font-size="9.5" stroke="none" text-anchor="middle">(Saveur documentée)</text>

          <text x="450" y="208" fill="#fbbf24" font-size="13" font-weight="bold" stroke="none" text-anchor="middle">
            Kofi Seÿkou-Touré + Abénah Obi-Kâ
          </text>
          <text x="450" y="340" fill="#e2e8f0" font-size="11" stroke="none" text-anchor="middle">
            « Deux histoires, deux héritages, un pont vers l’avenir. »
          </text>
        </g>
      {/if}

      <!-- NF EN ISO 7200 Standardized Title Block (Cartouche) -->
      <g transform="translate(472, 400)" stroke="#e2e8f0" stroke-width="1.3" fill="none">
        <rect x="0" y="0" width="404" height="118" fill="#0f172a" />
        <line x1="0" y1="30" x2="404" y2="30" />
        <line x1="0" y1="60" x2="404" y2="60" />
        <line x1="0" y1="90" x2="404" y2="90" />
        <line x1="236" y1="0" x2="236" y2="118" />

        <!-- European Projection Symbol (ISO E) -->
        <g transform="translate(14, 6)" stroke="#fbbf24" stroke-width="1.2">
          <polygon points="4,14 20,7 20,21 4,14" fill="none" />
          <circle cx="34" cy="14" r="7" fill="none" />
          <line x1="0" y1="14" x2="44" y2="14" stroke-dasharray="2,2" />
        </g>

        <text x="68" y="20" fill="#f8fafc" font-size="10.5" font-weight="bold" stroke="none">TechnoLOY · FDS 2026 Cycle 4</text>
        <text x="10" y="49" fill="#facc15" font-size="10" font-weight="bold" stroke="none">OBJET : PONT PIÈCE MONTÉE</text>
        <text x="10" y="79" fill="#38bdf8" font-size="10" stroke="none">PORTÉE : {appState.spanCm} cm · FORMAT A4</text>
        <text x="10" y="108" fill="#94a3b8" font-size="9.5" stroke="none">NORME : Projection ISO E</text>

        <text x="246" y="20" fill="#38bdf8" font-size="10" font-weight="bold" stroke="none">DESSINATEUR / ÉLÈVE :</text>
        <text x="246" y="49" fill="#ffffff" font-size="10.5" font-weight="bold" stroke="none">
          {(appState.studentInfo.prenom || 'PRÉNOM').toUpperCase()} {(appState.studentInfo.nom || 'NOM').toUpperCase()}
        </text>
        <text x="246" y="79" fill="#fbbf24" font-size="10" stroke="none">
          NIVEAU : {appState.studentInfo.niveau} · CLASSE : {appState.studentInfo.classe || '---'}
        </text>
        <text x="246" y="108" fill="#94a3b8" font-size="9.5" stroke="none">
          ÉQUIPE : {appState.studentInfo.groupe || '---'} · {appState.studentInfo.date}
        </text>
      </g>
    </svg>
  </div>
</section>
