# Base SSG Framework

This is an implementation **local first** very opionated to explore the ideas exposed in the current documentation

## `pages` directory

The framework is path based, this means, that every HTML document created inside the `pages` directory will be rendered as a page.

For example

```
src/
  pages/
    index.html
    about.html
    carrers/
      index.html
```

will generate

```
/index.html
/about.html
/carrers/index.html
```

The HTML documents can include valid `DINOMLX`, please refer to the [templating section](../templating/language.md) to know more about 

## `templates` directory

If no `_c_template-src` is used in the custom component, by default the name of the component will be used as a relative path from templates, for example:

```xml
<c-navbar />
<c-atoms-button>Hello</c-atoms-button>
```
Will have

```
src/
  templates/
    navbar.html
    atoms/
      button.html
```

## `candidates` directory

Will have four directories, each for a layer.

The name of the directory will be the name of the candidate

```
src/
  candidadates/
    utils/
      critical.css
      deferable.css
      util-1/
        critical.css
        deferable.css
    global/
    layout/
    components/
      button$/
        critical.css
        deferable.css
        primary/
          critical.css
          deferable.css
        secondary/
          critical.css
```

Each CSS file is optional.

The CSS files that are inmediat to the layer directory like `utils/critical.css` is to define several candidates and the sub-directories like `utils/util-1` are for granular definitions, both are valid, just different wyas to define.

Sub-directories that end in `$` are designed to contain a **semantic field**

```css
[class^=button]{
  /* Shared sytles across all buttons */
}
```

Sub directories of semantic fields SHOULD create composed names like `button-primary`




