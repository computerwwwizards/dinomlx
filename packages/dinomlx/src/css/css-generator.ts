import { transform } from 'lightningcss';
import { CSS_LAYERS, type CSSLayer, type GeneratedCSS } from '../core/types.ts';

export function generateCSS(cssByLayer: Map<CSSLayer, string[]>): GeneratedCSS {
  const layerDeclaration = `@layer ${CSS_LAYERS.join(', ')};`;
  const layerBlocks: string[] = [];

  for (const layer of CSS_LAYERS) {
    const cssChunks = cssByLayer.get(layer);
    if (!cssChunks || cssChunks.length === 0) continue;
    layerBlocks.push(`@layer ${layer} {\n${cssChunks.join('\n')}\n}`);
  }

  if (layerBlocks.length === 0) {
    return { css: '' };
  }

  const raw = `${layerDeclaration}\n${layerBlocks.join('\n')}`;
  const minified = minifyCSS(raw);
  return { css: minified };
}

function minifyCSS(css: string): string {
  if (!css.trim()) return '';

  const result = transform({
    filename: 'styles.css',
    code: Buffer.from(css),
    minify: true,
  });

  return result.code.toString();
}
