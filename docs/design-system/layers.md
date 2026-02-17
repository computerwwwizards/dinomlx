# Layers

## Problem

In modern CSS architecture it is common to rely primarily on class selectors to avoid specificity escalation. Systems like BEM popularized the idea that keeping selectors at a predictable specificity level (typically `0,1,0`) makes styles easier to reason about and override. When every rule has the same specificity, you avoid “specificity wars” and reduce surprises about where a style is coming from.

> **What are “specificity wars”?**
> Specificity wars happen when developers start increasing selector specificity to force overrides. For example, a simple class (`.button`) becomes `.card .button`, then `body .layout .card .button`, and eventually includes IDs or `!important`. Each step makes the selector harder to override later. Over time, the cascade becomes fragile: small changes require even more specificity, and reasoning about why a style wins becomes difficult.

However, even when all selectors share the same specificity, conflicts still occur.

Consider the following example:

```css
.text-color-red-500 {
  color: #fa1122;
}

.button--primary {
  /* Some properties */
  color: white;
}
```

```html
<button
  class="button--primary text-color-red-500"
>
  Hello
</button>
```

Both selectors have the same specificity (`0,1,0`). When specificity is equal, the browser resolves conflicts using source order: the rule that appears last in the final CSS wins.

In this case, if `.button--primary` is declared after `.text-color-red-500`, the button text will be white, not red — even though `.text-color-red-500` is meant to be an atomic utility whose purpose is to override color.

To fix this using traditional approaches, you would need to change the order:

```css
.button--primary {
  /* Some properties */
  color: white;
}

.text-color-red-500 {
  color: #fa1122;
}
```

But in real projects, CSS is often composed through preprocessors, bundlers, or multiple entry points. Controlling final source order can be inconvenient or unreliable.

Another historical solution has been to use `!important`. While this guarantees precedence, it introduces a new layer of complexity. Once `!important` is introduced, further overrides require additional `!important` declarations or higher specificity, making the cascade harder to predict and reason about.

The core issue is this:

When two declarations have the same specificity, we need a predictable and structural way to decide which one wins — without relying on file order or `!important`.

## Solution

Architectures like ITCSS organize styles into conceptual layers, typically moving from generic to specific. Historically, many implementations increased selector specificity to enforce this hierarchy.

Modern CSS provides a structural alternative: the `@layer` at‑rule.

With `@layer`, precedence is no longer determined only by source order. Instead, it is determined by the declared order of layers. When two declarations have the same specificity and compete for the same property, the declaration in the layer with higher precedence wins — regardless of where it appears in the file.

This does not remove specificity from the cascade. It reorganizes cascade order at a higher structural level.

Revisiting the previous example:

```css
@layer components, utils;

@layer utils {
  .text-color-red-500 {
    color: #fa1122;
  }
}

@layer components {
  .button--primary {
    /* Some properties */
    color: white;
  }
}
```

Even though both selectors have the same specificity and target the same property (`color`), the declaration inside `utils` wins because the `utils` layer has higher precedence than `components`.

The order inside the file no longer matters. Layer precedence defines the outcome.

## Implementation

### Layer precedence

In the libraries I am building, I strongly suggest defining four explicit layers, ordered from lowest to highest precedence:

`global < layout < components < utils`

The declaration order SHOULD be defined once at the root of your CSS architecture:

```css
@layer global, layout, components, utils;
```

From this point forward, precedence between equally specific selectors SHOULD be controlled exclusively by layer position — not by source order manipulation or `!important`.

### Utils

The `utils` layer contains atomic utilities.

Utilities are single‑purpose classes that modify one property or a small, tightly scoped group of properties. Examples include:

```css
@layer utils {
  .text-color-red-500 { color: #fa1122; }
  .margin-top-16 { margin-top: 16px; }
  .display-flex { display: flex; }
}
```

Utilities are intentionally designed to override component styles when both share the same specificity. By placing them in the highest‑precedence layer, overrides remain predictable without increasing specificity or using `!important`. In these libraries, utilities SHOULD NOT escalate specificity beyond class selectors.

### Components

The `components` layer contains reusable component styles.

Components define the default appearance of UI elements:

```css
@layer components {
  .button--primary {
    padding: 8px 16px;
    background: blue;
    color: white;
  }
}
```

Component selectors SHOULD maintain consistent specificity (typically class‑only) to preserve override flexibility. Components provide defaults; utilities refine them.

### Layout

The `layout` layer contains layout primitives and structural abstractions.

These may include grid systems, stack primitives, container abstractions, or spacing patterns that define spatial relationships but not visual theming.

Example:

```css
@layer layout {
  .stack {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
}
```

Layout styles should not compete with component styling concerns like color or typography. Their responsibility is structural.

### Global

The `global` layer contains resets, element selectors, and global defaults.

Examples include:

```css
@layer global {
  *, *::before, *::after {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    font-family: system-ui, sans-serif;
  }
}
```

Because `global` has the lowest precedence, its styles can be safely overridden by layout, component, or utility classes.

---

By structuring styles into explicit cascade layers, we preserve low and predictable specificity while gaining deterministic override behavior. The result is a system where overrides are intentional, structural, and independent of source order.
