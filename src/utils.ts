import { URL } from 'node:url';
import * as cheerio from 'cheerio';

import { axiosInstance } from './axios';
import { NoHtmlPage } from './errors';

export function getTotalPagination(html: string): number {
  let pageNumber = 1;

  try {
    if (!html) throw new Error('Html is required.');

    const $ = cheerio.load(html, null, false);
    const items = $('.page-link');

    items.each((_, element) => {
      const text = $(element).text();
      const isLastItem = text && text.toLowerCase() === 'last';

      if (isLastItem) {
        const href = $(element).attr('href').toLowerCase();
        const number = new URL(
          href,
          'https://www.divine-pride.net'
        ).searchParams.get('page');
        pageNumber = parseInt(number);
      }
    });

    return pageNumber;
  } catch (error) {
    return pageNumber;
  }
}

export async function fetchListPageHtml(
  pageNumber: number
): Promise<string | undefined> {
  try {
    if (!pageNumber) throw new Error('Page number is required');
    if (pageNumber < 0)
      throw new Error('Page number must be greater than zero');
    const url = `https://www.divine-pride.net/database/monster?Flag=4&Page=${pageNumber}`;
    const { data } = await axiosInstance.get(url);
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
