# DINOMLX SSG CLI

Static Site Generator with file-based routing, custom component templating, and candidate-based CSS with critical CSS inlining.

## Quick Start

Create a minimal project structure:

```
my-site/
  src/
    pages/
      index.html
    templates/
      navbar.html
    candidates/
      global/
      layout/
      components/
      utils/
        text-red/
          critical.css
    above-the-fold.html
```

Run the build:

```bash
dinomlx build --src-root my-site/src
```

Output is written to `dist/` by default.

## Build Command

```bash
dinomlx build [options]
```

| Option | Default | Description |
|---|---|---|
| `--src-root` | `src` | Path to source files |
| `--out-dir` | `dist` | Output directory for generated static assets |
| `--cache-dir` | `.dinomlx/cache` | Directory for cache compilation data |
| `--base-path` | (empty) | Path prefix for assets (e.g. `/my-blog`) |

## File-Based Routing

HTML files in `src/pages/` map directly to output paths:

```
src/pages/index.html   -> dist/index.html
src/pages/about.html   -> dist/about.html
src/pages/blog/post.html -> dist/blog/post.html
```

## Custom Components

Use `<c-*>` elements in your HTML to include reusable templates. Templates live in `src/templates/`.

### Naming Convention

Component names map to template paths by converting hyphens to directories, with the last segment as the filename:

| Component | Template Path |
|---|---|
| `<c-navbar>` | `src/templates/navbar.html` |
| `<c-atoms-button>` | `src/templates/atoms/button.html` |
| `<c-ui-cards-hero>` | `src/templates/ui/cards/hero.html` |

### Example

**`src/pages/index.html`:**
```html
<html>
<head><title>Home</title></head>
<body>
  <c-navbar></c-navbar>
  <main><h1>Welcome</h1></main>
</body>
</html>
```

**`src/templates/navbar.html`:**
```html
<nav>
  <a href="/">Home</a>
  <a href="/about">About</a>
</nav>
```

Components are expanded recursively — a template can include other `<c-*>` components. Circular references are detected and produce an error.

## CSS Candidates

CSS is organized into candidates — named directories under `src/candidates/` grouped by CSS layer:

```
src/candidates/
  global/       -> @layer global
  layout/       -> @layer layout
  components/   -> @layer components
  utils/        -> @layer utils
```

Each candidate is a directory containing optional `critical.css` and/or `non-critical.css`:

```
src/candidates/components/btn-primary/
  critical.css        # Inlined in <style> for above-the-fold content
  non-critical.css    # Loaded asynchronously via external stylesheet
```

Candidates are included in the output only when their name appears as a CSS class in the expanded HTML. CSS is wrapped in `@layer` declarations following the layer order: `global, layout, components, utils`.

## Critical CSS

Create `src/above-the-fold.html` containing the HTML structure visible on initial page load. This file can use `<c-*>` components like any page.

Candidates used in `above-the-fold.html` have their `critical.css` inlined in a `<style>` tag in the page `<head>`. All other CSS is loaded via an external `styles.css` file with a preload pattern.

### CSS Budget

- **> 2KB**: Info message during build
- **> 4KB**: Warning message during build

If `above-the-fold.html` is missing, all CSS is treated as non-critical and loaded externally.

## Placeholders

Use these placeholders in your page HTML to control CSS injection:

- `$#critical-css` — replaced with `<style>...</style>` containing critical CSS
- `$#non-critical-css` — replaced with `<link rel="preload" ...>` for the external stylesheet

```html
<head>
  <title>My Page</title>
  $#critical-css
  $#non-critical-css
</head>
```

If placeholders are absent but CSS exists, they are auto-injected before `</head>`.

## Running Tests

```bash
pnpm --filter dinomlx test
```

Tests are co-located with source files (`*.test.ts`). Integration tests use the fixture at `tests/fixtures/basic-site/`.

## Example Project

See `tests/fixtures/basic-site/` for a working reference project with:

- Two pages (`index.html`, `about.html`)
- Component templates (`navbar.html`, `atoms/button.html`)
- CSS candidates (`text-red`, `btn-primary`)
- Above-the-fold definition

### Running the example

From the monorepo root:

```bash
npx tsx packages/dinomlx/src/index.ts build \
  --src-root packages/dinomlx/tests/fixtures/basic-site/src \
  --out-dir /tmp/basic-site-output
```

Or from `packages/dinomlx/`:

```bash
npx tsx src/index.ts build \
  --src-root tests/fixtures/basic-site/src \
  --out-dir /tmp/basic-site-output
```

Inspect the output:

```bash
ls /tmp/basic-site-output/
# index.html  about.html  styles.css

cat /tmp/basic-site-output/index.html
```

Serve it in the browser:

```bash
npx serve /tmp/basic-site-output
```
