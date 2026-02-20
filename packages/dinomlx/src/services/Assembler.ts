import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { PageIR, ComponentData } from '../types';
import { HtmlParserService } from './HtmlParser';
import { CheerioAPI } from 'cheerio';

export class Assembler {
  constructor(
    private parser: HtmlParserService,
    private srcRoot: string,
  ) {}

  async assemble(pageIR: PageIR, lang: string = 'english'): Promise<string> {
    const rootHash = Object.keys(pageIR.data).find(
      (k) => pageIR.data[k].componentName === 'page',
    );
    if (!rootHash) throw new Error('No root page component found in IR');

    return this.render(rootHash, pageIR, lang);
  }

  private async render(
    hash: string,
    ir: PageIR,
    lang: string,
  ): Promise<string> {
    const data = ir.data[hash];
    if (!data) return '';

    let html = '';
    let $;

    if (data.componentName === 'page') {
      html = data.slots.body || '';
      $ = this.parser.parse(html);
    } else {
      // Load template
      const templatePath = resolve(
        this.srcRoot,
        'templates',
        data.componentName.replace(/_/g, '/') + '.html',
      );
      try {
        html = await readFile(templatePath, 'utf-8');
        $ = this.parser.parse(html);
      } catch (e) {
        console.warn(`Template not found: ${templatePath}`);
        return '';
      }

      // Spread attributes to root element
      const rootEls = $.root().children();
      if (rootEls.length > 0) {
        const rootEl = rootEls.first();
        for (const [key, val] of Object.entries(data.attributes)) {
          if (key === 'class') {
            rootEl.addClass(val);
          } else {
            rootEl.attr(key, val);
          }
        }
      }
    }

    // Handle slots
    $('c-slot').each((_, el) => {
      const attribs = (el as any).attribs || {};
      const name = attribs['name'] || 'default';
      const content = data.slots[name] || '';
      $(el).replaceWith(content);
    });

    // Handle <c-slot-[name]>
    $('*').each((_, el) => {
      const tagName = (el as any).tagName;
      if (tagName && tagName.startsWith('c-slot-')) {
        const name = tagName.replace(/^c-slot-/, '');
        const content = data.slots[name] || '';
        $(el).replaceWith(content);
      }
    });

    // Handle <d-variable />
    $('*').each((_, el) => {
      const tagName = (el as any).tagName;
      if (tagName && tagName.startsWith('d-')) {
        const key = tagName.replace(/^d-/, '');
        const val = data.attributes[key] || '';
        $(el).replaceWith(val);
      }
    });

    // Handle $key in attributes
    $('*').each((_, el) => {
      const attribs = (el as any).attribs || {};
      for (const attr in attribs) {
        const val = attribs[attr];
        if (val.startsWith('$')) {
          const key = val.substring(1);
          if (data.attributes[key]) {
            attribs[attr] = data.attributes[key];
          }
        }
      }
    });

    let resultHtml = $.html();

    // Recursively render child components
    const hashRegex = /\$#\{([a-zA-Z0-9_]+)\}/g;
    const hashes = new Set<string>();
    let match;
    while ((match = hashRegex.exec(resultHtml)) !== null) {
      hashes.add(match[1]);
    }

    for (const h of Array.from(hashes)) {
      const childHtml = await this.render(h, ir, lang);
      resultHtml = resultHtml.split(`$#{${h}}`).join(childHtml);
    }

    // Replace i18n
    const i18nRegex = /\$i18n#\{([a-zA-Z0-9_]+)\}/g;
    resultHtml = resultHtml.replace(i18nRegex, (_, h) => {
      const dict = ir.i18n[h];
      return dict ? dict[lang] || Object.values(dict)[0] || '' : '';
    });

    return resultHtml;
  }
}
