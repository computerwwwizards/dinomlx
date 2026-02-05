# Design notes

## Grid system

The grid system is built around two primitives: the **grid container** and the **grid item**.

### Grid Container

The container is where the grid is defined. It MUST allow specifying the number of columns. Its children MUST be aware of the number of columns of the container. The number of columns MUST be overridable inside media queries. The column gap dimension MUST be available in the scope of its children.

All of this is driven by CSS custom properties scoped to the container:

```css
:scope {
  --g-c-columns: 8;
  --g-c-gap: 5px;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(var(--g-c-columns), 1fr);
  column-gap: var(--g-c-gap, 0px);
}
```

#### Enhanced grid

Some pages need lateral padding that is part of the grid itself rather than applied with regular `padding`. To achieve this, `.enhanced-grid` adds two extra tracks at the start and end of the grid that act as padding columns.

The base `.grid-container` already prepares the structure for this by reserving space for `--lat-pad` and subtracting 2 from the column count into `--real-columns`. When `.enhanced-grid` is NOT applied, those values have no effect — the subtraction is there but `.enhanced-grid` is what activates it by setting `--lat-pad` and overriding `--real-columns` back to the full column count.

```css
.grid-container {
  --real-columns: calc(var(--g-c-columns) - 2);
  --lat-pad: ;

  display: grid;
  grid-template-columns: var(--lat-pad, ) repeat(var(--real-columns), 1fr) var(--lat-pad, );
  column-gap: var(--g-c-gap, 0px);
}

/* Opt-in: activates the lateral padding columns */
.enhanced-grid {
  --lat-pad: calc(var(--g-c-padding) - var(--g-c-gap, 0px));
  --real-columns: var(--g-c-columns);
}
```

### Grid item

A grid item lets the user specify how many columns it spans and optionally where it starts.

```css
.grid-item {
  grid-column-end: span var(--g-i-span, 1);
  grid-column-start: var(--g-i-start, unset);
}
```

<!-- TODO: explore named grid columns so that grid-column-start and span can be declared using names instead of numbers — would make the grid more declarative and easier to reason about in templates -->

### Examples

Base grid with regular padding — no lateral padding columns involved:

```html
<div class="grid-container" style="padding: 50px">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

Enhanced grid — padding is part of the grid tracks:

```html
<div class="grid-container enhanced-grid" style="--g-c-padding: 50px">
  <div class="grid-item" style="--g-i-start: 2">Item 1</div>
  <div>Item 2</div>
  <!-- Subgrid: item spans 3 columns and its children inherit the parent grid tracks -->
  <div class="grid-item" style="display: grid; grid-template-columns: subgrid; --g-i-span: 3">
    <div>Item a</div>
    <div class="grid-item" style="--g-i-span: 2; background: red;">Item b</div>
  </div>
</div>
```

Live preview:

```html
<style>
  :scope {
    --g-c-columns: 8;
    --g-c-gap: 5px;
  }

  .grid-container {
    --real-columns: calc(var(--g-c-columns) - 2);
    --lat-pad: ;
    display: grid;
    grid-template-columns: var(--lat-pad, ) repeat(var(--real-columns), 1fr) var(--lat-pad, );
    column-gap: var(--g-c-gap, 0px);
  }

  .enhanced-grid {
    --lat-pad: calc(var(--g-c-padding) - var(--g-c-gap, 0px));
    --real-columns: var(--g-c-columns);
  }

  .grid-item {
    grid-column-end: span var(--g-i-span, 1);
    grid-column-start: var(--g-i-start, unset);
  }

  .grid-container > div {
    background-color: #ff6788;
  }
</style>

<div class="grid-container enhanced-grid" style="--g-c-padding: 50px">
  <div class="grid-item" style="--g-i-start: 2">Item 1</div>
  <div>Item 2</div>
  <div class="grid-item" style="display: grid; grid-template-columns: subgrid; --g-i-span: 3">
    <div>Item a</div>
    <div class="grid-item" style="--g-i-span: 2; background: red;">Item b</div>
  </div>
</div>

<div class="grid-container" style="padding: 50px">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

## Critical CSS

Critical CSS MUST be inlined into the internal `style` tag.

Critical CSS MUST not have a total size above 4KB.

Critical CSS SHOULD have a total size below 2KB.

Critical CSS is immutable once inlined, so it MUST be content-hashed. This lets the cache know it will never change and does not need to be re-fetched or invalidated.

<!-- TODO: dig into what else critical CSS MUST be — left unfinished, needs revisiting -->

## Snippets/Components

### Reusable components

Reusable components MUST always have a close tag and MUST be prefixed with `c-`:

```html
<c-custom-component></c-custom-component>
```

Components COULD have attributes to point to their template, transformer, or meta-entrypoint (see [Architecture](#architecture) for more info):

```html
<c-custom-component
 template-src="$cwp/components/$component-name.html"
 transformer-src="$rd/components/$component-name/transformer.js"
 css-src="https://some-remote/$component-name.css"
 critical-css-src="https://some-remote/$component-name.critical.css"
 js-src="../components/$component-name.js"
 meta-src="./components/$component-name.yml"
></c-custom-component>
```

The attributes available are:

#### template-src

It tells us which template to use and will also try to load any convention-named files relative to this template.

MUST be an html file. COULD be an absolute path or a remote safe HTTP URL. COULD have XML configuration data:

```xml
<!-- custom-component.html -->
<config>
 <css-src>
  https://some-remote/$component-name.css
 </css-src>
 <js-src>
  ../components/$component-name.js
 </js-src>
</config>
<div>
  Hello
</div>
```

#### transformer-src

The server-side JS file for this component. It follows the same `export default async function(ctx)` pattern described in [Architecture](#architecture). This is where you handle server-side data, attributes, and anything that needs to run before the template is rendered.

#### css-src

The path to the non-critical CSS file. This can be deferred since it is not needed for the initial render.

#### critical-css-src

The path to the CSS file that contains critical CSS, which will be inlined at the head.

If you want internal CSS that only applies to this component and doesn't need to go through the critical path, put it inside a `style` tag directly in the template.

#### js-src

The path to the client-side JavaScript file:

```js
export default function(runtime){
  //TODO: we need to enhance runtime
  const {
    navigate,
    fetch,
    require,
    // TODO: We need to add more on events
    on: {
      click,
      scroll
    },
    id,
    eventBus,
    // usually here we pass configuration, globals and IoC container
    // event bus MUST be merged with IoC
    // TODO: find a way to have event bus and IoC as child containers rather than using a global but this 
    // should be configurable
    ctx
  } = runtime;

  // We may not have in memory the parent element but is query select
  // when we are accessing the element
  const element = runtime.element;

  const unsubscribe = eventBus.get('eventA').subscribe(()=>{})

  click.add((event)=>{});

  // This is called when the component is removed from DOM/navigation occurs
  return ()=>{
    unsubscribe()
  }
}
```

#### lazy-js-src

The same as `js-src` but it is only called when the element becomes visible.

<!-- TODO: this default behavior could be not ideal -->

#### on-click-src

A convenience shortcut to load and execute a JS file when the element is clicked. Under the hood it hooks into the same event delegation system — it is the same as manually adding a click listener via the client-side event system, just declared as an attribute instead. Click is the first one supported because it is the most common, but the plan is to expand this to other events like focus, scroll, etc.

#### lazy-on-click-src

The same as `on-click-src` but the JS is only fetched and executed on the first click, not before. Nothing is loaded until the user actually interacts.

#### meta-src

Could be an `xml`, `yml`, or `json` file path that has the same attributes as described here. The values in this file are overridable by the attributes in the html template.

### Logic components

In progress/design. These are server-side tags that run during template rendering. They have access to `data` (from the transformer) and global variables with `$`.

#### Accessing data in templates

Simple object property access uses dot notation:

```html
<h1>$data.title</h1>
<p>$data.user.name</p>
<p>$data.user.email</p>
```

Arrays are also accessed with dot notation. To get a specific index:

```html
<p>$data.items.0.label</p>  <!-- "Item A" -->
<p>$data.items.1.label</p>  <!-- "Item B" -->
```

Global variables work the same way:

```html
<p>$page.name</p>
<p>$env</p>
<p>$component.id</p>
```

#### `<if>`

```xml
<if condition="$data.user.name">
  <p>Welcome, $data.user.name</p>
</if>
```

#### `<for>`

Iterates over an array. The `each` attribute points to the array in `data`, and `as` defines the name of the current item inside the loop. Inside the loop body you access the current item with `$item` (or whatever name you gave in `as`):

```xml
<for each="$data.items" as="item">
  <div>
    <span>$item.id</span>
    <span>$item.label</span>
  </div>
</for>
```

You can also nest loops and mix in global variables:

```xml
<for each="$data.items" as="item">
  <div>
    <span>$item.label</span>
    <span>$page.name</span>
  </div>
</for>
```

## Architecture

### Server-side transformer

The transformer is the server-side (or build-time) JS that runs per component. This code is **never shipped to the client**. It is where you handle data fetching, attribute processing, and anything that needs to happen before the template is rendered. See [transformer-src](#transformer-src) for how to point a component to one.

**Important:** The transformer is written in JS syntax and exposes a JS-like API, but that does not mean it runs on Node.js or any particular JS engine. The parsing and orchestration layer of the framework could be written in Go, Rust, or any other language. In that case, a minimal embedded JS engine would be used to execute the transformer code. When the transformer calls something like `fetch` or `fs`, it is not calling a real native JS implementation — it is calling a bridge. That bridge sends the request to the main process (the Go/Rust one), which does the actual IO or network call, and sends the result back. So from the transformer's perspective the API looks like normal JS, but under the hood it is IPC to the real runtime.

<!-- TODO: define the IPC/bridge protocol between the embedded JS engine and the main process -->

```js
export default async function(ctx){
  const {
    //TODO: this is the promises map
    promises,
    //TODO: implement node fs/promises alike system
    fs,
    fetch,
    attributes,
    child,
    raw,
    global,
    env
  } = ctx

  return {
    // These attributes are passed directly to the container element
    attributes: {
      className: '',
      style: ''
    },
    // This data is local to this component's template.
    // Access it with dot notation inside the template.
    data: {
      title: 'My Page',
      user: {
        name: 'John',
        email: 'john@example.com'
      },
      items: [
        { id: 1, label: 'Item A' },
        { id: 2, label: 'Item B' },
        { id: 3, label: 'Item C' }
      ]
    }
  }
}
```

### Client-side context system

On the client side, context is organized in three layers.

**Global context** is defined in a root entry file — the first JS that runs on the client. This is where you set up the event bus, the IoC container, observers, and any global configuration. Everything starts here. This file is the equivalent of an `init` or `main.js` — it bootstraps the entire client-side runtime.

```js
// init.js — root entry file, runs first on the client

import { createEventBus } from './event-bus.js'
import { createIoC } from './ioc.js'

const eventBus = createEventBus()
const ioc = createIoC()

// Register global services into the IoC container
ioc.register('logger', () => console.log)
ioc.register('analytics', () => ({ track: (event) => { /* ... */ } }))

// Listen to global events
eventBus.get('navigation').subscribe((event) => {
  // runs on every navigation
})

export { eventBus, ioc }
```

**Component contexts** are child entry points that work the same way as the root entry file, but scoped to a component. A parent component can declare one of these, and any component nested inside it has access to that context. This is similar to how SvelteKit uses layout files to share things down the tree — but here it is not about routes, it is about component nesting. A parent component declares a context and its children inherit it.

**Page context** is tied to a page and its lifetime. When you navigate away from a page, its context can be garbage collected depending on configuration. There should be a dedicated transition file that runs during navigation — this is where you put cleanup logic for the old page, or where you decide what to carry over into the new page context if you want things to persist, like the IoC container, observers, or specific data.

```js
// page-transition.js — runs when navigating away from a page

export default function({ from, to, ioc, eventBus }) {
  // Cleanup: tear down anything that belongs to the old page
  from.observers.forEach(obs => obs.unsubscribe())

  // Persist: carry things over to the new page context if needed
  return {
    ioc,        // keep the same IoC container across pages
    eventBus,   // keep the same event bus
    // anything else you want the new page to have access to
  }
}
```

**How js-src gets access to context:** When a component's `js-src` runs, the `runtime` it receives already has the context baked in — the `eventBus`, `ctx`, and everything else flow down from the root entry file through any intermediate component contexts. The component does not need to know where those things were originally set up, it just destructures what it needs from `runtime`.

### Global variables

Global variables are available everywhere in templates, referenced with a `$` prefix. They are split into two categories based on where they can safely be accessed.

**Available on both server and client:**

`$root` — the root of the application.

`$cwd` — the current working directory.

`$env` — the current environment, e.g. `production`, `development`, `staging`. Already available as `env` inside the transformer ctx, but also useful directly in templates for things like conditionally rendering debug info or switching asset URLs.

`$page` — the current page identity. Contains only `{ id, name }`. The `id` and `name` are inferred automatically from the file name — so a file called `about-us.html` becomes `{ id: 'about-us', name: 'About Us' }`. This can be overridden via the page's `meta-src` config file if you need something different. This is safe on the client because the browser already knows what URL it is on — no internal paths or server metadata are exposed. Useful for active navigation states, conditional styling, breadcrumbs.

`$component` — the current component's own identity, like `{ id, name }`. Same inference logic as `$page` — derived from the component's file name, overridable via `meta-src`. Useful when a component needs to reference itself, for example to scope CSS classes or generate unique IDs for accessibility.

`$config` — app-level configuration. Only keys explicitly marked as client-safe are exposed on the client. The rest stays server-only. This needs a whitelist mechanism in the config file to decide what crosses the boundary.

<!-- TODO: define the whitelist mechanism for $config -->

### Nested custom components

MUST support using other custom components inside custom component templates, both as part of the template itself and as children passed in.

### Soft navigation

MUST support soft navigation. When the intent to navigate is detected, the framework fetches the HTML, CSS, and JS for the target page, then programmatically replaces the current content with the fetched content.

<!-- TODO: service worker — use a service worker to manage a near cache for pages, assets, and other resources. This keeps navigation fast even with limited connectivity. -->

<!-- TODO: content hashing — final output files should be hashed by their content. This lets us know exactly what is in cache, what has changed, and what needs to be re-fetched. The cache strategy should be based on these hashes. -->

### Client runtime

A high-performance, zero-hydration engine that uses the DOM as the source of truth.

MUST use event delegation to handle clicks, scrolls, and similar events. MUST use `data-id` to map DOM elements to the correct JS module that needs to run.

**Tiered Event Resolution (The Synthetic Grid)**

When an event occurs, the runtime resolves logic through three levels. First, a WeakMap check to see if a component instance is already warm. Second, a heuristic pre-scan: on navigation, the runtime identifies high-priority `[data-id]` elements and pre-registers them. Third, a DOM fallback: if the ID is not cached, the runtime crawls the DOM using `closest('[data-id]')`, reads the state from attributes, and dynamically imports the required JS.

**Event Delegation**

One listener per event type on the root. Capture phase is used with `{ capture: true }` for non-bubbling events like scroll and focus. `data-id` is the primary key to link DOM elements to JS modules.

<!-- TODO: secure fetch — all fetch calls on the client must be scoped and validated. Need to verify that the fetch is coming from the actual runtime and not from an iframe or injected code. Compare against the native fetch to make sure it has not been tampered with. This applies to any network call the framework makes internally. -->