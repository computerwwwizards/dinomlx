# Client Runtime

DINOMLX employs a lightweight client runtime designed for high performance and zero hydration.

## Core Principles

1.  **Zero-Hydration**: The DOM is the source of truth. The runtime does not re-render the entire page on load; instead, it progressively enhances interactive elements.
2.  **Event Delegation**: A single listener per event type is attached to the document root, delegating events to components based on `data-id`.
3.  **Tiered Resolution**:
    *   **WeakMap**: Check if a component instance is already active.
    *   **Heuristic Pre-scan**: Identify high-priority `[data-id]` elements on load.
    *   **DOM Fallback**: Crawl up the DOM using `closest('[data-id]')` and dynamic import required modules.

## Context System

Context is hierarchical and flows from the root down to individual components.

### Global Context (`init.js`)
Defined in the root entry file. This is where the event bus, IoC container, and global configuration are initialized.

```js
import { createEventBus } from './event-bus.js'
import { createIoC } from './ioc.js'

const eventBus = createEventBus()
const ioc = createIoC()
ioc.register('analytics', () => ({ track: () => {} }))
```

### Component Context
Child components inherit context from their parents. A parent can declare a new context scope, which is passed down to its descendants.

### Page Context
Tied to the lifecycle of a page. When navigating away, the context is garbage collected unless explicitly persisted during transition.

```js
// page-transition.js
export default function({ from, to, ioc, eventBus }) {
  from.observers.forEach(obs => obs.unsubscribe())
  return { ioc, eventBus } // Pass to new page
}
```

## Global Variables

Templates have access to global variables prefixed with `$`.

*   `$root`: Application root.
*   `$cwd`: Current working directory.
*   `$env`: Environment (production, development).
*   `$page`: Current page metadata (`{ id, name }`). Derived from filename or `meta-src`.
*   `$component`: Current component metadata (`{ id, name }`).
*   `$config`: App-level configuration (client-safe keys only).

## Soft Navigation

DINOMLX supports soft navigation to emulate SPA behavior.

*   When a navigation event occurs, the framework fetches the HTML, CSS, and JS for the target page.
*   The current content is replaced programmatically.
*   A service worker can be used to cache pages and assets for offline support and instant navigation.

## Edge & Progressive Enhancement

The architecture encourages rendering on the edge whenever possible.
*   **Edge**: Ideally, the server returns complete HTML.
*   **Service Worker**: If backend is unavailable or for SPA-like behavior, a service worker can generate HTML using the same templating logic (via WebAssembly or JS).
*   **Main Thread**: Primarily handles DOM interaction, not heavy rendering logic.
