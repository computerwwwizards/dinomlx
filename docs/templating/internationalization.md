# Internationalization (i18n)

DINOMLX treats localization as a first-class citizen in the compilation pipeline. Instead of relying on heavy runtime libraries, it compiles localized strings directly into the final HTML (or optimized hydration scripts).

## Configuration

To enable localization, your project root must have a configuration file (e.g., `dinomlx.config.json` or `package.json`) defining the supported languages.

*Note: In the current experimental version, languages are often inferred directly from usage if not explicitly configured.*

## Syntax

Localization is handled via dedicated tags in your templates. The compiler identifies these tags and extracts the content into the Intermediate Representation (IR).

### Defining Localized Strings

Use the `<i18n-[key]>` tag to define a localized block. Inside, use `<i-[lang]>` tags to provide the content for each language.

```html
<!-- Example: A welcome message -->
<i18n-welcome-message>
  <i-english>Welcome to our website!</i-english>
  <i-spanish>¡Bienvenido a nuestro sitio web!</i-spanish>
  <i-french>Bienvenue sur notre site web !</i-french>
</i18n-welcome-message>
```

### Compiler Inference

The compiler parses this structure and infers:

1.  **Key**: `welcome-message` (derived from the tag name suffix).
2.  **Languages**: `english`, `spanish`, `french` (derived from the inner tag suffixes).
3.  **Values**: The content inside each `<i-[lang]>` tag.

### IR Output

This structure is transformed into a dictionary in the Page IR:

```json
"i18n": {
  "hash_welcome_message": {
    "english": "Welcome to our website!",
    "spanish": "¡Bienvenido a nuestro sitio web!",
    "french": "Bienvenue sur notre site web !"
  }
}
```

And the HTML slot is replaced with a placeholder: `$i18n#{hash_welcome_message}`.

## Usage in Components

You can use i18n tags anywhere inside a component or page, including inside slots passed to other components.

```html
<c-card>
  <c-slot-title>
    <i18n-card-title>
      <i-english>My Card</i-english>
      <i-spanish>Mi Tarjeta</i-spanish>
    </i18n-card-title>
  </c-slot-title>
</c-card>
```

## Best Practices

*   **Semantic Keys**: Use descriptive keys (like `welcome-message`, `card-title`) to make the IR and debugging easier.
*   **Consistency**: Ensure you provide translations for all supported languages defined in your project configuration.
