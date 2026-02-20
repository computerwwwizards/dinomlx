#!/usr/bin/env node


import { type ReadStream } from "node:fs";
import { Readable } from "node:stream";

import { CSSRegisterLayerImpl } from './css-register';
export { CSSRegisterLayerImpl, type CSSRegister, type CSSRegisterLayer, type CSSRegisterOptions } from './css-register';

interface CreateHashOptions{
  componentName: string;
  customAttributes?: Record<string, string>;
  spreadAttributes?: Record<string, string>;
  slot?: string; 
}
interface HASHCreator{
  createHash(options: CreateHashOptions):Promise<string>
}


interface HTMLParser{
  createHashFromStream(stream: ReadStream): Promise<string>;
  createHashFromString(string: string): Promise<string>;
}


interface HTMLTemplateCompiler{
  from(src: string): this;
  forceStartTransfrom(): this;
  saveTo(target: string): this;
  compile(): Promise<void>
  onFinishTransfrom(cb: (transformed: string)=>void): this;
  getTransformed(): Promise<string>
}

type RenderMode = 'promise' | 'generator' | 'readable'
interface Renderer{
  from(src: string): this;
  saveTo(target: string): this;
  render<T extends RenderMode = 'generator'>(mode: T): T extends 'promise' ? Promise<string> : T extends 'readable'? Readable : AsyncGenerator<string, string>
}

type CSSMode = 'both' | 'deferable' | 'critical'
interface CSSGenerator{
  getPromiseByCandidates<T extends CSSMode = 'both'>(set: Set<string>, mode?: T): Promise< T extends 'critical'? {critical: string}: T extends 'both' ?{critical: string; deferable: string} : {deferable: string}>;
}
