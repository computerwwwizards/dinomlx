import { createHash } from 'node:crypto';
import { type ReadStream } from 'node:fs';
import * as cheerio from 'cheerio';
import type { HTMLParser } from '../types';

export class CheerioHTMLParser implements HTMLParser {
  async createHashFromStream(stream: ReadStream): Promise<string> {
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    const content = Buffer.concat(chunks).toString('utf-8');
    return this.createHashFromString(content);
  }

  async createHashFromString(string: string): Promise<string> {
    // Using xmlMode as requested ("xml query language") to parse and normalize
    const $ = cheerio.load(string, { xmlMode: true });
    const normalized = $.html();
    const hash = createHash('sha256');
    hash.update(normalized);
    return hash.digest('hex');
  }
}
