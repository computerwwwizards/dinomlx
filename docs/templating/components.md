# Components

Components are the building blocks of DINOMLX. They are reusable, self-contained units that can be composed to build pages.

## Reusable Components

Reusable components must always have a closing tag and must be prefixed with `c-`:

```html
<c-custom-component></c-custom-component>
```

### Component Attributes

Components can accept several attributes to define their behavior, data source, and styles.

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

#### `template-src`
Specifies the path to the HTML template file. It can be a relative path, absolute path, or a remote URL.
If the template file contains a `<config>` block, it can define other sources there.

```xml
<!-- custom-component.html -->
<config>
 <css-src>https://some-remote/$component-name.css</css-src>
 <js-src>../components/$component-name.js</js-src>
</config>
<div>Hello</div>
```

#### `transformer-src`
Points to a server-side JavaScript file that runs during compilation. This transformer handles data fetching, attribute processing, and preparation before the template is rendered.

**Note:** This code runs at build time (or on the server) and is never shipped to the client.

```js
export default async function(ctx){
  const { fs, fetch, attributes } = ctx
  return {
    attributes: { className: 'my-component' },
    data: { title: 'Hello World' } // Available as {{ data.title }} in template
  }
}
```

#### `css-src`
Path to the non-critical CSS file. This is bundled into the deferable stylesheet.

#### `critical-css-src`
Path to the Critical CSS file. If the component is above the fold, this CSS will be inlined in the `<head>`.

#### `js-src`
Path to the client-side JavaScript file. This module is loaded dynamically when the component is interactive.

```js
export default function(runtime){
  const { eventBus, on: { click } } = runtime;

  click.add((event) => {
    console.log('Clicked!');
  });

  // Cleanup function
  return () => {
    // unsubscribe...
  }
}
```

#### `lazy-js-src`
Same as `js-src`, but only loaded when the element becomes visible in the viewport.

#### `on-click-src`
A shortcut to load and execute a JS file only when the element is clicked.

#### `meta-src`
Path to a configuration file (`xml`, `yml`, `json`) that provides default values for attributes.

## Nested Components

DINOMLX supports nesting custom components inside other components, both as part of the template structure and as children passed via slots.
