#!/usr/bin/env node
/**
 * create-livret.js
 *
 * Usage :
 *   node scripts/create-livret.js "La posture au bureau" posture-bureau
 *   node scripts/create-livret.js "La lombalgie : comprendre et agir" lombalgie
 *
 * Variables d'environnement requises (fichier .env) :
 *   ANTHROPIC_API_KEY=sk-ant-...
 *   NOTION_TOKEN=secret_...
 */

import Anthropic from '@anthropic-ai/sdk';
import { Client as NotionClient } from '@notionhq/client';
import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

// ── Config ────────────────────────────────────────────────────────────────────
const __dirname   = path.dirname(fileURLToPath(import.meta.url));
const ROOT        = path.join(__dirname, '..');
const DATABASE_ID = '327a20d2dec08003822bfaa67a8c2de5';
const LIVE_BASE   = 'https://livret.pages.dev/livrets';

// Charger .env manuellement
const envPath = path.join(ROOT, '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) process.env[k.trim()] = v.join('=').trim();
  });
}

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const NOTION_TOKEN  = process.env.NOTION_TOKEN;

// ── Arguments ─────────────────────────────────────────────────────────────────
const [,, titre, nomFichier] = process.argv;
if (!titre || !nomFichier) {
  console.error('\n❌ Usage : node scripts/create-livret.js "Titre" nom-fichier\n');
  process.exit(1);
}
if (!ANTHROPIC_KEY) { console.error('❌ ANTHROPIC_API_KEY manquant dans .env'); process.exit(1); }
if (!NOTION_TOKEN)  { console.error('❌ NOTION_TOKEN manquant dans .env'); process.exit(1); }

// Validation du nom de fichier (kebab-case uniquement)
if (!/^[a-z0-9-]+$/.test(nomFichier)) {
  console.error('❌ Le nom de fichier doit être en kebab-case (ex: posture-bureau)');
  process.exit(1);
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n🚀 Création du livret : "${titre}"`);
  console.log('─'.repeat(50));

  // 1. Générer le HTML
  console.log('\n📝 Génération du HTML (Claude)...');
  const html = await generateHTML(titre);
  const htmlPath = path.join(ROOT, 'livrets', `${nomFichier}.html`);
  fs.writeFileSync(htmlPath, html, 'utf8');
  console.log(`   ✅ HTML → livrets/${nomFichier}.html`);

  // 2. Générer le PDF
  console.log('\n🖨️  Conversion en PDF (Puppeteer)...');
  const pdfPath = path.join(ROOT, 'livrets', `${nomFichier}.pdf`);
  await generatePDF(htmlPath, pdfPath);
  console.log(`   ✅ PDF  → livrets/${nomFichier}.pdf`);

  // 3. Push GitHub → Cloudflare déploie automatiquement
  console.log('\n📤 Push sur GitHub...');
  pushGitHub(titre, nomFichier);
  console.log('   ✅ Déployé sur livret.pages.dev');

  // 4. Mettre à jour Notion
  console.log('\n🔗 Mise à jour Notion...');
  const htmlUrl = `${LIVE_BASE}/${nomFichier}.html`;
  const pdfUrl  = `${LIVE_BASE}/${nomFichier}.pdf`;
  await updateNotion(titre, htmlUrl, pdfUrl);
  console.log('   ✅ Notion mis à jour — statut : Terminé');

  console.log('\n' + '─'.repeat(50));
  console.log('✨ Livret terminé !');
  console.log(`   Livret : ${htmlUrl}`);
  console.log(`   PDF    : ${pdfUrl}\n`);
}

// ── Génération HTML via Claude ─────────────────────────────────────────────────
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

// ── Conversion PDF via Puppeteer ───────────────────────────────────────────────
async function generatePDF(htmlPath, pdfPath) {
  const chromePaths = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome'
  ];
  const executablePath = chromePaths.find(p => fs.existsSync(p));
  if (!executablePath) throw new Error('Chrome introuvable. Installe Google Chrome.');

  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const fileUrl = 'file://' + htmlPath;
  await page.goto(fileUrl, { waitUntil: 'networkidle0', timeout: 60000 });
  await new Promise(r => setTimeout(r, 2000)); // attendre fonts

  await page.pdf({
    path: pdfPath,
    width: '154mm',
    height: '216mm',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' }
  });

  await browser.close();
}

// ── Push GitHub ────────────────────────────────────────────────────────────────
function pushGitHub(titre, nomFichier) {
  const opts = { cwd: ROOT, stdio: 'inherit' };
  execFileSync('git', ['add', `livrets/${nomFichier}.html`, `livrets/${nomFichier}.pdf`], opts);
  execFileSync('git', ['commit', '-m', `Ajoute livret : ${titre}`], opts);
  execFileSync('git', ['push'], opts);
}

// ── Mise à jour Notion ─────────────────────────────────────────────────────────
async function updateNotion(titre, htmlUrl, pdfUrl) {
  const notion = new NotionClient({ auth: NOTION_TOKEN });

  const res = await notion.databases.query({
    database_id: DATABASE_ID,
    filter: {
      property: 'Nom',
      title: { contains: titre.split(' ').slice(0, 3).join(' ') }
    }
  });

  let pageId;
  if (res.results.length > 0) {
    pageId = res.results[0].id;
    await notion.pages.update({
      page_id: pageId,
      properties: { Status: { status: { name: 'Terminé' } } }
    });
  } else {
    const newPage = await notion.pages.create({
      parent: { database_id: DATABASE_ID },
      properties: {
        Nom:    { title: [{ text: { content: titre } }] },
        Status: { status: { name: 'Terminé' } }
      }
    });
    pageId = newPage.id;
  }

  await notion.blocks.children.append({
    block_id: pageId,
    children: [
      { type: 'divider', divider: {} },
      {
        type: 'heading_3',
        heading_3: { rich_text: [{ type: 'text', text: { content: '📄 Livret généré' } }] }
      },
      {
        type: 'bookmark',
        bookmark: { url: htmlUrl }
      },
      {
        type: 'paragraph',
        paragraph: {
          rich_text: [{
            type: 'text',
            text: { content: 'Télécharger le PDF', link: { url: pdfUrl } },
            annotations: { bold: true, color: 'blue' }
          }]
        }
      }
    ]
  });
}

// ── Prompt ─────────────────────────────────────────────────────────────────────
function buildPrompt(titre) {
  return `Crée un livret patient A5 de 20 pages sur le thème : ${titre}

Génère uniquement le code HTML complet, sans explication. Commence par <!DOCTYPE html> et termine par </html>.

FORMAT OBLIGATOIRE
- A5 : 148×210mm, @page size: 154mm 216mm, margin: 6mm
- Exactement 20 pages HTML (20 div.page)
- HTML auto-contenu, toutes les polices via Google Fonts
- Langue : français, contenu basé sur des données probantes

FONTS
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=Lato:wght@300;400;500;700&family=Caveat:wght@400;700&display=swap" rel="stylesheet">

VARIABLES CSS
:root {
  --color-primary: #4A7FB5; --color-secondary: #7DB89B; --color-bg: #FAF8F5;
  --color-accent-warm: #E07B54; --color-accent-soft: #F2D07A;
  --color-text: #2E2E2E; --color-text-light: #7A7A7A;
}

CSS OBLIGATOIRE
.page { width:148mm; min-height:210mm; height:210mm; padding:8mm 10mm 19mm 10mm; background:var(--color-bg); position:relative; overflow:hidden; margin:10px auto; box-shadow:0 2px 12px rgba(0,0,0,0.12); }
.page-footer { position:absolute; bottom:25px; left:10mm; right:10mm; font-size:6.5pt; font-style:italic; color:var(--color-text-light); border-top:0.5px solid #ddd; padding-top:1mm; }
.page-number { position:absolute; bottom:25px; right:10mm; font-size:7pt; color:var(--color-text-light); font-weight:500; }
@media print { .page { page-break-after:always; margin:0; box-shadow:none; } .page:last-child { page-break-after:avoid; } }
body { font-family:'Lato',sans-serif; font-size:10pt; line-height:1.5; color:var(--color-text); background:#e0e0e0; }
h1,h2,h3 { font-family:'Playfair Display',serif; color:var(--color-primary); }
h2 { font-size:14pt; margin-bottom:2mm; } h3 { font-size:11pt; margin-bottom:1.5mm; }
p { margin-bottom:2mm; } strong { font-weight:700; }
.page-icon { font-size:36px; text-align:center; margin-bottom:1.5mm; }
.box-retenir { background:rgba(74,127,181,0.12); border-left:4px solid var(--color-primary); border-radius:8px; padding:2.5mm 3.5mm; margin:2mm 0; }
.box-attention { background:rgba(224,123,84,0.12); border-left:4px solid var(--color-accent-warm); border-radius:8px; padding:2.5mm 3.5mm; margin:2mm 0; }
.box-exemple { background:rgba(125,184,155,0.12); border-left:4px solid var(--color-secondary); border-radius:8px; padding:2.5mm 3.5mm; margin:2mm 0; }
.box-header { font-weight:700; font-size:9.5pt; margin-bottom:1.5mm; }
.steps { list-style:none; padding:0; }
.steps li { display:flex; align-items:flex-start; gap:2.5mm; margin-bottom:1.5mm; font-size:9pt; }
.step-number { display:inline-flex; align-items:center; justify-content:center; width:22px; height:22px; min-width:22px; border-radius:50%; background:var(--color-primary); color:white; font-weight:700; font-size:10pt; }
.step-number.green { background:var(--color-secondary); } .step-number.warm { background:var(--color-accent-warm); }
.two-col { display:flex; gap:5mm; } .two-col>* { flex:1; }
.three-col { display:flex; gap:4mm; } .three-col>* { flex:1; }
.divider { height:2px; background:linear-gradient(90deg,transparent,var(--color-primary),transparent); margin:3mm 0; border:none; }
.divider-wave { height:6px; background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 6'%3E%3Cpath d='M0 3 Q25 0 50 3 Q75 6 100 3 Q125 0 150 3 Q175 6 200 3' fill='none' stroke='%234A7FB5' stroke-width='1.5'/%3E%3C/svg%3E") repeat-x; margin:1.5mm 0; border:none; }
table { width:100%; border-collapse:collapse; font-size:8.5pt; }
th { background:var(--color-primary); color:white; padding:2mm 2.5mm; font-weight:700; font-size:8pt; }
td { padding:1mm 2mm; border-bottom:1px solid #e0e0e0; }
.source-table td { font-size:6.5pt; padding:1mm 1.5mm; vertical-align:top; }
.source-table td:first-child { font-weight:700; color:var(--color-primary); white-space:nowrap; width:32mm; }
.sommaire-item { display:flex; align-items:center; padding:1mm 2mm; gap:2mm; font-size:8.5pt; }
.sommaire-item:nth-child(even) { background:rgba(74,127,181,0.06); border-radius:4px; }
.sommaire-icon { font-size:16px; min-width:22px; text-align:center; }
.sommaire-title { flex:1; font-weight:500; } .sommaire-page { font-weight:700; color:var(--color-primary); min-width:16px; text-align:right; }
.tracker-grid { display:grid; grid-template-columns:repeat(7,1fr); gap:1.5mm; }
.tracker-cell { border:1px solid #d0d0d0; border-radius:4px; height:13mm; display:flex; flex-direction:column; align-items:center; padding-top:1mm; font-size:7pt; background:white; }
.contact-banner { background:var(--color-primary); color:white; padding:4mm 5mm; border-radius:8px; margin-bottom:4mm; text-align:center; }
.contact-banner h2 { color:white; margin-bottom:1mm; }
.illustration-center { display:flex; justify-content:center; align-items:center; margin:2mm 0; }

STRUCTURE DES 20 PAGES
1. Couverture : cover-page, titre 26pt Playfair Display, emoji 64px, SVG inline 180×120, "Livret patient · Kinésithérapie", footer avec nom cabinet
2. Sommaire : 18 sommaire-items avec emoji, titre section, numéro de page
3. Introduction : pourquoi ce sujet, objectifs
4. Mécanismes 1 : physiologie avec SVG inline
5. Mécanismes 2 : suite, tableau ou schéma SVG
6. Impact kiné 1 : lien avec la rééducation
7. Impact kiné 2 : effets sur les soins
8. Conséquences : risques, box-attention
9. Auto-évaluation : quiz ou échelle de score avec tableau
10. Conseil pratique 1 : étapes numérotées .steps
11. Conseil pratique 2
12. Conseil pratique 3 : tableau ou grille
13. Exercice 1 : SVG inline + étapes
14. Exercice 2 : SVG inline + étapes
15. Exercice 3 : SVG inline + étapes
16. Profil patient : tableau .two-col selon profil
17. Suivi semaine 1 : .tracker-grid 7 jours
18. Suivi semaine 2 : bilan hebdomadaire
19. Sources : .source-table avec 6+ références réelles HAS/Cochrane/PubMed/INSERM
20. Contact : .contact-banner "Noémie Bouisset · Kinésithérapeute · 125 Rue de Mulhouse · 68310 Wittelsheim · Mars 2026"

RÈGLES CRITIQUES
- SVG uniquement inline, jamais d'images externes
- Footer et numéro sur chaque page sauf couverture
- Contenu max 692px de hauteur utile par page
- Sources réelles et vérifiables en page 19
- Contenu médical rigoureux adapté au niveau patient`;
}

// ── Run ───────────────────────────────────────────────────────────────────────
main().catch(err => {
  console.error('\n❌ Erreur :', err.message);
  process.exit(1);
});
