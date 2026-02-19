# CSS Best Practices

## 1. CSS Primitives & Layout Builders

We encourage implementers to create layout builders that map to visual code. For example, a visual drag-and-drop builder can generate HTML with predefined layout components like:

*   **STACK**: Vertical/Horizontal stacking of elements.
*   **BLEED**: Elements that extend outside their container.
*   **BOX**: Standard container.
*   **GRID**: Grid layout system.

See [CSS Primitives](./css-primitives/index.md) for more details.

## 2. Distributed CSS Management

CSS MUST be built around a data source according to the selectors, referred to as **CANDIDATES**. This means a template can have meta information about what candidates are being used to avoid duplicating CSS.

To solve the "Util First Byte" problem (where repeated utility classes bloat the HTML), implementers SHOULD use a central system or well-designed distributed one that acts as a single source of truth for the final CSS result. We suggest using ideas like Design Systems, UI Kits, and Design Tokens.

For a deeper dive into the architectural protocol, see [Distributed CSS Management](../architecture/distributed-css-management.md).

### Governance

When multiple teams contribute to a system, semantic naming becomes crucial.

*   **Semantic Fields**: Encourage semantic class names over pure utility classes for reusable components.
    ```css
    /* Good */
    .button--primary { ... }

    /* Avoid for components */
    .bg-red-500.p-4.rounded { ... }
    ```
*   **Shared Styles**: Use a base class for shared properties to reduce bundle size.
    ```css
    [class^="button"] {
      /* Shared styles */
      padding: 0.5rem 1rem;
      border: none;
    }
    .button-primary {
      background-color: var(--color-primary);
    }
    ```

## 3. Performance Guidelines

### Critical CSS

*   **Inline**: Critical CSS MUST be inlined into the internal `<style>` tag in the `<head>`.
*   **Budget**: Critical CSS MUST not exceed **4KB** (total size) and SHOULD be below **2KB**.
*   **Scope**: Only CSS affecting content "Above the Fold" should be considered critical.

### Deferable CSS

*   CSS for below-the-fold content or interactive states (like `:hover`) SHOULD be loaded asynchronously to avoid blocking the initial render.

## 4. Size Budgets

Teams should establish size budgets for HTML and CSS. Tools should be implemented to audit these budgets and suggest optimizations (e.g., abstracting repeated utility classes into a component class).
