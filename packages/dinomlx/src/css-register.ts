
import { type Properties } from 'csstype';
import { promises as fs } from 'node:fs';
import { join } from 'node:path';

export type CSSRegisterOptions = {
  raw?: {
    critical?: string;
    deferable?: string
  };
} & {
  critical?: Record<string, Properties>;
  deferable?: Record<string, Properties>;
}

export interface CSSRegister {
  register(candidateName: string, options: CSSRegisterOptions): this;
  save(): Promise<void>;
}

export interface CSSRegisterLayer {
  utils: CSSRegister;
  components: CSSRegister;
  layout: CSSRegister;
  global: CSSRegister;
  save(): Promise<void>;
}

export class CSSRegisterImpl implements CSSRegister {
  private _candidates: Map<string, CSSRegisterOptions> = new Map();
  private layerName: string;
  private layerManager: CSSRegisterLayerImpl;

  constructor(layerName: string, layerManager: CSSRegisterLayerImpl) {
    this.layerName = layerName;
    this.layerManager = layerManager;
  }

  register(candidateName: string, options: CSSRegisterOptions): this {
    this._candidates.set(candidateName, options);
    return this;
  }

  async save(): Promise<void> {
    await this.layerManager.saveLayer(this.layerName, this._candidates);
    this._candidates.clear();
  }

  get candidates(): Map<string, CSSRegisterOptions> {
    return this._candidates;
  }

  clearCandidates(): void {
    this._candidates.clear();
  }
}

export class CSSRegisterLayerImpl implements CSSRegisterLayer {
  utils: CSSRegisterImpl;
  components: CSSRegisterImpl;
  layout: CSSRegisterImpl;
  global: CSSRegisterImpl;

  private lockDir: string;
  private dbFile: string;
  private dinomlxDir: string;

  constructor() {
    this.utils = new CSSRegisterImpl('utils', this);
    this.components = new CSSRegisterImpl('components', this);
    this.layout = new CSSRegisterImpl('layout', this);
    this.global = new CSSRegisterImpl('global', this);

    const cwd = process.cwd();
    this.dinomlxDir = join(cwd, '.dinomlx');
    this.dbFile = join(this.dinomlxDir, 'css-register.json');
    this.lockDir = join(this.dinomlxDir, 'css-register.lock');
  }

  async saveLayer(layerName: string, candidates: Map<string, CSSRegisterOptions>): Promise<void> {
    if (candidates.size === 0) return;

    await this.performSave((currentData) => {
      const layerData = currentData[layerName] || {};
      for (const [key, value] of candidates.entries()) {
        layerData[key] = value;
      }
      currentData[layerName] = layerData;
      return currentData;
    });
  }

  async save(): Promise<void> {
    // Check if there are any candidates to save to avoid unnecessary locking
    if (this.utils.candidates.size === 0 &&
        this.components.candidates.size === 0 &&
        this.layout.candidates.size === 0 &&
        this.global.candidates.size === 0) {
      return;
    }

    await this.performSave((currentData) => {
      this.mergeLayer(currentData, 'utils', this.utils);
      this.mergeLayer(currentData, 'components', this.components);
      this.mergeLayer(currentData, 'layout', this.layout);
      this.mergeLayer(currentData, 'global', this.global);

      this.utils.clearCandidates();
      this.components.clearCandidates();
      this.layout.clearCandidates();
      this.global.clearCandidates();

      return currentData;
    });
  }

  private mergeLayer(data: any, layerName: string, register: CSSRegisterImpl) {
    const candidates = register.candidates;
    if (candidates.size === 0) return;

    const layerData = data[layerName] || {};
    for (const [key, value] of candidates.entries()) {
      layerData[key] = value;
    }
    data[layerName] = layerData;
  }

  private async performSave(updateFn: (data: any) => any): Promise<void> {
    await this.ensureDinomlxDir();
    await this.acquireLock();

    try {
      let currentData: any = {};
      try {
        const fileContent = await fs.readFile(this.dbFile, 'utf-8');
        currentData = JSON.parse(fileContent);
      } catch (error: any) {
        if (error.code !== 'ENOENT') {
          throw error;
        }
        // File doesn't exist, start with empty object
      }

      const newData = updateFn(currentData);

      await fs.writeFile(this.dbFile, JSON.stringify(newData, null, 2));
    } finally {
      await this.releaseLock();
    }
  }

  private async ensureDinomlxDir() {
    try {
      await fs.mkdir(this.dinomlxDir, { recursive: true });
    } catch (e) {
      // Ignore if already exists
    }
  }

  private async acquireLock(retries = 20, delay = 100): Promise<void> {
    for (let i = 0; i < retries; i++) {
      try {
        await fs.mkdir(this.lockDir);
        return;
      } catch (e: any) {
        if (e.code === 'EEXIST') {
          try {
            const stats = await fs.stat(this.lockDir);
            const now = Date.now();
            if (now - stats.mtimeMs > 5000) { // 5 seconds stale threshold
               try {
                 await fs.rmdir(this.lockDir);
                 continue;
               } catch (rmError) {
                 // Someone else might have removed it
               }
            }
          } catch (statError) {
             // Lock dir might have been removed
          }

          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          throw e;
        }
      }
    }
    throw new Error('Could not acquire lock for CSS register');
  }

  private async releaseLock() {
    try {
      await fs.rmdir(this.lockDir);
    } catch (e) {
      // Ignore if already removed
    }
  }
}
