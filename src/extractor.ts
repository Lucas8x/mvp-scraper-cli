import DivinePride from 'divine-pride-api-wrapper';
import { createSpinner } from 'nanospinner';
import cluster from 'node:cluster';
import { availableParallelism } from 'node:os';
import { exit } from 'process';

import {
  downloadAnimatedMvpSprite,
  downloadMapImages,
  downloadMvpSprite,
} from './download';
import { FailedGetMvpData, NoHtmlPage } from './errors';
import { filterMvp } from './filter';
import { extractIdsFromHtml, fetchListPageHtml, saveJSON } from './utils';

const numCPUs = availableParallelism();

class Extractor {
  private api: DivinePride;

  constructor(
    private divinePrideApiKey: string,
    private downloadSprites = false,
    private downloadAnimatedSprites = false,
    private downloadMapImages = false,
    private ignoreEmptySpawns = false,
    private useFilter = false,
    private desiredStats = []
  ) {
    if (!divinePrideApiKey) {
      console.error('Divine pride api not found, aborting...');
      exit(1);
    }
    this.api = new DivinePride(this.divinePrideApiKey);
  }

  async getMvpData(id: number) {
    try {
      let data = await this.api.getMonster(id);
      if (!data || (this.ignoreEmptySpawns && !data.spawn.length)) return null;

      if (this.useFilter) {
        // @ts-ignore
        data = filterMvp(data);
      }

      if (this.downloadSprites) {
        await downloadMvpSprite(id);
      }

      if (this.downloadAnimatedSprites) {
        await downloadAnimatedMvpSprite(id);
      }

      if (this.downloadMapImages) {
        for (const i of data.spawn) {
          await downloadMapImages(i.mapname);
        }
      }

      return data;
    } catch (error) {
      throw new FailedGetMvpData(String(error));
    }
  }

  async getAllMvpIds(): Promise<string[] | undefined> {
    const spinner = createSpinner('Getting mvp ids...').start();

    try {
      let ids: string[] = [];
      const totalPages = 2; //TODO: detect on page

      await new Promise((r) => setTimeout(r, 2000));

      for (let i = 1; i <= totalPages; i++) {
        const pageHtml = await fetchListPageHtml(i);
        if (!pageHtml) return;

        const pageIds = extractIdsFromHtml(pageHtml);
        ids = ids.concat(pageIds);
      }

      if (!ids || !ids.length) throw new Error('No mvp ids found.');
      const uniqueIds = [...new Set(ids)];

      spinner.success({
        text: `Successfully found ${uniqueIds.length} mvp ids.`,
      });

      return uniqueIds;
    } catch (error) {
      const errorMessage =
        error instanceof NoHtmlPage
          ? "Couldn't get some mvp ids."
          : error instanceof Error
          ? error.message
          : 'Unknown error on getting mvp ids.';

      spinner.error({
        text: errorMessage,
      });
    }
  }

  async extract(outputPath) {
    try {
      if (!outputPath) throw new Error('No output path provided');

      if (typeof outputPath === 'string') {
        outputPath = outputPath.trim();
      }

      const ids = await this.getAllMvpIds();
      const mvpsData = [];
    } catch (error) {
      throw error;
    }
  }
}

export { Extractor };
export default Extractor;

const x = new Extractor('123');
x.extract('');
