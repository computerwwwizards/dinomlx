import { readFile } from 'node:fs/promises';
import { COMPONENT_PREFIX } from '../core/types.ts';
import { parseHTML, extractComponents } from './parser.ts';
import { resolveTemplatePathWithOverride } from './resolver.ts';

export async function compileTemplate(html: string, templatesDir: string): Promise<string> {
  return expand(html, templatesDir, new Set());
}

async function expand(html: string, templatesDir: string, visited: Set<string>): Promise<string> {
  const root = parseHTML(html);
  const components = extractComponents(root);

  if (components.length === 0) return root.toString();

  const componentElements = root.querySelectorAll('*').filter((el) => {
    const tag = el.rawTagName?.toLowerCase();
    return tag && tag.startsWith(COMPONENT_PREFIX);
  });

  for (const element of componentElements) {
    const tagName = element.rawTagName.toLowerCase();
    const componentName = tagName.slice(COMPONENT_PREFIX.length);

    if (visited.has(componentName)) {
      throw new Error(
        `Circular component reference detected: ${componentName} (chain: ${[...visited].join(' -> ')} -> ${componentName})`
      );
    }

    const templateSource = element.getAttribute('_c_template-source') || undefined;
    const filePath = await resolveTemplatePathWithOverride(componentName, templatesDir, templateSource);
    const templateContent = await readFile(filePath, 'utf-8');

    const childVisited = new Set(visited);
    childVisited.add(componentName);

    const expandedContent = await expand(templateContent, templatesDir, childVisited);
    element.replaceWith(expandedContent);
  }

  return root.toString();
}
