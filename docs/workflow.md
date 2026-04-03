# Workflow de création d'un livret

## Vue d'ensemble

```
1. Claude Code (chat)  →  génère + vérifie le HTML  →  push GitHub
2. Tu révises le preview en ligne
3. Tu valides  →  finalize-livret.js  →  PDF + Notion
```

---

## Étape 1 — Génération HTML (dans le chat Claude Code)

Demande à Claude de créer le livret. Il génère le HTML, vérifie les 20 pages, corrige les débordements, puis pousse sur GitHub.

L'URL de preview est disponible automatiquement :
```
https://livret.pages.dev/livrets/[nom-fichier].html
```

---

## Étape 2 — Finalisation PDF + Notion

Une fois que tu valides le preview, une seule commande :

```bash
node scripts/finalize-livret.js nom-fichier
```

**Ce que ça fait :**
- Convertit le HTML en PDF A5 (148×210mm, marges sécurité 3mm) via Chrome
- Vérifie que le nombre de pages est pair (idéalement 20)
- Pousse le PDF sur GitHub → disponible en ligne
- Met à jour Notion : statut "Terminé" + liens HTML et PDF dans la page

**Exemple :**
```bash
node scripts/finalize-livret.js posture-bureau
```

---

## Variable d'environnement (.env)

Fichier `.env` à la racine du projet (jamais versionné) :

```
NOTION_TOKEN=secret_...
```

Obtenir le token : **notion.so/my-integrations** → Créer une intégration → Copier le token → Autoriser l'intégration sur la page "Livrets" dans Notion.

---

## Format PDF

| Paramètre | Valeur |
|---|---|
| Format | A5 exact (148×210mm) |
| Marges de sécurité | 3mm |
| Pages | 20 (nombre pair — recto-verso) |

---

## URLs finales

```
HTML  : https://livret.pages.dev/livrets/[nom-fichier].html
PDF   : https://livret.pages.dev/livrets/[nom-fichier].pdf
```

---

## Nommage des fichiers

| Livret | Nom de fichier |
|---|---|
| Le Sommeil & votre récupération | `sommeil-recuperation` |
| La Posture au bureau | `posture-bureau` |
| Arthrose — Genou | `arthrose-genou` |
| Tendinopathie — Achille | `tendinopathie-achille` |
| Drainage lymphatique | `drainage-lymphatique` |
