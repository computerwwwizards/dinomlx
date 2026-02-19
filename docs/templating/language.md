# Templating Language (DINOMLX)

## Syntax

DINOMLX templates are based on valid HTML5, extended with custom components, directives, and variable interpolation.

### Custom Components

Custom components MUST start with a `c-` prefix.

```html
<c-navbar />
<c-button>Click me</c-button>
```

#### Component Resolution (Subdirectories)
When resolving components from subdirectories, directory separators (`/`) are replaced by underscores (`_`) in the tag name.

**Example:**
*   Source: `src/templates/atoms/button-primary.html`
*   Usage: `<c-atoms_button-primary>`

#### Reserved Names
*   `c-tag`: Generic custom tag.
*   `c-slot`: Default slot placeholder.
*   `c-slot-[name]`: Named slot.
*   `c-above-the-fold`: Marks content as critical for initial render.
*   `g-deferable-css-external`: Global directive for deferable CSS link injection.
*   `g-critical-css`: Global directive for Critical CSS injection.
*   `i18n`: Directive for localization.
*   `i18n-[name]`: Localization key container.
*   `i-[lang]`: Localization language content.

### Slots

DINOMLX supports both default and named slots for passing content into components.

#### Default Slot
Pass content directly inside the component tag.

```html
<!-- Parent -->
<c-card>This is the default content</c-card>

<!-- Component (c-card) -->
<div class="card">
  <c-slot />
</div>
```

#### Named Slots
Use `<c-slot-[name]>` to target specific areas in the component.

```html
<!-- Parent -->
<c-layout>
  <c-slot-header>
    <h1>Page Title</h1>
  </c-slot-header>
  <c-slot-content>
    <p>Main body content.</p>
  </c-slot-content>
</c-layout>
```

### Attributes

Framework-specific attributes MUST start with `_c_`.

*   `_c_name`: Required when using `<c-tag>` to specify the component name.
*   `_c_template-src`: Path to the template source.
*   `_c_version`: Semantic version of the component.

#### Spread Attributes
Properties can be spread into a component or element automatically by the transformer context. Unlike custom attributes, this happens without explicit syntax in the template.

```html
<!-- Attributes passed to the component context are automatically applied -->
<div class="my-component"></div>
```

### Internalization (i18n)

Localization is handled via dedicated tags that the compiler identifies and extracts.

```html
<i18n-welcome-message>
  <i-english>Welcome!</i-english>
  <i-spanish>¡Bienvenido!</i-spanish>
</i18n-welcome-message>
```

The compiler infers:
*   `welcome-message` as the localization key.
*   `english` and `spanish` as the language codes.

### Data & Variables

DINOMLX uses a consistent tag-based syntax for outputting dynamic data and a dollar-sign syntax for attribute interpolation. **Mustache syntax (`{{ }}`) is NOT used.**

#### Text Interpolation (`<d-[variable] />`)
To output the value of a variable into the text content, use the `<d-[variable] />` tag, where `d` stands for "data".

```html
<!-- Renders the value of 'data.title' -->
<h1><d-data.title /></h1>

<!-- Renders nested properties -->
<p>User: <d-user.name /></p>
```

#### Attribute Interpolation (`$variable`)
To bind a variable to an attribute, use the `$` prefix within the attribute string.

```html
<div class="$data.className" id="$data.id">
  Content
</div>

<a href="$item.url">Link</a>
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
  <li><d-item.name /></li>
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

- [ ] Add support for `slots`
- [ ] Add suport for named slots
- [ ] Add support for `<c-above-the-fold />`
- [ ] Add support for `for  of` and `loop`
- [ ] Add support for `if`, `else`, `elif`
- [ ] Expand explanation of the custom attributes
- [ ] Add suport for inline `if else`
- [ ] Add better resolution for `tempalte-name.html` vs `template/name.html`
- [ ] Add way to diferntiate bettwen using the `c-slot` vs defining it !urgent
- [ ] Add way to repsent what candidates are above the fold for specif pages paths
