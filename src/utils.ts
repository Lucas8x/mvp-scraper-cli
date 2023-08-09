import * as cheerio from 'cheerio';
import axios from 'axios';
import fs from 'fs';

import { NoHtmlPage } from './errors';

export async function fetchListPageHtml(
  pageNumber: number
): Promise<string | undefined> {
  try {
    return fs.readFileSync('G:/_CODING_/RAGNAROK/node-version/a.txt', {
      encoding: 'utf8',
    });
    if (!pageNumber) throw new Error('Page number is required');
    const url = `https://www.divine-pride.net/database/monster?Flag=4&Page=${pageNumber}`;
    const { data } = await axios.get(url);
    return data;
  } catch (error) {
    throw new NoHtmlPage(`Couldn't fetch list page number: ${pageNumber}`);
  }
}

export function extractIdsFromHtml(html: string): string[] {
  try {
    if (!html) throw new Error('Html is required.');

    const $ = cheerio.load(html, null, false);
    let ids: string[] = [];

    $('tbody tr .mvp span a').each((_, element) => {
      const href = $(element).attr('href');
      if (!href) return;
      const id = href.split('/', 4)[3];
      ids.push(id);
    });

    return ids;
  } catch (error) {
    return [];
  }
}
