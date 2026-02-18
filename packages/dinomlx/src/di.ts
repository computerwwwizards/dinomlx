import { BasicContainer } from '@computerwwwizards/dependency-injection';
import { NodeCryptoHashCreator } from './services/hash-creator';
import { CheerioHTMLParser } from './services/html-parser';
import { CheerioTemplateCompiler } from './services/template-compiler';
import {
  InMemoryCSSRegister,
  SimpleCSSGenerator,
} from './services/css-processor';
import { SimpleRenderer } from './services/renderer';
import { DinomlxBuilder } from './services/builder';
import type {
  BuildOptions,
  HASHCreator,
  HTMLParser,
  HTMLTemplateCompiler,
  CSSRegister,
  CSSGenerator,
  Renderer,
} from './types';

export interface DinomlxServices {
  'hash-creator': HASHCreator;
  'html-parser': HTMLParser;
  'template-compiler': HTMLTemplateCompiler;
  'css-register': CSSRegister;
  'css-generator': CSSGenerator;
  renderer: Renderer;
  builder: DinomlxBuilder;
  'build-options': BuildOptions;
}

export function createContainer(
  options: BuildOptions,
): BasicContainer<DinomlxServices> {
  const container = new BasicContainer<DinomlxServices>();

  container.bind('build-options', {
    provider: () => options,
  });

  container.bind('hash-creator', {
    provider: () => new NodeCryptoHashCreator(),
  });

  container.bind('html-parser', {
    provider: () => new CheerioHTMLParser(),
  });

  container.bind('template-compiler', {
    scope: 'transient',
    provider: () => new CheerioTemplateCompiler(),
  });

  container.bind('css-register', {
    provider: () => new InMemoryCSSRegister(),
  });

  container.bind('css-generator', {
    resolveDependencies: (ctx) => ctx.get('css-register'),
    provider: (register) =>
      new SimpleCSSGenerator(register as InMemoryCSSRegister),
  });

  container.bind('renderer', {
    provider: () => new SimpleRenderer(),
  });

  container.bind('builder', {
    resolveDependencies: (ctx) => ({
      options: ctx.get('build-options'),
      compilerFactory: () => ctx.get('template-compiler'),
    }),
    provider: (deps) => new DinomlxBuilder(deps.options, deps.compilerFactory),
  });

  return container;
}
