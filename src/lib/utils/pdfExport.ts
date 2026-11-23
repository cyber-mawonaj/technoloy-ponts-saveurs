import { jsPDF } from 'jspdf';
import {
  BILAN_SKILLS,
  PEDAGOGICAL_GUIDE_STEPS,
  QUIZ_QUESTIONS,
} from '../data/pedagogyPlus';
import { appState, type ProcessBlockNode } from '../stores/appState.svelte';

function blockRgb(kind: ProcessBlockNode['kind']): [number, number, number] {
  switch (kind) {
    case 'sketch':
      return [217, 119, 6];
    case 'pillars':
      return [120, 53, 15];
    case 'deck_u':
      return [2, 132, 199];
    case 'reinforce':
      return [13, 148, 136];
    case 'assemble':
      return [79, 70, 229];
    case 'cake_3tiers':
      return [225, 29, 72];
    case 'test_10s':
      return [5, 150, 105];
    case 'adjust':
      return [147, 51, 234];
    default:
      return [51, 65, 85];
  }
}

export async function generateStudentSheetPdf(): Promise<void> {
  await appState.captureAllSnapshots();

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // Header Banner
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 26, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13.5);
  doc.text('Fiche Élève — Le Pont des Saveurs et des Cultures (Cycle 4)', margin, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(253, 230, 138);
  doc.text(
    'TechnoLOY · Fête de la Science 2026 (« Saveur savante ») · Mariage de Kofi (Kenya) & Abénah (Nigeria)',
    margin,
    18,
  );

  // Student Identification Box
  let y = 31;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 17, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  const fullName = `${appState.studentInfo.prenom || '---'} ${appState.studentInfo.nom || '---'}`.trim();
  doc.text(`Élève : ${fullName}`, margin + 4, y + 6.5);
  doc.text(`Niveau : ${appState.studentInfo.niveau}`, margin + 96, y + 6.5);
  doc.text(`Classe : ${appState.studentInfo.classe || '---'}`, margin + 135, y + 6.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Équipe / Îlot : ${appState.studentInfo.groupe || '---'}`, margin + 4, y + 12.5);
  doc.text(`Date : ${appState.studentInfo.date}`, margin + 96, y + 12.5);
  doc.text(`Portée : ${appState.spanCm} cm · Charge : ${appState.coinCount} p.`, margin + 135, y + 12.5);

  // Section 1 & Section 2 side-by-side cards (3D View + Sketchpad PNG)
  y = 53;
  const colGap = 6;
  const colW = (contentWidth - colGap) / 2;
  const imgBoxH = 56;

  // Section 1: Captured 3D Model View
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('1. Vue capturée du pont 3D (PBR)', margin, y);

  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y + 3, colW, imgBoxH, 2, 2, 'FD');

  if (appState.threeSnapshotUrl) {
    doc.addImage(appState.threeSnapshotUrl, 'PNG', margin + 1.5, y + 4.5, colW - 3, imgBoxH - 8);
  } else {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Ouvrir l’onglet 1 (Découverte 3D) pour actualiser.', margin + 4, y + 28);
  }
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Mode : ${appState.viewMode3D === 'exploded' ? 'Éclatée' : 'Assemblage'} · Profil : ${appState.deckProfile}`,
    margin + 2,
    y + imgBoxH + 1.5,
  );

  // Section 2: Student Sketchpad Drawing
  const rightX = margin + colW + colGap;
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('2. Croquis annoté de l’élève', rightX, y);

  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(rightX, y + 3, colW, imgBoxH, 2, 2, 'FD');

  if (appState.sketchSnapshotUrl) {
    doc.addImage(appState.sketchSnapshotUrl, 'PNG', rightX + 1.5, y + 4.5, colW - 3, imgBoxH - 8);
  } else {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Croquis à réaliser dans l’onglet 3 (Étape 2).', rightX + 4, y + 28);
  }
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Adhésif estimé : ${appState.estimatedTapeUsedCm} / 40 cm · Feuilles : ${appState.sheetsUsedCount} / 3`,
    rightX + 2,
    y + imgBoxH + 1.5,
  );

  // Mechanical 10s simulation strip
  y += imgBoxH + 7;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 16, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Résultat du simulateur mécanique (Protocole 10 secondes) :', margin + 3, y + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const statusTxt =
    appState.testStatus === 'passed'
      ? 'VALIDÉ (≥ 10 s sans effondrement)'
      : appState.testStatus === 'collapsed'
        ? `EFFONDREMENT à ${appState.testElapsedSec.toFixed(1)} s`
        : 'Essai en attente';
  doc.text(
    `Renfort : ${appState.reinforcementType}  |  Flèche : ${appState.currentDeflectionMm} mm  |  Statut : ${statusTxt}`,
    margin + 3,
    y + 11.5,
  );

  // Section 3: Process Blocks Sequence
  y += 23;
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(
    `3. Séquenceur de fabrication (${appState.totalBlockDurationMin} min planifiées)`,
    margin,
    y,
  );

  y += 4;
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  const blocksBoxHeight = Math.max(36, 12 + appState.blockProgram.length * 9.5);
  doc.roundedRect(margin, y, contentWidth, blocksBoxHeight, 2, 2, 'FD');

  let by = y + 4;
  for (const blk of appState.blockProgram.slice(0, 6)) {
    const [r, g, b] = blockRgb(blk.kind);
    doc.setFillColor(r, g, b);
    doc.roundedRect(margin + 4, by, contentWidth - 8, 7.5, 1.5, 1.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(`${blk.label} (${blk.durationMin} min)`, margin + 7, by + 5);
    by += 9.5;
  }

  // Secondary Exploded 3D or Logigramme snapshot if space permits
  const remainingSpace = 280 - (y + blocksBoxHeight);
  if (remainingSpace > 52 && (appState.threeExplodedSnapshotUrl || appState.logigrammeSnapshotUrl)) {
    const sy = y + blocksBoxHeight + 6;
    const halfW = (contentWidth - 6) / 2;
    if (appState.threeExplodedSnapshotUrl) {
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('4. Vue 3D éclatée (sous-ensembles)', margin, sy);
      doc.setDrawColor(203, 213, 225);
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(margin, sy + 2.5, halfW, 44, 2, 2, 'FD');
      doc.addImage(appState.threeExplodedSnapshotUrl, 'PNG', margin + 1.5, sy + 4, halfW - 3, 41);
    }
    if (appState.logigrammeSnapshotUrl) {
      const sx = appState.threeExplodedSnapshotUrl ? margin + halfW + 6 : margin;
      const sw = appState.threeExplodedSnapshotUrl ? halfW : contentWidth;
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('Logigramme décisionnel (Protocole 10 s)', sx, sy);
      doc.setDrawColor(203, 213, 225);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(sx, sy + 2.5, sw, 44, 2, 2, 'FD');
      doc.addImage(appState.logigrammeSnapshotUrl, 'PNG', sx + 1.5, sy + 4, sw - 3, 41);
    }
  }

  // Footer Page 1
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Pont des Saveurs et des Cultures · TechnoLOY · Fête de la Science 2026 · Page 1', margin, 290);

  // Page 2: DIY 7 Steps, Cultural Research & Evaluation
  doc.addPage();
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 18, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`Démarche DIY & Évaluation (${appState.studentInfo.niveau}) — ${fullName}`, margin, 11.5);

  const sections = [
    {
      title: 'Étape 1 · Besoin & Contraintes',
      text: `Besoin : ${appState.diySteps.s1_q1 || '---'} | Portée : ${appState.diySteps.s1_q2 || '18 cm'} | Interdits : ${appState.diySteps.s1_q4 || 'Colle chaude / cutter'}`,
    },
    {
      title: 'Étape 2 · Références culturelles documentées (Kenya & Nigeria)',
      text: `Kenya : ${appState.diySteps.culture_kenya || '(À compléter)'}\nNigeria : ${appState.diySteps.culture_nigeria || '(À compléter)'}\nSource : ${appState.diySteps.culture_source || '---'}`,
    },
    {
      title: 'Étape 3 · Justification du choix technique',
      text: `${appState.diySteps.s3_q1 || '(Non renseigné)'} — ${appState.diySteps.s3_q2 || ''}`.trim(),
    },
    {
      title: 'Étape 6 · Validation 5 critères & Amélioration',
      text: `Portée: ${appState.diySteps.val_c1} | 10 s (5 pièces): ${appState.diySteps.val_c2} | Stabilité: ${appState.diySteps.val_c3} | Sans contact sol: ${appState.diySteps.val_c4} | 4 supports égaux: ${appState.diySteps.val_c5}\nDéfaut / Amélioration : ${appState.diySteps.s6_analyse1 || '---'} -> ${appState.diySteps.s6_analyse2 || '---'}`,
    },
    {
      title: 'Étape 7 · Synthèse de présentation orale',
      text:
        appState.diySteps.comm_1 ||
        appState.diySteps.comm_2 ||
        appState.diySteps.comm_3 ||
        appState.diySteps.comm_4
          ? `J'ai conçu ce pont en utilisant ${appState.diySteps.comm_1 || '...'}. J'ai renforcé sa structure grâce à ${appState.diySteps.comm_2 || '...'}. Mon essai a montré que ${appState.diySteps.comm_3 || '...'}. Cette pièce montée symbolise ${appState.diySteps.comm_4 || '...'}.`
          : '(Synthèse orale à compléter dans l’onglet 3)',
    },
  ];

  let qy = 26;
  for (const sec of sections) {
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text(sec.title, margin, qy);
    qy += 4;

    const lines = doc.splitTextToSize(sec.text, contentWidth - 6);
    const boxH = Math.max(13, lines.length * 4.2 + 5);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, qy, contentWidth, boxH, 1.5, 1.5, 'FD');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text(lines, margin + 3, qy + 5);
    qy += boxH + 6;
  }

  // Summary Box: Evaluation, Bilan 9 skills, Grid /10 & Quiz
  const evalNote = appState.lastEvalScore[appState.studentInfo.niveau];
  const lvlQs = QUIZ_QUESTIONS.filter((q) => q.level === appState.studentInfo.niveau);
  const quizOk = lvlQs.filter((q) => appState.quizAnswers[q.id] === q.correctIndex).length;
  const guideSteps = PEDAGOGICAL_GUIDE_STEPS[appState.studentInfo.niveau];
  const guideOk = guideSteps.filter((s) => Boolean(appState.guideCompletedSteps[s.id])).length;

  doc.setFillColor(254, 243, 199);
  doc.setDrawColor(245, 158, 11);
  doc.roundedRect(margin, qy, contentWidth, 28, 2, 2, 'FD');
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(
    `Évaluation ${appState.studentInfo.niveau} : ${evalNote !== null ? `${evalNote}/20` : '---'}   |   Grille travail : ${appState.grid10Total}/10   |   Bilan : ${appState.bilanCheckedCount}/${BILAN_SKILLS.length}   |   Quiz : ${quizOk}/${lvlQs.length}`,
    margin + 3,
    qy + 7,
  );
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Autoévaluation : ${appState.autoevalChoice}`, margin + 3, qy + 14.5);
  doc.text(
    `Guide pas à pas : ${guideOk}/${guideSteps.length} étapes   |   Mode EBEP : ${appState.ebepMode ? 'Actif' : 'Standard'}`,
    margin + 3,
    qy + 21.5,
  );

  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'Kit Pédagogique « Le Pont des Saveurs et des Cultures » · TechnoLOY · Fête de la Science 2026 · Page 2',
    margin,
    290,
  );

  const safeFile = `fiche_pont_saveurs_${appState.studentInfo.niveau}_${appState.studentInfo.nom || 'eleve'}_${appState.studentInfo.prenom || 'kit'}`
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_');

  doc.save(`${safeFile}.pdf`);
  appState.showToast('Fiche élève PDF générée avec vue 3D, croquis et bilan.', 'success');
}
