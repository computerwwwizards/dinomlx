import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import minifier from '@minify-html/node'

import { PurgeCSS } from 'purgecss'

const srcFolder = join(import.meta.dirname, 'src')

const page = await readFile(join(srcFolder, 'index.html'), {
  encoding: 'utf-8'
});

const criticalCSS = await readFile(join(srcFolder, 'critical.css'), {
  encoding: 'utf-8'
})

const purger = new PurgeCSS();

const [{ css: criticalPurgedCSS }] = await purger.purge({
  content: [{
    extension: 'html',
    raw: page
  }],
  css: [
    {
      raw: criticalCSS
    }
  ]
})

const criticalPurgedCSSSize = Buffer.byteLength(criticalPurgedCSS, "utf8")

if(criticalPurgedCSSSize > 4000){
  throw new Error('Internal CSS is too big')
}

if(criticalPurgedCSSSize > 2000){
  console.warn("CSS is kind of big, be careful, consider reducing its size")
}else{
  console.log("CSS is okay")
}



const joinHTML = page.replace('<!-- Critical CSS -->', `<style>
  ${criticalPurgedCSS}
</style>`)


const minifiedHTML = minifier.minify(Buffer.from(joinHTML), {
  minify_css: true,
  keep_html_and_head_opening_tags: true,
  keep_closing_tags: true
})

const htmlSize = Buffer.byteLength(minifiedHTML)

if(htmlSize > 13000){
  throw new Error('HTML is too big')
}

if(htmlSize >  5000){
  console.warn('HTML is kind of big, try to reduce its size')
}

const distFolder = join(import.meta.dirname, 'dist')

await mkdir(distFolder, {
  recursive: true
})

writeFile(join(distFolder, 'index.html'), minifiedHTML, {
})

function fromBytestoKBytes(bytes: number){
  return `${(bytes/1024).toFixed(2)} K`
}

console.table({
  'critical CSS Size (not minified)': fromBytestoKBytes(criticalPurgedCSSSize),
  'minified HTML Size': fromBytestoKBytes(htmlSize)
})

