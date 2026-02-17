# Templating

## Problem 

Often we found pruselves repating some chunk of HTML or even having some parts of it repated and only changed some parts of it lie some especif class is inlcuded or not, or mayba the inner parts change cosntantly but the outer (container usually) do not.

## Solution
The solution is not new: **Template languges and engines**; they do exist in diferent falvors and for differente ecosystems. 

This is **yet** another templating langauge, originally we are creating this as en exercise to explore challenges in the design and implementation for possible optimizations, nevertheless, the same optimizations could be done with other template language engine.

### Implementation



## CSS Candidates
We define `candidates` as the HTML classes that are used solely for styling, see more in [distributed-css-managment](../architecture/includes-system/css/distributed-css-managment.md)


## `above-the-fold.html` file

This file MUST be reserved in a way that the template engine MUST make the necessarty operations to ensure the extraction of the needed data form the tempaltes here to consdier its resoruces as critical.

## Templating language

Any templating language that can be adapted to the ideas creating a specific implementation, nevertheless we are constructing, as stated before, our [own set of rules and language that aims](./language.md) to be **pre compiled** into a version that is regexpable fast. 

## Includes System

- SHOULD be the result of a **pre-compilation** of a declarative extension of HTML
- Hashes MUST be of type SHA-256
- Each hash starts with the prefix $#

```XML
<!-- SOME HTML -->
<div>
  $#d7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592 
</div>

```

- Some sort of async `data source` SHOULD be implemented to retrieve for a specific `hash` the needed data

- Some sort of `transformer` that returns the stringed HTML SHOULD be implemented as well.


### Reserved

You SHOULD NOT use directly this **reserved expresions**, but your system SHOULD have an internal process that creates
a HASH based on the CSS content that replaces this expreesions. This expressiosn SHOUDL be used more as HINTS. This is with caching in mind (and other cocnenrns like securty that we are goning to cover later), if if we referecne this as stable "hashes" and the content changes, cahcing woudl be difficult for exmaple. 

`$#critical-css`: This represents the point where the critical CSS MUST be inlined.

`$#non-critical-css`: OPTIONAL. If used , the candidates' final CSS that coud have been critical but are not due not being **above the fold** are inlined in place this reserved break is.



