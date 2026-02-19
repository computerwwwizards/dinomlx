# Intermediate Representation (IR)

The DINOMLX compiler transforms source templates into a structured Intermediate Representation (IR) before generating the final HTML and CSS. This IR is stored as JSON files, enabling inspection and decoupling the compilation phases.

## Directory Structure

The IR is typically stored in the `.dinomlx/ir` or `dist/ir` directory (depending on configuration) and mirrors the source structure:

```
ir/
  pages/
    index.json
    about.json
  templates/
    navbar.html
    navbar.candidates.json
    atoms_primary-button.html
    atoms_primary-button.candidates.json
```

## Page IR (`pages/*.json`)

The Page IR represents a fully resolved page, including its component tree, data, and localization strings.

### Schema

```json
{
  "data": {
    "hash_index": {
      "slots": {
        "head": "<title>$i18n#{hash_title}</title>",
        "body": "$#{hash_index_navbar}<h1>Hello</h1>"
      },
      "attributes": {},
      "custom_attributes": {}
    }
  },
  "i18n": {
    "hash_title": {
      "spanish": "Principal",
      "english": "Home"
    }
  },
  "above_the_fold": {
    "own_candidates": [],
    "external_refs": "$#{hash_index_navbar}"
  }
}
```

### Fields

*   **`data`**: A map of component instances identified by a unique hash (e.g., `hash_index`).
    *   **`slots`**: Contains the HTML content for each slot. This HTML may contain references to other components (`$#{hash_...}`) or localization keys (`$i18n#{hash_...}`).
    *   **`attributes`**: Standard HTML attributes for the component root.
    *   **`custom_attributes`**: Framework-specific attributes (starting with `_c_`).
*   **`i18n`**: A dictionary of localized strings used in the page.
    *   Keys are hashes (e.g., `hash_title`).
    *   Values are objects mapping language codes to strings.
*   **`above_the_fold`**: Critical for CSS optimization.
    *   **`own_candidates`**: CSS candidates used directly by the page template.
    *   **`external_refs`**: References to components that are visible above the fold. The compiler traces these references to extract their Critical CSS.

## Template IR

Templates are compiled into two parts: the raw HTML structure and the CSS candidates they use.

### Candidates JSON (`templates/*.candidates.json`)

This file lists all CSS candidates (classes) used by a specific template.

```json
{
  "candidates": ["button-primary", "flex", "text-center"]
}
```

### Template HTML (`templates/*.html`)

The raw HTML of the component, often with placeholders for slots or dynamic content.

```html
<nav>
  <ul class="flex">
    <li class="button-primary">Home</li>
  </ul>
</nav>
```

## Contract & Usage

The IR serves as the contract between the parsing phase and the code generation phase.

1.  **Parsing**: Source files are parsed to identify components, candidates, and dynamic content.
2.  **Resolution**: References are resolved to hashes.
3.  **Optimization**: The `above_the_fold` data is calculated to determine which CSS is critical.
4.  **Generation**: The final HTML is constructed by replacing hashes with actual content and injecting the critical CSS.
