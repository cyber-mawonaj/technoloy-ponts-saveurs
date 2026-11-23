<script lang="ts">
  import { BILAN_SKILLS, GRID10_CRITERIA } from '../../lib/data/pedagogyPlus';
  import { appState } from '../../lib/stores/appState.svelte';

  const profileLabel = $derived(
    appState.deckProfile === 'flat'
      ? 'Feuille plate'
      : appState.deckProfile === 'ufold'
        ? 'Tablier plié en U (2 cm + 1 cm)'
        : 'Tablier U rehaussé (défi 22 cm)',
  );

  const reinforceLabel = $derived(
    appState.reinforcementType === 'none'
      ? 'Aucun renfort'
      : appState.reinforcementType === 'flat_sheet'
        ? 'Feuille plate collée'
        : 'Treillis en accordéon',
  );
</script>

<!-- Dedicated A4 Print-Only Report -->
<div class="print-only space-y-5 text-black">
  <!-- Persistent Student Banner at top of printed A4 copy -->
  <header class="border-b-2 border-slate-900 pb-3 flex justify-between items-start gap-4">
    <div>
      <h1 class="text-lg font-bold">Le Pont des Saveurs et des Cultures — Dossier Élève Cycle 4</h1>
      <p class="text-xs text-slate-700">
        TechnoLOY · Fête de la Science 2026 (« Saveur savante ») · Mariage de Kofi & Abénah
      </p>
    </div>
    <div class="text-right text-xs font-mono leading-snug">
      <div><strong>Élève :</strong> {appState.studentInfo.prenom || '---'} {appState.studentInfo.nom || '---'}</div>
      <div><strong>Niveau :</strong> {appState.studentInfo.niveau} · <strong>Classe :</strong> {appState.studentInfo.classe || '---'}</div>
      <div><strong>Équipe :</strong> {appState.studentInfo.groupe || '---'} · <strong>Date :</strong> {appState.studentInfo.date}</div>
    </div>
  </header>

  <!-- Captured 3D Model Snapshot + Student Sketchpad + Logigramme -->
  {#if appState.threeSnapshotUrl || appState.sketchSnapshotUrl || appState.logigrammeSnapshotUrl}
    <section class="space-y-3 print-break-inside-avoid">
      <h2 class="text-sm font-bold border-b border-slate-300 pb-1">
        1. Captures Techniques (Maquette 3D, Croquis Élève & Logigramme)
      </h2>
      <div class="grid grid-cols-2 gap-3">
        {#if appState.threeSnapshotUrl}
          <div class="border border-slate-300 rounded p-2">
            <div class="text-[10px] font-bold mb-1">
              Vue 3D PBR ({appState.viewMode3D === 'exploded' ? 'Éclatée' : 'Assemblage'}) · Portée {appState.spanCm} cm
            </div>
            <img src={appState.threeSnapshotUrl} alt="Capture 3D du pont" class="w-full h-44 object-contain" />
          </div>
        {/if}
        {#if appState.sketchSnapshotUrl}
          <div class="border border-slate-300 rounded p-2">
            <div class="text-[10px] font-bold mb-1">Croquis préparatoire annoté (Étape 2)</div>
            <img src={appState.sketchSnapshotUrl} alt="Croquis élève du pont" class="w-full h-44 object-contain bg-white" />
          </div>
        {/if}
      </div>
      {#if appState.logigrammeSnapshotUrl}
        <div class="border border-slate-300 rounded p-2">
          <div class="text-[10px] font-bold mb-1">Logigramme du protocole expérimental (10 secondes)</div>
          <img src={appState.logigrammeSnapshotUrl} alt="Logigramme protocole 10s" class="w-full h-36 object-contain" />
        </div>
      {/if}
    </section>
  {/if}

  <!-- Mechanical Bench & Fabrication Sequencer Summary -->
  <section class="space-y-2 print-break-inside-avoid">
    <h2 class="text-sm font-bold border-b border-slate-300 pb-1">
      2. Configuration Mécanique & Planification ({appState.totalBlockDurationMin} min)
    </h2>
    <div class="text-xs grid grid-cols-2 gap-2 border border-slate-300 rounded p-2.5 bg-slate-50">
      <div><strong>Profil du tablier :</strong> {profileLabel}</div>
      <div><strong>Renfort inférieur :</strong> {reinforceLabel}</div>
      <div><strong>Portée libre :</strong> {appState.spanCm} cm · <strong>Charge :</strong> {appState.coinCount} pièce(s) 1 €</div>
      <div>
        <strong>Flèche calculée :</strong> {appState.currentDeflectionMm} mm ·
        <strong>Essai 10 s :</strong> {appState.testStatus === 'passed' ? 'VALIDÉ' : appState.testStatus === 'collapsed' ? 'EFFONDREMENT' : 'Non lancé'}
      </div>
    </div>
    <div class="text-[11px] font-mono border border-slate-200 rounded p-2">
      <strong>Séquence de fabrication :</strong>
      {appState.blockProgram.map((b) => `${b.label} (${b.durationMin} min)`).join(' -> ')}
    </div>
  </section>

  <!-- DIY 7 Steps & Cultural References -->
  <section class="space-y-2 print-break-inside-avoid">
    <h2 class="text-sm font-bold border-b border-slate-300 pb-1">
      3. Démarche DIY & Références Culturelles (Kenya & Nigeria)
    </h2>
    <div class="grid grid-cols-2 gap-2 text-xs">
      <div class="border border-slate-300 rounded p-2">
        <div class="font-bold">Besoin identifié (Étape 1) :</div>
        <div>{appState.diySteps.s1_q1 || '(Non renseigné)'}</div>
      </div>
      <div class="border border-slate-300 rounded p-2">
        <div class="font-bold">Choix technique justifié (Étape 3) :</div>
        <div>{appState.diySteps.s3_q1 || '(Non renseigné)'}</div>
      </div>
      <div class="border border-slate-300 rounded p-2">
        <div class="font-bold">Saveur Kenya :</div>
        <div>{appState.diySteps.culture_kenya || '(Non renseignée)'}</div>
      </div>
      <div class="border border-slate-300 rounded p-2">
        <div class="font-bold">Saveur Nigeria :</div>
        <div>{appState.diySteps.culture_nigeria || '(Non renseignée)'}</div>
      </div>
    </div>
    <div class="border border-slate-300 rounded p-2 text-xs">
      <div><strong>Validation 5 critères :</strong> Portée {appState.diySteps.val_c1} · 10 s (5 pièces) {appState.diySteps.val_c2} · Stabilité {appState.diySteps.val_c3} · Sans contact sol {appState.diySteps.val_c4} · 4 supports égaux {appState.diySteps.val_c5}</div>
      <div class="mt-1"><strong>Analyse & amélioration :</strong> {appState.diySteps.s6_analyse1 || '---'} / {appState.diySteps.s6_analyse2 || '---'}</div>
    </div>
  </section>

  <!-- Bilan 9 Skills & Evaluation Summary -->
  <section class="space-y-2 print-break-inside-avoid">
    <h2 class="text-sm font-bold border-b border-slate-300 pb-1">
      4. Évaluation ({appState.studentInfo.niveau}) & Bilan des Compétences
    </h2>
    <div class="flex flex-wrap gap-4 text-xs font-mono border border-slate-300 rounded p-2 bg-slate-50">
      <div>
        <strong>Note Évaluation {appState.studentInfo.niveau} :</strong>
        {appState.lastEvalScore[appState.studentInfo.niveau] !== null
          ? `${appState.lastEvalScore[appState.studentInfo.niveau]} / 20`
          : 'Non calculée'}
      </div>
      <div><strong>Bilan compétences :</strong> {appState.bilanCheckedCount} / {BILAN_SKILLS.length}</div>
      <div><strong>Grille travail :</strong> {appState.grid10Total} / 10</div>
    </div>
    <div class="text-[11px] border border-slate-300 rounded p-2 space-y-1">
      <div><strong>Autoévaluation :</strong> {appState.autoevalChoice}</div>
      <div class="grid grid-cols-2 gap-1 pt-1">
        {#each GRID10_CRITERIA as crit (crit.id)}
          <div>• {crit.label} : <strong>{appState.grid10Scores[crit.id] ?? 0} / {crit.max}</strong></div>
        {/each}
      </div>
    </div>
  </section>
</div>
