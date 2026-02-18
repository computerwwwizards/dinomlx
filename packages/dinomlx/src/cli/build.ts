import { resolveConfig } from '../core/config.ts';
import { runBuildPipeline } from '../pipeline/build-pipeline.ts';

interface BuildOptions {
  srcRoot?: string;
  outDir?: string;
  cacheDir?: string;
  basePath?: string;
}

export async function buildCommand(options: BuildOptions): Promise<void> {
  const cwd = process.cwd();
  const config = await resolveConfig(cwd, options);
  await runBuildPipeline(config);
}
