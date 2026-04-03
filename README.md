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
| [Guide de création](docs/creation-livrets.md) | Specs complètes, CSS, structure 20 pages |
| [Prompt Claude](docs/prompt-claude.md) | Prompt à copier-coller pour créer un nouveau livret |
| [Charte graphique](docs/charte-graphique.md) | Couleurs, typographie, composants visuels |
| [Règles anti-débordement](docs/anti-debordement.md) | Éviter les problèmes de mise en page |

---

## Créer un nouveau livret

1. Ouvrir [docs/prompt-claude.md](docs/prompt-claude.md)
2. Copier le prompt
3. Remplacer `[SUJET]` par le thème voulu
4. Coller dans Claude (claude.ai ou Claude Code)
5. Le livret généré va dans `livrets/[nom-kebab-case].html`
6. Pousser sur GitHub → déploiement automatique sur Cloudflare

---

## Sujets prévus

- [x] Le Sommeil & votre récupération
- [ ] La Posture au bureau
- [ ] La Respiration & performance
- [ ] La Nutrition & récupération sportive
- [ ] La Gestion de la douleur chronique
- [ ] Le Retour au sport après blessure
- [ ] La Prévention des blessures du genou
- [ ] La Lombalgie : comprendre & agir
