import DivinePride, {
  GetMonsterResponse,
  Stats,
} from 'divine-pride-api-wrapper';
import { createSpinner } from 'nanospinner';
import cluster from 'node:cluster';
import { availableParallelism } from 'node:os';
import path from 'path';

import { constants } from './constants';
import {
  downloadAnimatedMvpSprite,
  downloadMapImages,
  downloadMvpSprite,
} from './download';
import { FailedGetMvpData, NoHtmlPage } from './errors';
import { filterMvp } from './filter';
import { makeDir, saveJSON } from './helpers';
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
      process.exit(1);
    }
    this.api = new DivinePride(divinePrideApiKey);
  }

  private async getMvpData(
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

      return data;
    } catch (error) {
      throw new FailedGetMvpData(String(error));
    }
  }

  private async getAllMvpIds(): Promise<string[] | undefined> {
    const spinner = createSpinner('Getting mvp ids...').start();

    try {
      let ids: string[] = [];
      const totalPages = 2; //TODO: detect on page

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

  /**
   * Start the process of extracting mvps data,images.
   * @param {string} finalPath - where the output folder will be created
   * @memberof Extractor
   */
  private async extract(finalPath: string) {
    const spinner = createSpinner('Extracting mvps...').start();

    try {
      const ids = await this.getAllMvpIds();
      const idsLength = ids?.length;
      if (!ids || idsLength === 0) {
        throw new Error('No mvp ids');
      }

      const mvpsData: Array<Partial<GetMonsterResponse>> = [];
      for (const [index, id] of ids.entries()) {
        const data = await this.getMvpData(Number(id));
        if (!data) {
          continue;
        }
        spinner.update({
          text: `[${index + 1}/${idsLength}] Extracting mvps...`,
        });
        mvpsData.push(data);
      }

      const jsonPath = path.join(finalPath, constants.jsonFile);
      saveJSON(jsonPath, mvpsData);

      spinner.success({
        text: 'Successfully extracted mvps',
      });

      const mvpsLength = mvpsData.length;
      const mvpsEntries = mvpsData.entries();

      if (this.downloadSprites) {
        const spinner = createSpinner(
          `[0/${mvpsLength}] Downloading Sprites...`
        ).start();

        for (const [index, { id }] of mvpsEntries) {
          if (id) {
            await downloadMvpSprite(id, finalPath);
            spinner.update({
              text: `[${index + 1}/${mvpsLength}] Downloading Sprites...`,
            });
          }
        }

        spinner.success({
          text: 'Successfully Downloaded Sprites.',
        });
      }

      if (this.downloadAnimatedSprites) {
        const spinner = createSpinner(
          `[0/${mvpsLength}] Downloading Animated Sprites...`
        ).start();

        for (const [index, { id }] of mvpsEntries) {
          if (id) {
            await downloadAnimatedMvpSprite(id, finalPath);
            spinner.update({
              text: `[${
                index + 1
              }/${mvpsLength}] Downloading Animated Sprites...`,
            });
          }
        }

        spinner.success({
          text: 'Successfully Downloaded Animated Sprites.',
        });
      }

      if (this.downloadMapImages) {
        const mapsImages = mvpsData
          .flatMap(({ spawn }) => spawn ?? [])
          .map(({ mapname }) => mapname);

        const mapsLength = mapsImages.length;

        const spinner = createSpinner(
          `[0/${mapsLength}] Downloading Map images...`
        ).start();

        for (const [index, mapname] of mapsImages) {
          spinner.update({
            text: `[${index}/${mapsLength}] Downloading Map images...`,
          });
          if (mapname) {
            await downloadMapImages(mapname, finalPath);
          }
        }

        spinner.success({
          text: 'Successfully Downloaded Map Images.',
        });
      }
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

  /**
   * Create folders, transform paths then start extraction process.
   * @param {string} outputPath - where the output folder will be created
   * @memberof Extractor
   */
  async init(outputPath: string) {
    try {
      if (!outputPath) {
        throw new Error('No output path provided');
      }

      if (typeof outputPath === 'string') {
        outputPath = outputPath.trim();
      }

      const root = path.resolve(outputPath);
      const finalPath = path.join(root, constants.outputFolder);

      await makeDir(finalPath);

      if (this.downloadSprites) {
        await makeDir(path.join(finalPath, constants.spritesFolder));
      }
      if (this.downloadAnimatedSprites) {
        await makeDir(path.join(finalPath, constants.animatedSpritesFolder));
      }
      if (this.downloadMapImages) {
        await makeDir(path.join(finalPath, constants.mapsFolder));
      }

      this.extract(finalPath);
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  }
}
