# Guide complet de création des livrets

## Specs techniques

| Paramètre | Valeur |
|---|---|
| Format | A5 (148×210mm) + 3mm fond perdu = 154×216mm |
| Pages | Exactement 20 |
| Rendu | HTML auto-contenu → Fichier → Imprimer → PDF |
| Polices | Google Fonts : Playfair Display, Lato, Caveat |
| Langue | Français |

## Structure des 20 pages

| Page | Type | Contenu |
|---|---|---|
| 1 | Couverture | Titre, emoji, illustration SVG, "Livret patient · Kinésithérapie", nom cabinet |
| 2 | Sommaire | 18 rubriques avec numéros de page et icônes |
| 3 | Introduction | Pourquoi ce sujet, ce que le livret apporte |
| 4 | Mécanismes 1 | Science / physiologie / anatomie |
| 5 | Mécanismes 2 | Suite des mécanismes |
| 6 | Impact kiné 1 | Lien avec la rééducation, effets sur les soins |
| 7 | Impact kiné 2 | Suite des impacts |
| 8 | Conséquences | Risques si le problème est négligé |
| 9 | Auto-évaluation | Quiz ou score (type PSQI, échelle visuelle…) |
| 10 | Conseil pratique 1 | Règle n°1 (ex: hygiène du sommeil) |
| 11 | Conseil pratique 2 | Règle n°2 (ex: environnement) |
| 12 | Conseil pratique 3 | Règle n°3 (ex: alimentation / rythme) |
| 13 | Exercice / technique 1 | Avec illustration SVG et étapes numérotées |
| 14 | Exercice / technique 2 | Avec illustration SVG |
| 15 | Exercice / technique 3 | Avec illustration SVG |
| 16 | Conseils personnalisés | Adapter selon le profil du patient |
| 17 | Suivi semaine 1 | Journal quotidien à remplir |
| 18 | Suivi semaine 2 | Tableau hebdomadaire + bilan |
| 19 | Sources | Références scientifiques (HAS, Cochrane, PubMed…) |
| 20 | Contact | Coordonnées cabinet, espace notes patient |

## CSS de base complet

```html
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=Lato:wght@300;400;500;700&family=Caveat:wght@400;700&display=swap" rel="stylesheet">
<style>
:root {
  --color-primary:    #4A7FB5;
  --color-secondary:  #7DB89B;
  --color-bg:         #FAF8F5;
  --color-accent-warm:#E07B54;
  --color-accent-soft:#F2D07A;
  --color-text:       #2E2E2E;
  --color-text-light: #7A7A7A;
}
@page { size: 154mm 216mm; margin: 6mm; }
@media print {
  .page { page-break-after: always; }
  body { background: white; margin: 0; padding: 0; }
  .page:last-child { page-break-after: avoid; }
}
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Lato', sans-serif; font-size: 10pt; line-height: 1.5; color: var(--color-text); background: #e0e0e0; }
.page { width: 154mm; min-height: 216mm; height: 216mm; padding: 8mm 10mm 19mm 10mm; background: var(--color-bg); position: relative; overflow: hidden; margin: 10px auto; box-shadow: 0 2px 12px rgba(0,0,0,0.12); }
@media print { .page { margin: 0; box-shadow: none; } }
@media screen { .page { height: auto; min-height: 0; padding-bottom: 40px; } }
h1, h2, h3 { font-family: 'Playfair Display', serif; color: var(--color-primary); }
h1 { font-size: 22pt; line-height: 1.2; }
h2 { font-size: 14pt; margin-bottom: 2mm; line-height: 1.25; }
h3 { font-size: 11pt; margin-bottom: 1.5mm; color: var(--color-text); }
p { margin-bottom: 2mm; }
strong { font-weight: 700; }
.caveat { font-family: 'Caveat', cursive; }
.small { font-size: 8pt; }
.medium { font-size: 9pt; }
.text-light { color: var(--color-text-light); }
.text-primary { color: var(--color-primary); }
.text-secondary { color: var(--color-secondary); }
.text-warm { color: var(--color-accent-warm); }
.page-icon { font-size: 36px; text-align: center; margin-bottom: 1.5mm; }
.page-footer { position: absolute; bottom: 25px; left: 10mm; right: 10mm; font-size: 6.5pt; font-style: italic; color: var(--color-text-light); border-top: 0.5px solid #ddd; padding-top: 1mm; }
.page-number { position: absolute; bottom: 25px; right: 10mm; font-size: 7pt; color: var(--color-text-light); font-weight: 500; }
.box-retenir, .box-attention, .box-exemple, .box-citation { border-radius: 8px; padding: 2.5mm 3.5mm; margin: 2mm 0; }
.box-retenir  { background: rgba(74,127,181,0.12); border-left: 4px solid var(--color-primary); }
.box-attention{ background: rgba(224,123,84,0.12); border-left: 4px solid var(--color-accent-warm); }
.box-exemple  { background: rgba(125,184,155,0.12); border-left: 4px solid var(--color-secondary); }
.box-citation { background: rgba(242,208,122,0.25); font-family: 'Caveat', cursive; font-size: 12pt; position: relative; }
.box-citation::before { content: "«"; font-size: 28pt; color: var(--color-accent-soft); position: absolute; top: -2mm; left: 2mm; font-family: 'Playfair Display', serif; }
.box-header { font-weight: 700; font-size: 9.5pt; margin-bottom: 1.5mm; }
.steps { list-style: none; padding: 0; }
.steps li { display: flex; align-items: flex-start; gap: 2.5mm; margin-bottom: 1.5mm; font-size: 9pt; }
.step-number { display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; min-width: 22px; border-radius: 50%; background: var(--color-primary); color: white; font-weight: 700; font-size: 10pt; }
.step-number.green { background: var(--color-secondary); }
.step-number.warm  { background: var(--color-accent-warm); }
.two-col   { display: flex; gap: 5mm; }
.two-col > *{ flex: 1; }
.three-col { display: flex; gap: 4mm; }
.three-col > *{ flex: 1; }
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
.sommaire-title { flex: 1; font-weight: 500; }
.sommaire-page { font-weight: 700; color: var(--color-primary); min-width: 16px; text-align: right; }
.icon-card { background: white; border-radius: 8px; padding: 3mm; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
.icon-card .card-icon { font-size: 24px; margin-bottom: 1mm; }
.icon-card .card-title { font-weight: 700; font-size: 8.5pt; margin-bottom: 1mm; color: var(--color-primary); }
.icon-card .card-text { font-size: 8pt; color: var(--color-text-light); line-height: 1.35; }
.checklist { list-style: none; padding: 0; }
.checklist li { padding: 1mm 0 1mm 6mm; position: relative; font-size: 8.5pt; }
.checklist li::before { content: "☐"; position: absolute; left: 0; color: var(--color-primary); font-size: 10pt; }
.badge { display: inline-block; padding: 1mm 3mm; border-radius: 10px; font-size: 7.5pt; font-weight: 700; color: white; }
.badge-blue  { background: var(--color-primary); }
.badge-green { background: var(--color-secondary); }
.badge-warm  { background: var(--color-accent-warm); }
.progress-bar { height: 6px; background: #e8e8e8; border-radius: 3px; overflow: hidden; margin: 2mm 0; }
.progress-bar .fill { height: 100%; border-radius: 3px; }
.tracker-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 1.5mm; }
.tracker-cell { border: 1px solid #d0d0d0; border-radius: 4px; height: 13mm; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding-top: 1mm; font-size: 7pt; background: white; }
.tracker-cell .day-label { font-weight: 700; color: var(--color-primary); font-size: 7pt; }
.tracker-header { font-weight: 700; font-size: 7pt; color: var(--color-text-light); text-align: center; padding: 1mm 0; }
.contact-banner { background: var(--color-primary); color: white; padding: 4mm 5mm; border-radius: 8px; margin-bottom: 4mm; text-align: center; }
.contact-banner h2 { color: white; margin-bottom: 1mm; }
.contact-info { font-size: 9.5pt; line-height: 1.7; }
.contact-info .label { font-weight: 700; color: var(--color-primary); display: inline-block; min-width: 25mm; }
.illustration-center { display: flex; justify-content: center; align-items: center; margin: 2mm 0; }
</style>
```

## Squelette HTML d'une page intérieure

```html
<div class="page">
  <div class="page-icon">🏷️</div>
  <h2>Titre de la page</h2>
  <hr class="divider-wave">

  <p>Contenu...</p>

  <div class="box-retenir">
    <div class="box-header">À retenir</div>
    <p>Point clé.</p>
  </div>

  <div class="page-footer">Source courte · Noémie Bouisset, Kinésithérapeute</div>
  <div class="page-number">5</div>
</div>
```

## Workflow de déploiement

```bash
# 1. Générer le livret avec Claude
# 2. Sauvegarder dans livrets/[nom].html
# 3. Pousser sur GitHub
git add livrets/[nom].html
git commit -m "Ajoute livret : [titre]"
git push
# 4. Cloudflare Pages déploie automatiquement
# URL : https://livret.pages.dev/livrets/[nom].html
```
