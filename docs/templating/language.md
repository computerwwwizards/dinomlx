# Templating language (DINOMLX)

## Syntax

- Any valid HTML is admited


## Reserved prefix
Custom components MUST start with a `c-` prefix, after that follow the name of the tag

```xml
<div>
  <c-custom-tag-name />
</div>
```

There is one reserved case: `c-tag`

This is for another way to declare custom tags, but if use this form it MUST have an attribute called `_c_name`

```xml
<c-tag _c_name="custom-tag-name" />
```

### Example
We can have

```xml
<!-- navbar.html -->
<navbar >
  <a href="/path1">
    content 1
  </a>
  <a href="/path2">
    content 2
  </a>
  <a href="/path3">
    content 3
  </a>
</navbar>

```
And used like this

```xml
<c-navbar />
```

## Atttibutes

All custom attributes MUST start with `_c_` prefix

### Reserved attributes

`_c_name`: In case using `<c-tag />` is a MUST to use an attribute `_c_name` to let the compiler/engine the name of the custom component.

`_c_template-source`: OPTIONAL. It MAY be either a fully qualified URL or a path (relative or absolute) for using the localfile system or a global variable that has as value one of the two stated before. If no source is stated for the template, there MUST be some data resolver that uses the component name to internally decide where to get the information.

`_c_version`: OPTIONAL. MUST be any semantic version.



## Roadmap

- [ ] Add support for `slots`
- [ ] Add support for `for  of` and `loop`
- [ ] Add support for `if`, `else`, `elif`
- [ ] Expand explanation of the custom attributes
- [ ] Add suport for inline `if else`

