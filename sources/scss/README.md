# SASS

## style.scss

C'est le point d'entrée, la feuille de style principale `style.css` est généré à
partir ce ce fichier.


## Grilles

Aucune grille par défaut n'est définie. Le module susy est utilisé pour créer
des grilles sur mesure.


***

## Mixins

### Layout

#### Clearfix

```sass
@include clearfix;
```

#### Absolute positionning

Add absolute positioning, full-size of first relative parent.

```sass
@include absolute-full;
```


#### Spread block to window's edges.

```sass
@include full-width;
```


#### Maintain iframes/objects ratio.

```sass
@include ratio-wrap(9/16);
```


### Content

#### Hide text (for screen readers)

```sass
@include hide-text;
```


#### Text wrap

The margin-top of the first element & the margin-bottom of the last one are
removed.

```sass
@include text-wrap;
```


#### Text overflow

Add '...' after text  (1 line only).

```sass
@include text-overflow;
```



### FX

#### Définir un effet de survol (et/ou focus).

```sass
@include hover {};
@include focus {};
```


#### Soulignement des liens

```sass
@include underline;
@include underline('inv');
```


