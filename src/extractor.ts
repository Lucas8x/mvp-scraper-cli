import DivinePride, {
  GetMonsterResponse,
  Stats,
} from 'divine-pride-api-wrapper';
import { createSpinner } from 'nanospinner';
import cluster from 'node:cluster';
import { PathLike } from 'node:fs';
import { availableParallelism } from 'node:os';
import path from 'path';
import { exit } from 'process';

import {
  downloadAnimatedMvpSprite,
  downloadMapImages,
  downloadMvpSprite,
} from './download';
import { FailedGetMvpData, NoHtmlPage } from './errors';
import { filterMvp } from './filter';
import { isWriteable, saveJSON } from './helpers';
import type { ExtractorConfig } from './types';
import { extractIdsFromHtml, fetchListPageHtml } from './utils';

const numCPUs = availableParallelism();

export class Extractor {
  private api: DivinePride;

  constructor(
    private divinePrideApiKey: string,
    private downloadSprites = false,
    private downloadAnimatedSprites = false,
    private downloadMapImages = false,
    private ignoreEmptySpawns = false,
    private useFilter = false,
    private desiredStats = [] as Partial<Stats>
  ) {
    if (!divinePrideApiKey) {
      console.error('Divine pride api not found, aborting...');
      exit(1);
    }
    this.api = new DivinePride(divinePrideApiKey);
  }

  async getMvpData(
    id: number
  ): Promise<Partial<GetMonsterResponse> | undefined> {
    try {
      let data = await this.api.getMonster(id);
      if (!data || (this.ignoreEmptySpawns && !data.spawn.length)) {
        return;
      }

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

  async extract(outputPath: string) {
    const spinner = createSpinner('Extracting mvp...').start();

    try {
      if (!outputPath) {
        throw new Error('No output path provided');
      }

      if (typeof outputPath === 'string') {
        outputPath = outputPath.trim();
      }

      const root = path.resolve(outputPath);

      if (!(await isWriteable(path.dirname(root)))) {
        console.error('The output path is not writable.');
        exit(1);
      }

      const ids = await this.getAllMvpIds();
      if (!ids || ids.length === 0) {
        throw new Error('No mvp ids');
      }

      const mvpsData: Array<Partial<GetMonsterResponse>> = [];
      for (const id of ids) {
        const data = await this.getMvpData(Number(id));
        if (!data) {
          continue;
        }
        mvpsData.push(data);
      }

      //await saveJSON('', mvpsData);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Unknown error on extracting mvps.';

      spinner.error({
        text: errorMessage,
      });
    }
  }
}
