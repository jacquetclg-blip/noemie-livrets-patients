# Workflow de création d'un livret

## Vue d'ensemble

```
1. create-livret.js  →  HTML généré + preview en ligne  →  tu valides
2. finalize-livret.js  →  PDF A5 + Notion mis à jour  →  terminé
```

---

## Étape 1 — Création HTML + preview

```bash
node scripts/create-livret.js "Titre du livret" nom-fichier
```

**Ce que ça fait :**
- Appelle Claude Opus pour générer les 20 pages HTML
- Vérifie que le nombre de pages est bien 20
- Pousse sur GitHub → Cloudflare déploie automatiquement (~30 secondes)
- Affiche l'URL de preview

**Exemple :**
```bash
node scripts/create-livret.js "La posture au bureau" posture-bureau
```

**URL de preview :**
```
https://livret.pages.dev/livrets/posture-bureau.html
```

Tu révises le livret. Quand tu valides, passe à l'étape 2.

---

## Étape 2 — PDF + Notion

```bash
node scripts/finalize-livret.js nom-fichier
```

**Ce que ça fait :**
- Convertit le HTML en PDF A5 via Chrome (marges 3mm)
- Vérifie que le nombre de pages est pair (20)
- Pousse le PDF sur GitHub → disponible en ligne
- Met à jour Notion : statut "Terminé" + liens HTML et PDF dans la page

**Exemple :**
```bash
node scripts/finalize-livret.js posture-bureau
```

**Résultat dans Notion :**
- Statut → Terminé
- Lien HTML (preview navigateur)
- Lien PDF (téléchargement impression)

---

## Variables d'environnement (.env)

Fichier `.env` à la racine du projet (jamais versionné) :

```
ANTHROPIC_API_KEY=sk-ant-api03-...
NOTION_TOKEN=secret_...
```

- **ANTHROPIC_API_KEY** : sur console.anthropic.com
- **NOTION_TOKEN** : sur notion.so/my-integrations (créer une intégration + l'autoriser sur la page "Livrets")

---

## Format de sortie PDF

| Paramètre | Valeur |
|---|---|
| Format | A5 exact (148×210mm) |
| Marges de sécurité | 3mm (@page margin: 3mm) |
| Pages | Exactement 20 (nombre pair — recto-verso) |
| Fond perdu | Non (format final patient) |

---

## Nommage des fichiers

Format : `kebab-case` uniquement (lettres minuscules, chiffres, tirets)

| Livret | Nom de fichier |
|---|---|
| Le Sommeil & votre récupération | `sommeil-recuperation` |
| La Posture au bureau | `posture-bureau` |
| La Lombalgie | `lombalgie` |
| Arthrose — Genou | `arthrose-genou` |
| Tendinopathie — Achille | `tendinopathie-achille` |

---

## URLs finales

```
HTML  : https://livret.pages.dev/livrets/[nom-fichier].html
PDF   : https://livret.pages.dev/livrets/[nom-fichier].pdf
```
