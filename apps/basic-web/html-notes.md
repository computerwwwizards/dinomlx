# HTML builder system

HTML files actually will be parsed as xml

## Pipeline

parameters

- path of html file
- path of global criticl css
- path of initial critical css

- path of global js entry point logic
- path of thsi page/html js entry point logic


detect custom components

- get global default config (convention)
- merge with lcoal overrides (configuration)

- parse custoom local overrides (from atrributes)

- get final config

- search for html template
- search for js transformer

- search for crticial css file (coudl be a tasks for later to get all criticl css in one shot)
- search for non critical css file (coudl be task for later)

- search for js files for the cleint side

- hash custom compeont and put a place holder in the original html page

- execute trasnformer

- replace in the temalte the custm $variables with the data from the execution of the transformer
- emit final html and save into a the hashs idexed

- one shot replace with new html resolved the hashed place holders

- add the criticl inlied css
- add the criicl inlined js


- compile the client js and the client css and create hte need files

- create a manifest  since the name of the fgiles ar hashes also and for so
we need to use them to replace inside the html as link or script where it needs


