#!/usr/bin/env node
/**
 * ÉTAPE 2 — Génération PDF + enregistrement Notion
 * À lancer après validation du HTML preview.
 *
 * Usage :
 *   node scripts/finalize-livret.js posture-bureau
 */

import { Client as NotionClient } from '@notionhq/client';
import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT        = path.join(__dirname, '..');
const DATABASE_ID = '327a20d2dec08003822bfaa67a8c2de5';
const LIVE_BASE   = 'https://livret.pages.dev/livrets';

// Charger .env
const envPath = path.join(ROOT, '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) process.env[k.trim()] = v.join('=').trim();
  });
}

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const [,, nomFichier] = process.argv;

if (!nomFichier) {
  console.error('\n❌ Usage : node scripts/finalize-livret.js nom-fichier\n');
  process.exit(1);
}
if (!NOTION_TOKEN) { console.error('❌ NOTION_TOKEN manquant dans .env'); process.exit(1); }

const htmlPath = path.join(ROOT, 'livrets', `${nomFichier}.html`);
if (!fs.existsSync(htmlPath)) {
  console.error(`❌ Fichier introuvable : livrets/${nomFichier}.html`);
  process.exit(1);
}

async function main() {
  console.log(`\n✅ Finalisation : ${nomFichier}`);
  console.log('─'.repeat(52));

  // Lire le titre depuis le HTML
  const html = fs.readFileSync(htmlPath, 'utf8');
  const titreMatch = html.match(/<title>([^<]+)<\/title>/i);
  const titre = titreMatch ? titreMatch[1].replace(' — Livret patient', '').trim() : nomFichier;

  // Vérifier le nombre de pages
  const pageCount = (html.match(/class="page"/g) || []).length;
  console.log(`\n📄 Pages détectées : ${pageCount}${pageCount === 20 ? ' ✅' : ` ⚠️  (attendu 20, pair pour impression)`}`);
  if (pageCount % 2 !== 0) {
    console.log('   ⚠️  Nombre impair — le PDF aura une page vierge au verso de la dernière page.');
  }

  // Générer PDF
  console.log('\n🖨️  Conversion PDF (A5, marges 3mm)...');
  const pdfPath = path.join(ROOT, 'livrets', `${nomFichier}.pdf`);
  await generatePDF(htmlPath, pdfPath);
  console.log(`   ✅ PDF → livrets/${nomFichier}.pdf`);

  // Push GitHub
  console.log('\n📤 Push du PDF sur GitHub...');
  execFileSync('git', ['add', `livrets/${nomFichier}.pdf`], { cwd: ROOT, stdio: 'inherit' });
  execFileSync('git', ['commit', '-m', `Ajoute PDF : ${titre}`], { cwd: ROOT, stdio: 'inherit' });
  execFileSync('git', ['push'], { cwd: ROOT, stdio: 'inherit' });
  console.log('   ✅ Déployé');

  // Mettre à jour Notion
  console.log('\n🔗 Enregistrement dans Notion...');
  const htmlUrl = `${LIVE_BASE}/${nomFichier}.html`;
  const pdfUrl  = `${LIVE_BASE}/${nomFichier}.pdf`;
  await updateNotion(titre, htmlUrl, pdfUrl);
  console.log('   ✅ Notion mis à jour — statut : Terminé');

  console.log('\n' + '─'.repeat(52));
  console.log('🎉 Livret finalisé !');
  console.log(`   HTML  : ${htmlUrl}`);
  console.log(`   PDF   : ${pdfUrl}\n`);
}

async function generatePDF(htmlPath, pdfPath) {
  const chromePaths = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium'
  ];
  const executablePath = chromePaths.find(p => fs.existsSync(p));
  if (!executablePath) throw new Error('Chrome introuvable. Installe Google Chrome.');

  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('file://' + htmlPath, { waitUntil: 'networkidle0', timeout: 60000 });
  await new Promise(r => setTimeout(r, 2500)); // attendre fonts Google

  await page.pdf({
    path: pdfPath,
    width: '148mm',
    height: '210mm',
    printBackground: true,
    // Les marges de sécurité 3mm sont définies dans @page du CSS
    margin: { top: '0', right: '0', bottom: '0', left: '0' }
  });

  await browser.close();
}

async function updateNotion(titre, htmlUrl, pdfUrl) {
  const notion = new NotionClient({ auth: NOTION_TOKEN });

  // Chercher la page dans la base
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

  // Ajouter liens dans la page Notion
  await notion.blocks.children.append({
    block_id: pageId,
    children: [
      { type: 'divider', divider: {} },
      {
        type: 'heading_3',
        heading_3: { rich_text: [{ type: 'text', text: { content: '📄 Livret finalisé' } }] }
      },
      { type: 'bookmark', bookmark: { url: htmlUrl } },
      {
        type: 'paragraph',
        paragraph: {
          rich_text: [{
            type: 'text',
            text: { content: 'Télécharger le PDF (A5 · impression prête)', link: { url: pdfUrl } },
            annotations: { bold: true, color: 'blue' }
          }]
        }
      }
    ]
  });
}

main().catch(err => { console.error('\n❌', err.message); process.exit(1); });
