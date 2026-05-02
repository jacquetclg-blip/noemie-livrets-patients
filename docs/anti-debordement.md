# Règles anti-débordement

Le problème le plus fréquent : le contenu dépasse le bas de la page et passe sous le footer.

## Règle d'or

Hauteur utile maximum : **741px à 96dpi** (soit ~196mm) pour le print.
Au-delà, le contenu chevauche le footer ou est coupé par `overflow: hidden`.

> Le `padding-bottom: 19mm` réserve la zone footer (`bottom: 25px` + hauteur footer ~15px).
> En preview écran, `@media screen` passe la page en `height: auto; padding-bottom: 40px` — plus de grand espace vide sous le contenu.

## Vérification rapide

Coller ce code dans la console du navigateur (F12 → Console) :

```javascript
(() => {
  const pages = document.querySelectorAll('.page');
  const r = [];
  pages.forEach((p, i) => {
    p.style.overflow = 'visible';
    const s = getComputedStyle(p);
    const pt = parseFloat(s.paddingTop);
    const pb = parseFloat(s.paddingBottom);
    const ih = p.offsetHeight - pt - pb;
    const ov = p.scrollHeight - pt - pb - ih;
    p.style.overflow = 'hidden';
    if (ov > 1) r.push('Page ' + (i+1) + ': +' + Math.round(ov) + 'px');
  });
  return r.length ? r : 'ALL 20 PAGES OK ✓';
})()
```

Résultat attendu : `"ALL 20 PAGES OK ✓"`

## Corrections par ordre de priorité

Si une page déborde, corriger dans cet ordre :

1. **Réduire les SVG** — diminuer `height` et `viewBox`
2. **Réduire les marges des titres** — `margin-bottom: 1mm` minimum
3. **Réduire le padding des box** — minimum `1.5mm 2.5mm`
4. **Réduire la font-size des tableaux** — minimum `6.5pt`
5. **Fusionner des lignes** dans les tableaux
6. **Passer en 2 colonnes** si 4 blocs verticaux
7. **Abréger les en-têtes de tableau** (ex: Lundi → L)
8. **Compresser les paragraphes** — supprimer les répétitions

## Valeurs minimales à respecter

| Élément | Minimum |
|---|---|
| `margin-bottom` h2/h3 | 1mm |
| `padding` box | 1.5mm 2.5mm |
| `font-size` tableau | 6.5pt |
| `font-size` source-table | 6pt |
| `gap` dans `.steps li` | 1.5mm |
| `margin-bottom` `.steps li` | 1mm |

## Exemples de débordements fréquents

**SVG trop haut** → réduire de 140px à 100px
**Tableau avec 8 lignes** → fusionner en 6 lignes ou passer en 2 colonnes
**4 box `.box-retenir` empilées** → passer en grille 2×2
**Texte trop dense** → réduire `line-height` de 1.5 à 1.35
