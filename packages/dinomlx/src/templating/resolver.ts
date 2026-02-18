import { access } from 'node:fs/promises';
import { join } from 'node:path';

export function resolveTemplatePath(componentName: string, templatesDir: string): string {
  const segments = componentName.split('-');
  const fileName = segments.pop()!;
  const dirPath = segments.length > 0 ? join(templatesDir, ...segments) : templatesDir;
  return join(dirPath, `${fileName}.html`);
}

export async function resolveTemplatePathWithOverride(
  componentName: string,
  templatesDir: string,
  templateSourceOverride: string | undefined
): Promise<string> {
  if (templateSourceOverride) {
    const overridePath = join(templatesDir, templateSourceOverride);
    await access(overridePath).catch(() => {
      throw new Error(
        `Template source override not found: ${overridePath} (from _c_template-source="${templateSourceOverride}")`
      );
    });
    return overridePath;
  }

  const resolved = resolveTemplatePath(componentName, templatesDir);
  await access(resolved).catch(() => {
    throw new Error(
      `Template not found for component "${componentName}": expected at ${resolved}`
    );
  });
  return resolved;
}
