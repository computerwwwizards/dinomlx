export type BuildOptions = {
  outDir: string;
  cacheDir: string;
  basePath: string;
  srcRoot: string;
  minify: boolean;
};

import { type ReadStream } from "node:fs";
import { Readable } from "node:stream";

export interface CreateHashOptions{
  componentName: string;
  customAttributes?: Record<string, string>;
  spreadAttributes?: Record<string, string>;
  slot?: string;
}
export interface HASHCreator{
  createHash(options: CreateHashOptions):Promise<string>
}


export interface HTMLParser{
  createHashFromStream(stream: ReadStream): Promise<string>;
  createHashFromString(string: string): Promise<string>;
}


export interface HTMLTemplateCompiler{
  from(src: string): this;
  forceStartTransfrom(): this;
  saveTo(target: string): this;
  compile(): Promise<void>
  onFinishTransfrom(cb: (transformed: string)=>void): this;
  getTransformed(): Promise<string>
}

export type RenderMode = 'promise' | 'generator' | 'readable'
export interface Renderer{
  from(src: string): this;
  saveTo(target: string): this;
  render<T extends RenderMode = 'generator'>(mode: T): T extends 'promise' ? Promise<string> : T extends 'readable'? Readable : AsyncGenerator<string, string>
}

export type CSSMode = 'both' | 'deferable' | 'critical'
export interface CSSGenerator{
  getPromiseByCandidates<T extends CSSMode = 'both'>(set: Set<string>, mode?: T): Promise< T extends 'critical'? {critical: string}: T extends 'both' ?{critical: string; deferable: string} : {deferable: string}>;
}
