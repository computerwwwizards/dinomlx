import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { HtmlParserService } from './HtmlParser';
import { PageIR, ComponentData, I18nData, AboveTheFoldData } from '../types';
import { createHash } from 'node:crypto';
import { CheerioAPI } from 'cheerio';

export class IrGenerator {
  private candidates = new Set<string>();

  constructor(
    private parser: HtmlParserService,
    private srcRoot: string,
  ) {}

  private getTemplatePath(tagName: string) {
    const name = tagName.replace(/^c-/, '').replace(/_/g, '/');
    return resolve(this.srcRoot, 'templates', `${name}.html`);
  }

  async collectCandidates(
    filePath: string,
    visited = new Set<string>(),
  ): Promise<void> {
    if (visited.has(filePath)) return;
    visited.add(filePath);

    let html;
    try {
      html = await readFile(filePath, 'utf-8');
    } catch (e) {
      console.warn(`Could not read template ${filePath}`, (e as Error).message);
      return;
    }
    const $ = this.parser.parse(html);

    $('[class]').each((_, el) => {
      const classes = $(el).attr('class')?.split(/\s+/) || [];
      classes.forEach((c) => c && this.candidates.add(c));
    });

    const componentTags = new Set<string>();
    $('*').each((_, el) => {
      const tagName = (el as any).tagName;
      if (
        tagName &&
        tagName.startsWith('c-') &&
        !tagName.startsWith('c-slot') &&
        tagName !== 'c-above-the-fold'
      ) {
        componentTags.add(tagName);
      }
    });

    for (const tag of Array.from(componentTags)) {
      try {
        const templatePath = this.getTemplatePath(tag);
        await this.collectCandidates(templatePath, visited);
      } catch (e) {
        console.warn(`Could not resolve component ${tag}`, e);
      }
    }
  }

  async generatePageIr(pagePath: string): Promise<PageIR> {
    this.candidates = new Set();
    await this.collectCandidates(pagePath);

    const html = await readFile(pagePath, 'utf-8');
    const $ = this.parser.parse(html);
    const data: Record<string, ComponentData> = {};
    const i18n: I18nData = {};

    const processI18n = (ctx: CheerioAPI) => {
      let found = true;
      while (found) {
        found = false;
        const tags = ctx('*').filter((_, el) =>
          ((el as any).tagName || '').startsWith('i18n-'),
        );
        if (tags.length > 0) {
          found = true;
          tags.each((_, el) => {
            const $el = ctx(el);
            const tagName = (el as any).tagName;
            const key = tagName.replace(/^i18n-/, '');

            const values: Record<string, string> = {};
            $el.children().each((__, child) => {
              const childTagName = (child as any).tagName;
              if (childTagName && childTagName.startsWith('i-')) {
                const lang = childTagName.replace(/^i-/, '');
                values[lang] = ctx(child as any).html() || '';
              }
            });

            const hashContent = key + JSON.stringify(values);
            const hash = createHash('sha256').update(hashContent).digest('hex');
            const hashKey = `hash_${hash}`;

            i18n[hashKey] = values;

            $el.replaceWith(`$i18n#{${hashKey}}`);
          });
        }
      }
    };

    processI18n($);

    const processInstances = async (ctx: CheerioAPI) => {
      const isComponent = (tagName: string) =>
        tagName.startsWith('c-') &&
        !tagName.startsWith('c-slot') &&
        tagName !== 'c-above-the-fold';

      let found = true;
      while (found) {
        found = false;
        const deepComponents = ctx('*').filter((_, el) => {
          const tagName = (el as any).tagName;
          if (!tagName || !isComponent(tagName)) return false;

          const hasChildren =
            ctx(el)
              .find('*')
              .filter((__, child) => {
                const childTagName = (child as any).tagName;
                return childTagName && isComponent(childTagName);
              }).length > 0;

          return !hasChildren;
        });

        if (deepComponents.length > 0) {
          found = true;
          deepComponents.each((_, el) => {
            const $el = ctx(el);
            const tagName = (el as any).tagName;
            const componentName = tagName.replace(/^c-/, '');

            const slots: Record<string, string> = {};
            let defaultContent = '';

            $el.contents().each((_, child) => {
              if (child.type === 'tag') {
                const childEl = child as any;
                const childTagName = childEl.tagName;
                if (childEl.attribs['slot']) {
                  slots[childEl.attribs['slot']] = ctx.html(childEl) || '';
                } else if (childTagName.startsWith('c-slot-')) {
                  const slotName = childTagName.replace(/^c-slot-/, '');
                  slots[slotName] = ctx(childEl).html() || '';
                } else {
                  defaultContent += ctx.html(childEl) || '';
                }
              } else {
                defaultContent += ctx.html(child as any) || '';
              }
            });
            if (defaultContent.trim()) slots['default'] = defaultContent;

            const attribs = (el as any).attribs || {};

            const hashContent =
              componentName + JSON.stringify(attribs) + JSON.stringify(slots);
            const hash = createHash('sha256').update(hashContent).digest('hex');
            const hashKey = `hash_${hash}`;

            data[hashKey] = {
              componentName,
              slots,
              attributes: attribs,
              custom_attributes: {},
            };

            $el.replaceWith(`$#{${hashKey}}`);
          });
        }
      }
    };

    await processInstances($);

    const rootHash = `hash_index_${createHash('sha256').update(pagePath).digest('hex')}`;

    data[rootHash] = {
      componentName: 'page',
      slots: { body: $.html() },
      attributes: {},
      custom_attributes: {},
    };

    return {
      data,
      i18n,
      above_the_fold: {
        own_candidates: Array.from(this.candidates),
        external_refs: [],
      },
    };
  }
}
