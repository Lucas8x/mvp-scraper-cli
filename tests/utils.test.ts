import nock from 'nock';
import fs from 'node:fs';
import path from 'node:path';

import { fetchListPageHtml, extractIdsFromHtml } from '../src/utils';

const HTMLPageSample = fs.readFileSync(
  path.join(__dirname, './sample/listPage.html'),
  {
    encoding: 'utf8',
  }
);

describe('Utils', () => {
  beforeAll(() => {
    nock.disableNetConnect();
  });

  beforeEach(() => {
    nock.cleanAll();
  });

  it('Should get a html page as string', async () => {
    expect.assertions(1);
    const PAGE_NUMBER = 1;

    const scope = nock('https://www.divine-pride.net')
      .get('/database/monster')
      .query({
        Flag: 4,
        Page: PAGE_NUMBER,
      })
      .reply(200, HTMLPageSample);

    const pageHtml = await fetchListPageHtml(PAGE_NUMBER);

    expect(typeof pageHtml).toBe('string');
    scope.done();
  });

  it('Should throw error on fail get html page', async () => {
    const PAGE_NUMBER = 1;

    const scope = nock('https://www.divine-pride.net')
      .get('/database/monster')
      .query({
        Flag: 4,
        Page: PAGE_NUMBER,
      })
      .reply(404, '<html><head></head></html>');

    const expectedErrorMessage = `Couldn't fetch list page number: ${PAGE_NUMBER}`;

    await expect(fetchListPageHtml(PAGE_NUMBER)).rejects.toThrow(Error);

    await fetchListPageHtml(PAGE_NUMBER).catch((e) =>
      expect(String(e)).toMatch(expectedErrorMessage)
    );
    scope.done();
  });

  it('Should throw error when page number is undefined', async () => {
    expect.assertions(1);
    const expectedErrorMessage =
      "NoHtmlPage: Couldn't fetch list page number: undefined";

    try {
      await fetchListPageHtml(undefined);
    } catch (error) {
      expect(String(error)).toMatch(expectedErrorMessage);
    }
  });

  it('Should throw error when try fetch page with a number less than zero', async () => {
    expect.assertions(1);
    const PAGE_NUMBER = -2;
    const expectedErrorMessage = `Couldn't fetch list page number: ${PAGE_NUMBER}`;

    try {
      await fetchListPageHtml(PAGE_NUMBER);
    } catch (error) {
      expect(String(error)).toMatch(expectedErrorMessage);
    }
  });

  it('Should return a array of mvp ids', async () => {
    expect.assertions(2);
    const PAGE_NUMBER = 1;

    const scope = nock('https://www.divine-pride.net')
      .get('/database/monster')
      .query({
        Flag: 4,
        Page: PAGE_NUMBER,
      })
      .reply(200, HTMLPageSample);

    const pageHtml = await fetchListPageHtml(PAGE_NUMBER);
    const ids = extractIdsFromHtml(pageHtml);

    expect(ids).toBeInstanceOf(Array);
    expect(ids).toContain('1147');
    scope.done();
  });

  it('Should return a empty array of mvp ids', () => {
    expect.assertions(2);

    const ids = extractIdsFromHtml('<html><head></head></html>');

    expect(ids).toBeInstanceOf(Array);
    expect(ids).toHaveLength(0);
  });
});
