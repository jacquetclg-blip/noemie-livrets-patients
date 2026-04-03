# Livrets Patients — Noémie Bouisset

Bibliothèque de livrets éducatifs pour patients en kinésithérapie.

**Cabinet** : 125 Rue de Mulhouse, 68310 Wittelsheim
**Site live** : [livret.pages.dev](https://livret.pages.dev)
**Dashboard** : [livret.pages.dev/dashboard.html](https://livret.pages.dev/dashboard.html) · mdp : `noemie`

---

## Livrets disponibles

| Livret | Fichier | Statut |
|--------|---------|--------|
| Le Sommeil & votre récupération | [voir](https://livret.pages.dev/livrets/sommeil-recuperation.html) | Terminé |

---

## Documentation

| Document | Description |
|----------|-------------|
| [Workflow complet](docs/workflow.md) | Les 2 étapes : HTML preview + finalisation PDF |
| [Guide de création](docs/creation-livrets.md) | Specs complètes, CSS, structure 20 pages |
| [Charte graphique](docs/charte-graphique.md) | Couleurs, typographie, composants visuels |
| [Règles anti-débordement](docs/anti-debordement.md) | Éviter les problèmes de mise en page |

---

## Créer un nouveau livret

**Étape 1 — HTML + preview**
```bash
node scripts/create-livret.js "Titre du livret" nom-fichier
```
→ Génère 20 pages HTML, déploie, partage le lien de preview.

**Étape 2 — Après validation**
```bash
node scripts/finalize-livret.js nom-fichier
```
→ Génère le PDF A5 (marges 3mm), l'enregistre dans Notion avec statut Terminé.

---

## Sujets prévus

### Sommeil & récupération
- [x] Le Sommeil & votre récupération (`sommeil-recuperation`)

### Arthrose
- [ ] Arthrose — Livret général (`arthrose-general`)
- [ ] Arthrose — Genou / gonarthrose (`arthrose-genou`)
- [ ] Arthrose — Hanche / coxarthrose (`arthrose-hanche`)
- [ ] Arthrose — Épaule / omarthrose (`arthrose-epaule`)
- [ ] Arthrose — Dos / arthrose vertébrale (`arthrose-dos`)

### Arthrite
- [ ] Arthrite — Livret général (`arthrite-general`)
- [ ] Arthrite — Rhumatismes inflammatoires (`arthrite-rhumatismes`)

### Tendinopathies
- [ ] Tendinopathie — Livret général (`tendinopathie-general`)
- [ ] Tendinopathie — Coiffe des rotateurs (`tendinopathie-coiffe`)
- [ ] Tendinopathie — Coude / épicondylite (`tendinopathie-coude`)
- [ ] Tendinopathie — Achille (`tendinopathie-achille`)

### Techniques & soins
- [ ] Drainage lymphatique (`drainage-lymphatique`)
- [ ] Drainage lymphatique manuel (`drainage-lymphatique-manuel`)
- [ ] Pose de K-Tape (`pose-k-tape`)
- [ ] Travail des cicatrices post-opératoires (`cicatrices-post-op`)

### Éducation thérapeutique
- [ ] Cohérence cardiaque (`coherence-cardiaque`)
- [ ] Éducation aux neurosciences de la douleur (`neurosciences-douleur`)
- [ ] Nutrition & kinésithérapie (`nutrition`)

### Prévention & sport
- [ ] Prévention — Livret général (`prevention-generale`)
- [ ] Prévention et gestes spécifiques aux métiers (`prevention-metiers`)
- [ ] Portage bébé (`portage-bebe`)
- [ ] Programme de rééducation & reprise sportive (`reeducation-reprise-sportive`)
