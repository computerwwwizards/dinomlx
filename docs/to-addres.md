# To Address

This space is for doubts and recomendations

## Util first byte problem
We need to document the problem that arises when having

```html
<!-- Component <c-my-component /> -->
<div class="util-1 util-2 util-3 util-4 util-5 util-6 util-7 "></div>
```
And this componet repetades let's say 10 times acrros all the page.

What it seems we lessen in byte size in html by shararing atomic utitlities, can be not worhth beacuse we "recover" or wors we end churning more space in the HTML document.

## CSS design guides (good pratices?)
For insance, to avoid the problem of **util first byte** we can suggest design guidelines like having components, but this compoents should share the most they can, balancing things

```css
[class^="button"]{
  /* Shared styles that apply to .button, .button-primary and so on*/

}

.button-primary{
  background-color: var(--color-semantic-primary-bg);
}
```


I remeber this is osmehting bootstrap have done to minimize its bundle.


## Governance guides

Here all the buttons have soie kind of semantic field and it is natural to share styles but in other situations, and specially working with other roles can lead to friction when something needs to be upon a semantic field or arises the need to create a new one, so some guidlines can be helpful to provide aide in governance.


## Size budgets and tools to aid it

Document the size budgets we suggest and create tools that can audit this and make suggestions.

For example to blance the size between HTML and CSS, like a dinamic view for exmaple to see what happens if I try to abstract some reused css in a component or a prefix of components and also that admits repoting wuith several cases of data like with 1 item, n/2 items, n items.

Some tool that checks the CSS creates dimensions of shraing and makes suggestions based on heuristics