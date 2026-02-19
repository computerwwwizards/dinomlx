# Columns
<!-- TODO: add patterns using fractions adn thee reason why items shoudl have acces to the variable to make calcs -->
## Problem

In modern web development, column systems are common in design tools. They provide standardized boundaries for how much space an item can occupy without fixing its width. Translating this way of thinking into CSS has historically been awkward and often required clever hacks (for example, early Bootstrap grid systems). Modern CSS Grid has largely solved the mechanics of column layouts.

However, a second problem remains. Traditional CSS libraries usually ship a large, predefined set of classes covering column counts, breakpoints, and variations. Even with purging tools, these classes are generated at build time. This makes server-driven or runtime configuration feel heavy and inflexible, and it often results in shipping more CSS than necessary.

A related issue is awareness: descendants of a column container typically cannot know how many columns exist or what the gap is, which limits adaptive behavior inside the layout.

## Web solution
Modern CSS custom properties are now widely supported and can be used as runtime configuration carriers. Because they are scoped, they naturally bind configuration (such as column count or gaps) to a container and make that information available to all its descendants.

This enables a column system that is configurable at runtime, media-query-aware, and observable from within the layout itself—without relying on build-time class generation.


## Blueprint

- It MUST allow specifying the number of columns.

- Its children MUST be able to know the number of columns of the container.

- The number of columns MUST be overridable inside media queries.

- The column gap dimension MUST be available in the scope of its children.

## Implementation suggestions

The column container exposes its structural parameters as CSS custom properties. This allows the layout to be configured at runtime while keeping the CSS surface minimal, while also making those parameters observable by descendants.

```css
:scope {
  --c-c-columns: 8;
  --c-c-gap: 5px;
}

.columns-container {
  display: grid;
  grid-template-columns: repeat(var(--c-c-columns), 1fr);
  column-gap: var(--c-c-gap, 0px);
}
```

## Related

- Bleeding Columns