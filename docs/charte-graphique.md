# Charte graphique — Livrets Patients

## Couleurs

| Variable CSS | Hex | Usage |
|---|---|---|
| `--color-primary` | `#4A7FB5` | Titres, boutons, accents principaux |
| `--color-secondary` | `#7DB89B` | Encadrés verts, étapes, validation |
| `--color-bg` | `#FAF8F5` | Fond crème des pages |
| `--color-accent-warm` | `#E07B54` | Alertes, attention, accents chaleureux |
| `--color-accent-soft` | `#F2D07A` | Citations, surlignages doux |
| `--color-text` | `#2E2E2E` | Texte courant |
| `--color-text-light` | `#7A7A7A` | Sous-titres, footers, notes |

## Typographie

| Famille | Usage | Taille |
|---|---|---|
| Playfair Display | Titres h1, h2, h3 | h1: 22pt · h2: 14pt · h3: 11pt |
| Lato | Corps de texte | 10pt, line-height 1.5 |
| Caveat | Citations, signatures manuscrites | 12pt |

## Composants

### Encadrés
- `.box-retenir` — bleu, border gauche → informations clés à mémoriser
- `.box-attention` — orange, border gauche → mises en garde
- `.box-exemple` — vert, border gauche → exemples concrets
- `.box-citation` — jaune doux, guillemets → citations de patients ou experts

### Listes numérotées `.steps`
Cercles colorés avec numéro. Variantes : `.step-number` (bleu) · `.step-number.green` · `.step-number.warm`

### Grilles
- `.two-col` — 2 colonnes flexbox, gap 5mm
- `.three-col` — 3 colonnes flexbox, gap 4mm

### Badges
- `.badge.badge-blue` — bleu primaire
- `.badge.badge-green` — vert secondaire
- `.badge.badge-warm` — orange chaleureux

### Séparateurs
- `.divider` — ligne dégradée bleue
- `.divider-wave` — ligne ondulée SVG bleue

## Format de page

```
┌─────────────────────────┐  ← 148mm
│  padding-top: 8mm       │
│  ┌───────────────────┐  │
│  │                   │  │
│  │    CONTENU        │  │
│  │                   │  │
│  └───────────────────┘  │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │  ← 19mm réservés footer
│  [footer ─────── n°]    │  ← bottom: 25px
└─────────────────────────┘
        210mm
```

Hauteur utile de contenu : **692px à 96dpi** (ne jamais dépasser)

## Illustrations SVG

Toujours inline dans le HTML. Jamais d'images externes.

Dimensions recommandées :
- Grande illustration de couverture : 180×120px
- Illustration de page intérieure : 130×100px
- Icône décorative : 60×60px

Couleurs SVG à utiliser : `#4A7FB5` (primaire) · `#7DB89B` (secondaire) · `#E07B54` (chaud) · `#F2D07A` (doux)
