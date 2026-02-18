export const COMPONENT_PREFIX = 'c-';
export const CRITICAL_CSS_WARN_THRESHOLD = 2048;
export const CRITICAL_CSS_HARD_LIMIT = 4096;
export const CSS_LAYERS = ['global', 'layout', 'components', 'utils'] as const;
export const CRITICAL_CSS_PLACEHOLDER = '$#critical-css';
export const NON_CRITICAL_CSS_PLACEHOLDER = '$#non-critical-css';
export const NON_CRITICAL_CSS_FILENAME = 'styles.css';

export type CSSLayer = (typeof CSS_LAYERS)[number];

export interface BuildConfig {
  srcRoot: string;
  outDir: string;
  cacheDir: string;
  basePath: string;
}

export interface PageEntry {
  relativePath: string;
  absolutePath: string;
}

export interface ComponentRef {
  tagName: string;
  componentName: string;
  attributes: Record<string, string>;
}

export interface ResolvedTemplate {
  componentName: string;
  filePath: string;
  content: string;
}

export interface CandidateDefinition {
  name: string;
  layer: CSSLayer;
  criticalCSS: string | null;
  nonCriticalCSS: string | null;
}

export interface CandidateRegistry {
  candidates: Map<string, CandidateDefinition>;
}

export interface CollectedCSS {
  critical: Map<CSSLayer, string[]>;
  nonCritical: Map<CSSLayer, string[]>;
}

export interface GeneratedCSS {
  css: string;
}

export interface PageBuildResult {
  relativePath: string;
  html: string;
  criticalCSSSize: number;
}

export interface BuildResult {
  pages: PageBuildResult[];
  nonCriticalCSS: string;
}
