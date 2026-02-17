# DINOMLX SSG CLI

Build CLI for Static Site Generation using ``

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
