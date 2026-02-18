import {
  CRITICAL_CSS_PLACEHOLDER,
  NON_CRITICAL_CSS_PLACEHOLDER,
  NON_CRITICAL_CSS_FILENAME,
} from '../core/types.ts';

export function replacePlaceholders(
  html: string,
  criticalCSS: string,
  nonCriticalCSS: string,
  basePath: string
): string {
  const hasCriticalPlaceholder = html.includes(CRITICAL_CSS_PLACEHOLDER);
  const hasNonCriticalPlaceholder = html.includes(NON_CRITICAL_CSS_PLACEHOLDER);

  const criticalTag = criticalCSS
    ? `<style>${criticalCSS}</style>`
    : '';

  const cssPath = basePath
    ? `${basePath}/${NON_CRITICAL_CSS_FILENAME}`
    : NON_CRITICAL_CSS_FILENAME;

  const nonCriticalTag = nonCriticalCSS
    ? `<link rel="preload" href="${cssPath}" as="style" onload="this.onload=null;this.rel='stylesheet'"><noscript><link rel="stylesheet" href="${cssPath}"></noscript>`
    : '';

  let result = html;

  if (hasCriticalPlaceholder) {
    result = result.replace(CRITICAL_CSS_PLACEHOLDER, criticalTag);
  }

  if (hasNonCriticalPlaceholder) {
    result = result.replace(NON_CRITICAL_CSS_PLACEHOLDER, nonCriticalTag);
  }

  if (!hasCriticalPlaceholder && !hasNonCriticalPlaceholder && (criticalCSS || nonCriticalCSS)) {
    const injection = `${criticalTag}${nonCriticalTag}`;
    if (result.includes('</head>')) {
      result = result.replace('</head>', `${injection}\n</head>`);
    } else if (result.includes('<head>')) {
      result = result.replace('<head>', `<head>\n${injection}`);
    } else {
      result = `${injection}\n${result}`;
    }
  }

  return result;
}
