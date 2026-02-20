import * as cheerio from 'cheerio';
import { createHash } from 'node:crypto';
import { ReadStream } from 'node:fs';
import { HTMLParser } from '../types';

export class HtmlParserService implements HTMLParser {
  async createHashFromStream(stream: ReadStream): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = createHash('sha256');
      stream.on('data', (chunk) => hash.update(chunk));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  }

  async createHashFromString(str: string): Promise<string> {
    return createHash('sha256').update(str).digest('hex');
  }

  parse(html: string): cheerio.CheerioAPI {
    // decodeEntities: false prevents $ from becoming &#x24;
    return cheerio.load(html, { xmlMode: true, decodeEntities: false } as any);
  }
}
