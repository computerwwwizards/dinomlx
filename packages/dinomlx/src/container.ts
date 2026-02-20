import { BasicContainer } from '@computerwwwizards/dependency-injection';
import { DinomlxCompiler } from './compiler';
import { CssRegistry } from './services/CssRegistry';
import { HtmlParserService } from './services/HtmlParser';

export const container = new BasicContainer();

container.bindTo('HtmlParserService', () => new HtmlParserService());
container.bindTo('CssRegistry', () => new CssRegistry());

container.bindTo('Compiler', (c) => {
  // @ts-ignore
  const css = c.get('CssRegistry');
  // @ts-ignore
  const html = c.get('HtmlParserService');
  return new DinomlxCompiler(css, html);
});
