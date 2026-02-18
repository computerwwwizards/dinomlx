import { parse, type HTMLElement } from 'node-html-parser';
import { COMPONENT_PREFIX, type ComponentRef } from '../core/types.ts';

export function parseHTML(html: string): HTMLElement {
  return parse(html, { comment: true });
}

export function extractComponents(root: HTMLElement): ComponentRef[] {
  const components: ComponentRef[] = [];
  walkNodes(root, components);
  return components;
}

function walkNodes(node: HTMLElement, components: ComponentRef[]): void {
  if (!node.childNodes) return;

  for (const child of node.childNodes) {
    if (!isHTMLElement(child)) continue;
    const tagName = child.rawTagName?.toLowerCase();
    if (tagName && tagName.startsWith(COMPONENT_PREFIX)) {
      const componentName = tagName.slice(COMPONENT_PREFIX.length);
      const attributes: Record<string, string> = {};
      for (const [key, value] of Object.entries(child.attributes)) {
        attributes[key] = value;
      }
      components.push({ tagName, componentName, attributes });
    }
    walkNodes(child, components);
  }
}

function isHTMLElement(node: unknown): node is HTMLElement {
  return node !== null && typeof node === 'object' && 'rawTagName' in (node as HTMLElement);
}
