#!/usr/bin/env node
/**
 * ÉTAPE 1 — Génération HTML + preview
 *
 * Usage :
 *   node scripts/create-livret.js "La posture au bureau" posture-bureau
 *
 * → Génère le HTML, le pousse sur GitHub, affiche le lien de preview.
 * → Quand tu valides, lance : node scripts/finalize-livret.js posture-bureau
 */

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.join(__dirname, '..');
const LIVE_BASE = 'https://livret.pages.dev/livrets';

// Charger .env
const envPath = path.join(ROOT, '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) process.env[k.trim()] = v.join('=').trim();
  });
}

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const [,, titre, nomFichier] = process.argv;

if (!titre || !nomFichier) {
  console.error('\n❌ Usage : node scripts/create-livret.js "Titre" nom-fichier\n');
  process.exit(1);
}
if (!/^[a-z0-9-]+$/.test(nomFichier)) {
  console.error('❌ Nom de fichier en kebab-case uniquement (ex: posture-bureau)');
  process.exit(1);
}
if (!ANTHROPIC_KEY) { console.error('❌ ANTHROPIC_API_KEY manquant dans .env'); process.exit(1); }

async function main() {
  console.log(`\n🚀 Génération du livret : "${titre}"`);
  console.log('─'.repeat(52));

  console.log('\n📝 Génération HTML (Claude Opus)...');
  const html = await generateHTML(titre);

  const htmlPath = path.join(ROOT, 'livrets', `${nomFichier}.html`);
  fs.writeFileSync(htmlPath, html, 'utf8');
  console.log(`   ✅ HTML → livrets/${nomFichier}.html`);

  // Vérifier le nombre de pages
  const pageCount = (html.match(/class="page/g) || []).length;
  console.log(`   📄 Nombre de pages : ${pageCount}${pageCount === 20 ? ' ✅' : ' ⚠️  (attendu : 20)'}`);

  console.log('\n📤 Déploiement sur Cloudflare...');
  execFileSync('git', ['add', `livrets/${nomFichier}.html`], { cwd: ROOT, stdio: 'inherit' });
  execFileSync('git', ['commit', '-m', `Ajoute livret HTML : ${titre}`], { cwd: ROOT, stdio: 'inherit' });
  execFileSync('git', ['push'], { cwd: ROOT, stdio: 'inherit' });

  const previewUrl = `${LIVE_BASE}/${nomFichier}.html`;

  console.log('\n' + '─'.repeat(52));
  console.log('✨ Preview disponible (déploiement ~30s) :');
  console.log(`\n   👉  ${previewUrl}\n`);
  console.log('Quand tu valides :');
  console.log(`   node scripts/finalize-livret.js ${nomFichier}\n`);
}

async function generateHTML(titre) {
  const client = new Anthropic({ apiKey: ANTHROPIC_KEY });
  let fullText = '';
  process.stdout.write('   Streaming');

  const stream = await client.messages.stream({
    model: 'claude-opus-4-6',
    max_tokens: 32000,
    messages: [{ role: 'user', content: buildPrompt(titre) }]
  });

  for await (const chunk of stream) {
    if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
      fullText += chunk.delta.text;
      process.stdout.write('.');
    }
  }
  console.log(' OK');

  const match = fullText.match(/<!DOCTYPE html>[\s\S]*<\/html>/i);
  if (!match) throw new Error('Claude n\'a pas retourné de HTML valide.');
  return match[0];
}

function buildPrompt(titre) {
  return `Crée un livret patient A5 de EXACTEMENT 20 pages sur le thème : ${titre}

Génère uniquement le code HTML complet, sans aucune explication. Commence par <!DOCTYPE html> et termine par </html>.

CONTRAINTE CRITIQUE — PAGES
- EXACTEMENT 20 div.page, ni plus ni moins (nombre pair pour impression recto-verso)
- Si le contenu médical ne remplit pas 20 pages, ajouter des pages de suivi, d'exercices supplémentaires, de récapitulatif ou de notes patient
- Vérifier le compte avant de finir : compter chaque <div class="page"> = 1 page

FORMAT
- A5 exact : 148×210mm
- Marges de sécurité impression : 3mm (@page margin: 3mm)
- HTML auto-contenu, polices Google Fonts
- Langue : français, contenu basé sur données probantes

FONTS
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=Lato:wght@300;400;500;700&family=Caveat:wght@400;700&display=swap" rel="stylesheet">

CSS OBLIGATOIRE
<style>
:root {
  --color-primary: #4A7FB5; --color-secondary: #7DB89B; --color-bg: #FAF8F5;
  --color-accent-warm: #E07B54; --color-accent-soft: #F2D07A;
  --color-text: #2E2E2E; --color-text-light: #7A7A7A;
}

/* FORMAT IMPRESSION A5 avec marges de sécurité 3mm */
@page {
  size: 148mm 210mm;
  margin: 3mm;
}

@media print {
  body { background: white; margin: 0; padding: 0; }
  .page { page-break-after: always; margin: 0; box-shadow: none; }
  .page:last-child { page-break-after: avoid; }
}

* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Lato', sans-serif; font-size: 10pt; line-height: 1.5; color: var(--color-text); background: #e0e0e0; }

.page {
  width: 148mm;
  height: 210mm;
  min-height: 210mm;
  /* padding intérieur : top right bottom left */
  /* bottom 19mm = espace footer (footer à 25px du bas) */
  padding: 8mm 10mm 19mm 10mm;
  background: var(--color-bg);
  position: relative;
  overflow: hidden;
  margin: 10px auto;
  box-shadow: 0 2px 12px rgba(0,0,0,0.12);
}

.page-footer {
  position: absolute; bottom: 25px; left: 10mm; right: 10mm;
  font-size: 6.5pt; font-style: italic; color: var(--color-text-light);
  border-top: 0.5px solid #ddd; padding-top: 1mm;
}
.page-number { position: absolute; bottom: 25px; right: 10mm; font-size: 7pt; color: var(--color-text-light); font-weight: 500; }

h1, h2, h3 { font-family: 'Playfair Display', serif; color: var(--color-primary); }
h1 { font-size: 22pt; line-height: 1.2; }
h2 { font-size: 14pt; margin-bottom: 2mm; line-height: 1.25; }
h3 { font-size: 11pt; margin-bottom: 1.5mm; color: var(--color-text); }
p { margin-bottom: 2mm; } strong { font-weight: 700; }
.caveat { font-family: 'Caveat', cursive; }
.small { font-size: 8pt; } .medium { font-size: 9pt; }
.text-light { color: var(--color-text-light); } .text-primary { color: var(--color-primary); }
.page-icon { font-size: 36px; text-align: center; margin-bottom: 1.5mm; }

.box-retenir  { background: rgba(74,127,181,0.12); border-left: 4px solid var(--color-primary); border-radius: 8px; padding: 2.5mm 3.5mm; margin: 2mm 0; }
.box-attention{ background: rgba(224,123,84,0.12); border-left: 4px solid var(--color-accent-warm); border-radius: 8px; padding: 2.5mm 3.5mm; margin: 2mm 0; }
.box-exemple  { background: rgba(125,184,155,0.12); border-left: 4px solid var(--color-secondary); border-radius: 8px; padding: 2.5mm 3.5mm; margin: 2mm 0; }
.box-citation { background: rgba(242,208,122,0.25); border-radius: 8px; padding: 2.5mm 3.5mm; margin: 2mm 0; font-family: 'Caveat', cursive; font-size: 12pt; position: relative; }
.box-citation::before { content: "«"; font-size: 28pt; color: var(--color-accent-soft); position: absolute; top: -2mm; left: 2mm; font-family: 'Playfair Display', serif; }
.box-header { font-weight: 700; font-size: 9.5pt; margin-bottom: 1.5mm; }

.steps { list-style: none; padding: 0; }
.steps li { display: flex; align-items: flex-start; gap: 2.5mm; margin-bottom: 1.5mm; font-size: 9pt; }
.step-number { display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; min-width: 22px; border-radius: 50%; background: var(--color-primary); color: white; font-weight: 700; font-size: 10pt; }
.step-number.green { background: var(--color-secondary); } .step-number.warm { background: var(--color-accent-warm); }

.two-col { display: flex; gap: 5mm; } .two-col > * { flex: 1; }
.three-col { display: flex; gap: 4mm; } .three-col > * { flex: 1; }

.cover-page { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; background: linear-gradient(170deg, var(--color-bg) 0%, #eef4fa 100%); }
.cover-icon { font-size: 64px; margin-bottom: 4mm; }
.cover-title { font-family: 'Playfair Display', serif; font-size: 26pt; color: var(--color-primary); line-height: 1.15; margin-bottom: 3mm; }
.cover-subtitle { font-size: 11pt; color: var(--color-text-light); letter-spacing: 0.5px; margin-bottom: 6mm; }
.cover-footer { position: absolute; bottom: 8mm; left: 0; right: 0; text-align: center; font-size: 9pt; color: var(--color-text-light); }
.cover-footer strong { color: var(--color-primary); font-size: 10pt; }

.divider { height: 2px; background: linear-gradient(90deg, transparent, var(--color-primary), transparent); margin: 3mm 0; border: none; }
.divider-wave { height: 6px; background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 6'%3E%3Cpath d='M0 3 Q25 0 50 3 Q75 6 100 3 Q125 0 150 3 Q175 6 200 3' fill='none' stroke='%234A7FB5' stroke-width='1.5'/%3E%3C/svg%3E") repeat-x; margin: 1.5mm 0; border: none; }

table { width: 100%; border-collapse: collapse; font-size: 8.5pt; }
th { background: var(--color-primary); color: white; padding: 2mm 2.5mm; text-align: left; font-weight: 700; font-size: 8pt; }
td { padding: 1mm 2mm; border-bottom: 1px solid #e0e0e0; }
tr:nth-child(even) td { background: rgba(74,127,181,0.05); }
.source-table td { font-size: 6.5pt; padding: 1mm 1.5mm; vertical-align: top; }
.source-table td:first-child { font-weight: 700; color: var(--color-primary); white-space: nowrap; width: 32mm; }

.sommaire-item { display: flex; align-items: center; padding: 1mm 2mm; gap: 2mm; font-size: 8.5pt; }
.sommaire-item:nth-child(even) { background: rgba(74,127,181,0.06); border-radius: 4px; }
.sommaire-icon { font-size: 16px; min-width: 22px; text-align: center; }
.sommaire-title { flex: 1; font-weight: 500; } .sommaire-page { font-weight: 700; color: var(--color-primary); min-width: 16px; text-align: right; }

.icon-card { background: white; border-radius: 8px; padding: 3mm; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
.icon-card .card-icon { font-size: 24px; margin-bottom: 1mm; }
.icon-card .card-title { font-weight: 700; font-size: 8.5pt; margin-bottom: 1mm; color: var(--color-primary); }
.icon-card .card-text { font-size: 8pt; color: var(--color-text-light); line-height: 1.35; }

.checklist { list-style: none; padding: 0; }
.checklist li { padding: 1mm 0 1mm 6mm; position: relative; font-size: 8.5pt; }
.checklist li::before { content: "☐"; position: absolute; left: 0; color: var(--color-primary); font-size: 10pt; }

.badge { display: inline-block; padding: 1mm 3mm; border-radius: 10px; font-size: 7.5pt; font-weight: 700; color: white; }
.badge-blue { background: var(--color-primary); } .badge-green { background: var(--color-secondary); } .badge-warm { background: var(--color-accent-warm); }

.progress-bar { height: 6px; background: #e8e8e8; border-radius: 3px; overflow: hidden; margin: 2mm 0; }
.progress-bar .fill { height: 100%; border-radius: 3px; }

.tracker-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 1.5mm; }
.tracker-cell { border: 1px solid #d0d0d0; border-radius: 4px; height: 13mm; display: flex; flex-direction: column; align-items: center; padding-top: 1mm; font-size: 7pt; background: white; }
.tracker-cell .day-label { font-weight: 700; color: var(--color-primary); font-size: 7pt; }
.tracker-header { font-weight: 700; font-size: 7pt; color: var(--color-text-light); text-align: center; padding: 1mm 0; }

.contact-banner { background: var(--color-primary); color: white; padding: 4mm 5mm; border-radius: 8px; margin-bottom: 4mm; text-align: center; }
.contact-banner h2 { color: white; margin-bottom: 1mm; }
.contact-info { font-size: 9.5pt; line-height: 1.7; }
.contact-info .label { font-weight: 700; color: var(--color-primary); display: inline-block; min-width: 25mm; }
.illustration-center { display: flex; justify-content: center; align-items: center; margin: 2mm 0; }
</style>

STRUCTURE DES 20 PAGES (adapter au sujet, EXACTEMENT 20)
1.  Couverture — titre Playfair 26pt, emoji 64px, SVG inline 180×120px, "Livret patient · Kinésithérapie", footer Noémie Bouisset
2.  Sommaire — 18 entrées avec emoji, titre, numéro de page
3.  Introduction — pourquoi ce sujet, objectifs du livret
4.  Mécanismes 1 — physiologie/anatomie + SVG inline
5.  Mécanismes 2 — suite mécanismes + tableau ou schéma
6.  Impact kiné 1 — lien avec rééducation
7.  Impact kiné 2 — effets sur soins et récupération
8.  Conséquences — risques si problème ignoré
9.  Auto-évaluation — quiz ou échelle de score
10. Conseil pratique 1 — règle avec étapes .steps
11. Conseil pratique 2
12. Conseil pratique 3 — tableau ou grille
13. Exercice/technique 1 — SVG + étapes numérotées
14. Exercice/technique 2 — SVG + étapes
15. Exercice/technique 3 — SVG + étapes
16. Conseils personnalisés — tableau selon profil
17. Suivi semaine 1 — .tracker-grid 7 jours
18. Suivi semaine 2 — bilan hebdomadaire
19. Sources — .source-table, 6+ références HAS/Cochrane/PubMed/INSERM
20. Contact — .contact-banner, Noémie Bouisset · 125 Rue de Mulhouse · 68310 Wittelsheim · Mars 2026

RÈGLES CRITIQUES
- SVG uniquement inline, ZÉRO image externe
- Footer (source + "Noémie Bouisset, Kinésithérapeute") sur chaque page SAUF couverture
- Numéro de page sur chaque page sauf couverture
- Hauteur utile max par page : 692px à 96dpi — NE PAS DÉPASSER
- Si une page risque de déborder : réduire SVG, espacements, taille police
- COMPTER les pages avant de clôturer : il doit y avoir exactement 20 <div class="page">
- Sources page 19 : références réelles et vérifiables`;
}

main().catch(err => { console.error('\n❌', err.message); process.exit(1); });
