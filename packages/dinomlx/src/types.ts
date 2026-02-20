import { type ReadStream } from 'node:fs';
import { Readable } from 'node:stream';
import type { Properties } from 'csstype';

export type BuildOptions = {
  outDir: string;
  cacheDir: string;
  basePath: string;
  srcRoot: string;
  minify: boolean;
};

export interface CreateHashOptions {
  componentName: string;
  customAttributes?: Record<string, string>;
  spreadAttributes?: Record<string, string>;
  slot?: string;
}

export interface HASHCreator {
  createHash(options: CreateHashOptions): Promise<string>;
}

export interface HTMLParser {
  createHashFromStream(stream: ReadStream): Promise<string>;
  createHashFromString(string: string): Promise<string>;
}

export interface HTMLTemplateCompiler {
  from(src: string): this;
  forceStartTransfrom(): this;
  saveTo(target: string): this;
  compile(): Promise<void>;
  onFinishTransfrom(cb: (transformed: string) => void): this;
  getTransformed(): Promise<string>;
}

export type RenderMode = 'promise' | 'generator' | 'readable';
export interface Renderer {
  from(src: string): this;
  saveTo(target: string): this;
  render<T extends RenderMode = 'generator'>(
    mode: T,
  ): T extends 'promise'
    ? Promise<string>
    : T extends 'readable'
      ? Readable
      : AsyncGenerator<string, string>;
}

export type CSSRegisterOptions = {
  raw?: {
    critical?: string;
    deferable?: string;
  };
} & {
  critical?: Record<string, Properties>;
  deferable?: Record<string, Properties>; // corrected typo 'derable'
};

export interface CSSRegister {
  register(candidateName: string, options: CSSRegisterOptions): this;
  save(): Promise<void>;
  get(candidateName: string): CSSRegisterOptions | undefined; // Added retrieval method
}

export interface CSSRegisterLayer {
  utils: CSSRegister & this;
  components: CSSRegister & this;
  layout: CSSRegister & this;
  global: CSSRegister & this;
  save(): Promise<void>;
}

export type CSSMode = 'both' | 'deferable' | 'critical';
export interface CSSGenerator {
  getPromiseByCandidates<T extends CSSMode = 'both'>(
    set: Set<string>,
    mode?: T,
  ): Promise<
    T extends 'critical'
      ? { critical: string }
      : T extends 'both'
        ? { critical: string; deferable: string }
        : { deferable: string }
  >;
}

// --- New IR Types ---

export interface ComponentData {
  componentName: string; // Added to identify the component template
  slots: Record<string, string>;
  attributes: Record<string, string>;
  custom_attributes: Record<string, string>;
}

export interface I18nData {
  [hashKey: string]: Record<string, string>;
}

export interface AboveTheFoldData {
  own_candidates: string[];
  external_refs: string[]; // Hashes of components
}

export interface PageIR {
  data: Record<string, ComponentData>;
  i18n: I18nData;
  above_the_fold: AboveTheFoldData;
}

export interface TemplateIR {
  candidates: string[];
  html: string;
}

export interface Compiler {
  build(options: BuildOptions): Promise<void>;
}
