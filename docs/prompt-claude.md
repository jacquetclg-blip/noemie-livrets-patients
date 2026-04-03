# Prompt à copier pour créer un nouveau livret

Copie le bloc ci-dessous, remplace `[SUJET]` et `[NOM-FICHIER]`, et envoie-le à Claude.

---

```
Crée un livret patient A5 de 20 pages sur le thème : [SUJET]
Nom du fichier : livrets/[NOM-FICHIER].html

Respecte exactement les specs suivantes :

FORMAT
- A5 : 148×210mm, fond perdu 3mm → 154×216mm
- Exactement 20 pages
- HTML auto-contenu, impression navigateur → PDF
- Langue : français

CHARTE GRAPHIQUE
- Police titres : Playfair Display (Google Fonts)
- Police corps : Lato (Google Fonts)
- Police citations : Caveat (Google Fonts)
- Couleurs :
  --color-primary: #4A7FB5
  --color-secondary: #7DB89B
  --color-bg: #FAF8F5
  --color-accent-warm: #E07B54
  --color-accent-soft: #F2D07A
  --color-text: #2E2E2E
  --color-text-light: #7A7A7A

CSS DES PAGES
.page {
  width: 148mm;
  height: 210mm;
  min-height: 210mm;
  padding: 8mm 10mm 19mm 10mm;
  background: var(--color-bg);
  position: relative;
  overflow: hidden;
  margin: 10px auto;
  box-shadow: 0 2px 12px rgba(0,0,0,0.12);
}
.page-footer { position: absolute; bottom: 25px; left: 10mm; right: 10mm; font-size: 6.5pt; font-style: italic; color: var(--color-text-light); border-top: 0.5px solid #ddd; padding-top: 1mm; }
.page-number { position: absolute; bottom: 25px; right: 10mm; font-size: 7pt; color: var(--color-text-light); font-weight: 500; }

STRUCTURE DES 20 PAGES
1. Couverture — titre, illustration SVG inline, "Livret patient · Kinésithérapie"
2. Sommaire — liste des 18 sections avec numéros de page
3. Introduction — pourquoi ce sujet, objectifs
4-5. Mécanismes (×2) — anatomie / physiologie / science du sujet
6-7. Impacts sur la rééducation (×2) — lien direct avec la kiné
8. Conséquences — risques si le problème est ignoré
9. Auto-évaluation — quiz ou score patient
10-12. Conseils pratiques (×3) — règles concrètes, habitudes, environnement
13-15. Exercices / techniques (×3) — exercices illustrés SVG, techniques
16. Conseils personnalisés — adapter à son profil
17-18. Suivi (×2) — journal, tableau hebdomadaire à remplir
19. Sources — références scientifiques (HAS, Cochrane, PubMed, INSERM)
20. Contact — Noémie Bouisset · 125 Rue de Mulhouse · 68310 Wittelsheim

RÈGLES IMPORTANTES
- Toutes les illustrations sont des SVG inline (zéro image externe)
- Footer sur chaque page avec source courte + "Noémie Bouisset, Kinésithérapeute"
- Numéro de page sur chaque page (sauf couverture)
- Contenu basé sur des données probantes (citer les sources page 19)
- Le contenu ne doit JAMAIS dépasser la hauteur utile de la page (692px à 96dpi)
- Après génération, vérifier l'absence de débordement avec ce JS :
  (() => { const pages = document.querySelectorAll('.page'); const r = []; pages.forEach((p,i) => { p.style.overflow='visible'; const s=getComputedStyle(p); const pt=parseFloat(s.paddingTop); const pb=parseFloat(s.paddingBottom); const ih=p.offsetHeight-pt-pb; const ov=p.scrollHeight-pt-pb-ih; p.style.overflow='hidden'; if(ov>1) r.push('Page '+(i+1)+': +'+Math.round(ov)+'px'); }); return r.length?r:'ALL 20 PAGES OK'; })()
```

---

## Exemples de sujets et noms de fichiers

| Sujet | [SUJET] | [NOM-FICHIER] |
|-------|---------|---------------|
| Posture au bureau | La posture au bureau et la prévention des douleurs cervicales | `posture-bureau` |
| Respiration | La respiration et la performance sportive | `respiration-performance` |
| Nutrition | La nutrition et la récupération sportive | `nutrition-recuperation` |
| Douleur chronique | La gestion de la douleur chronique | `douleur-chronique` |
| Retour au sport | Le retour au sport après blessure | `retour-au-sport` |
| Genou | La prévention des blessures du genou | `prevention-genou` |
| Lombalgie | La lombalgie : comprendre et agir | `lombalgie` |
| Arthrose | L'arthrose : mieux vivre avec | `arthrose` |
| Tendinopathie | Les tendinopathies : comprendre et traiter | `tendinopathie` |
| Cicatrices | Le travail des cicatrices post-opératoires | `cicatrices` |
