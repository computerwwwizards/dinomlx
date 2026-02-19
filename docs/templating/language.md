# Templating Language (DINOMLX)

## Syntax

DINOMLX templates are based on valid HTML5, extended with custom components, directives, and variable interpolation.

### Custom Components

Custom components MUST start with a `c-` prefix.

```html
<c-navbar />
<c-button>Click me</c-button>
```

#### Reserved Names
*   `c-tag`: Generic custom tag.
*   `c-slot`: Slot placeholder.
*   `c-slot-[name]`: Named slot.
*   `c-above-the-fold`: Marks content as critical for initial render.
*   `g-deferable-css-external`: Global directive for deferable CSS link injection.
*   `g-critical-css`: Global directive for Critical CSS injection.
*   `i18n`: Directive for localization.

### Attributes

Framework-specific attributes MUST start with `_c_`.

*   `_c_name`: Required when using `<c-tag>` to specify the component name.
*   `_c_template-src`: Path to the template source.
*   `_c_version`: Semantic version of the component.

Example:
```html
<c-tag _c_name="custom-tag-name" _c_version="1.0.0" />
```

### Variables

Variables are interpolated using `{{ }}` syntax or referenced in attributes with a leading `$`.

```html
<div class="{{ data.className }}">
  {{ data.title }}
</div>

<html lang="$global.lang">
```

### Global Variables (`$`)

*   `$global.lang`: Current language code.
*   `$root`: Application root path.
*   `$cwd`: Current working directory.
*   `$page`: Current page metadata (`id`, `name`).
*   `$component`: Current component metadata (`id`, `name`).
*   `$env`: Environment (e.g., `production`).
*   `$config`: Application configuration (client-safe subset).

## Directives

### Loops (`<for>`, `<loop>`)

Iterate over collections or ranges.

```html
<for items="$data.items" as="item">
  <li>{{ item.name }}</li>
</for>
```

### Conditionals (`<if>`)

Render content conditionally.

```html
<if condition="$data.showWarning">
  <div class="warning">Warning!</div>
</if>
```

## Roadmap

- [ ] Named slots support
- [ ] `<c-above-the-fold />` full implementation
- [ ] `elif` / `else` for conditionals
- [ ] Improved module resolution (e.g., `template-name.html` vs `template/name.html`)
