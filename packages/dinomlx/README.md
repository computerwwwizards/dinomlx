# DINOMLX SSG CLI

Build CLI for Static Site Generation

**Important**: In this first unstable implementation we do not support nested inclusions

## Build

Basic

```bash
dinomlx build 
```

|option|default|description|
|---|---|---|
|--out-dir|$pwd/dist|The directory for the final generated static assets|
|--cache-dir|$pwd/.dinomlx/cache/|Directory for cache compilation data|
|--base-path||A path to prefix the assets, in case you are deploying into path as teh root of the web site, exmple: "/my-blog"|
|--src-root|$pwd/src/|Path to the src files|
|--minify|true|Sets if the final code is minfied|


## Implementation details

### XML parsers

We are going to use XML parsers (at least in this iteration) to query  the custom components. In this case cheerio

### SHA

We are going to use **Node.js** native crypto to create the hashes based on the name, attributes and slot

### Patterns

Rigth now we lack of clear boundaries and APIS, treat this as an experimental release or even a proof of concept

