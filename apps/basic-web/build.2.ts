import type { PathLike } from "node:fs";
import { readFile } from "node:fs/promises";
import path, { join, resolve } from "node:path";
import { dirname } from "node:path/posix";

interface AssetPaths{
  critical?: string;
  defered?: string;
}

interface BuildHTMLOptions{
  htmlPath: string;
  cssPaths?: AssetPaths;
  jsPaths?: AssetPaths;
  global?: {
    cssPaths?: AssetPaths;
    jsPaths?: AssetPaths;
  };
  /**
   * @default process.cwd
   */
  root?: string;
  // to be defined, global config where to find things and map tempaltes locations or default places to look for
  configuration?: {
    templates?: string;
  }
}

async function buildHTML({
  root = process.cwd(),
  htmlPath: html,
  cssPaths: css,
  configuration
}: BuildHTMLOptions){
  const htmlPath = resolve(root, html);

  const cssCritical = resolve(root, css?.critical ?? join(dirname(htmlPath), 'crtical.css'))
  const cssLazy =  resolve(root, css?.defered ?? join(dirname(htmlPath), 'styles.css'))
  
  const htmlContent = await readFile(htmlPath)

    
  //but if this where a parser we may not need the html normalziation, this suggest diffrent stragies

  //detect in the html every tag that is like <c-custom-component></c-custom-coponent> and
  // its attributes, if we are regexping this we need to be sure to capture in the replace all the atributes
  // and children, ideally this was already normalized so is one liner but we need to delmite till the close tag
  
  //then we need to hash the component name + atrributes + chidlren raw
  //
  // we pass this as a task indexed by this hash a resolution of the template (from templates folder)

  const { templates = resolve(root, 'src/templates') } = configuration ?? {}

  // promised resolving are runnign concurrently so  we wait then for every compeont to solve that
  // an load its server side js passinf all the atributes original getted from the regexp and adding any child
  // where we need. we would use componentTempalteTask.

  
  const promisesMap = new Map<string, Promise<string>>();

  

}

interface ComponentTemplateTaskOptions {
  htmlPath: string;
  trasnformerPath: string;
  atrributes: any;
  child: string;
  promises: Map<string, Promise<string>>
}

async function componentTemplateTask({
  htmlPath,
  trasnformerPath,
  atrributes,
  child,
  promises
}: ComponentTemplateTaskOptions){
  const htmlContent = await readFile(htmlPath, {
    encoding: 'utf8'
  });
  const { default: defaultFn } = await import(trasnformerPath);

  const { attributes, data } = await defaultFn({
    atrributes
  })

  // replace inside htmlCOntent all the $vars with dot notation and array and so on
  // with the data inside data, and also to the first wrapper element add as atrributes
  // the attributes fro the atributes object
  // also we shoudl replace the <c-slot /> tag with waht we have here as child html
  return htmlContent
}