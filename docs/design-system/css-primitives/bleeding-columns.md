# Bleeding Columns

## Problem

> See: [columns](./columns.md)

A common requirement in editorial and CMS-driven layouts is allowing certain elements to visually extend beyond the main column boundaries, appearing to "bleed" into what feels like container padding or even full-bleed space.

On the web, this is often handled with negative margins, wrappers, or special-case logic. These approaches are fragile, difficult to reason about, and frequently rely on fixed widths or redeployments when content characteristics change. They also make it hard to decide dynamically—at runtime—whether an element should bleed or not.

## Solution
Instead of treating padding as an external concern, the column system itself can model it explicitly. Rather than defining n columns, the grid defines n + 2 columns, where the first and last columns act as lateral padding columns. Elements can then choose whether to span only the inner columns or include the padding columns, without breaking the column rules defined by the container.


## Implementation details

The base `.columns-container` already prepares the structure for this by reserving space for `--lat-pad` and subtracting 2 from the column count into `--real-columns`. When `.bleeding-columns` is NOT applied, those values have no effect — the subtraction is there but `.bleeding-columns` is what activates it by setting `--lat-pad` and overriding `--real-columns` back to the full column count.

<!-- TODO: add zones to css gird template to make them logical -->

```css
.columns-container {
  display: grid;

  grid-template-columns: var(--c-clat-pad, ) repeat(var(--c-c-real-columns), 1fr) var(--c-clat-pad, );
  column-gap: var(--c-c-gap, 0px);
  row-gap: var(--c-c-gap);
}

/* Opt-in: activates the lateral padding columns */
.bleeding-columns {
  --c-clat-pad: calc(var(--c-c-padding) - var(--c-c-gap, 0px));
  --c-c-real-columns: calc(var(--c-c-columns) - 2);
}
```