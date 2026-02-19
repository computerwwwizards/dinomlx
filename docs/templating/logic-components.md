# Logic Components

DINOMLX provides built-in components for control flow within templates.

## `<if>`

Renders its children only if the condition evaluates to true.

```html
<if condition="$data.isVisible">
  <div>Visible Content</div>
</if>
```

## `<for>`

Iterates over a collection and renders its children for each item.

```html
<for items="$data.items" as="item">
  <li>{{ item.name }}</li>
</for>
```

## `<loop>`

Repeats content a specified number of times.

```html
<loop count="5" index="i">
  <div>Item {{ i }}</div>
</loop>
```
