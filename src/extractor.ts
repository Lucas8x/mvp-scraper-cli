import DivinePride, { GetMonsterResponse } from 'divine-pride-api-wrapper';
import { createSpinner } from 'nanospinner';
import cluster from 'node:cluster';
import { availableParallelism } from 'node:os';
import path from 'node:path';

import { constants } from './constants';
import {
  downloadAnimatedMvpSprite,
  downloadMapImages,
  downloadMvpSprite,
} from './download';
import { FailedGetMvpData, NoHtmlPage } from './errors';
import { filterMvp } from './filter';
import { makeDir, saveJSON } from './helpers';
import { extractIdsFromHtml, fetchListPageHtml } from './utils';

const numCPUs = availableParallelism();

export class Extractor {
  constructor(
    private api: DivinePride,
    private downloadSprites = false,
    private downloadAnimatedSprites = false,
    private downloadMapImages = false,
    private ignoreEmptySpawns = false,
    private useFilter = false,
    private desiredStats: string[] = []
  ) {}

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
        data = filterMvp(data, this.desiredStats);
      }

      return data;
    } catch (error) {
      throw new FailedGetMvpData(
        error instanceof Error ? error.message : String(error)
      );
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

  private async downloadAllSprites(
    mvpsData: Array<Partial<GetMonsterResponse>>,
    finalPath: string
  ) {
    const spinner = createSpinner(
      `[0/${mvpsData.length}] Downloading Sprites...`
    ).start();

    for (const [index, { id }] of mvpsData.entries()) {
      if (id) {
        try {
          await downloadMvpSprite(id, finalPath);
        } catch (error) {
          continue;
        }
        spinner.update({
          text: `[${index + 1}/${mvpsData.length}] Downloading Sprites...`,
        });
      }
    }

    spinner.success({
      text: 'Successfully Downloaded Sprites.',
    });
  }

  private async downloadAllAnimatedSprites(
    mvpsData: Array<Partial<GetMonsterResponse>>,
    finalPath: string
  ) {
    const spinner = createSpinner(
      `[0/${mvpsData.length}] Downloading Animated Sprites...`
    ).start();

    for (const [index, { id }] of mvpsData.entries()) {
      if (id) {
        try {
          await downloadAnimatedMvpSprite(id, finalPath);
        } catch (error) {
          continue;
        }
        spinner.update({
          text: `[${index + 1}/${
            mvpsData.length
          }] Downloading Animated Sprites...`,
        });
      }
    }

    spinner.success({
      text: 'Successfully Downloaded Animated Sprites.',
    });
  }

  private async downloadAllMapImages(
    mvpsData: Array<Partial<GetMonsterResponse>>,
    finalPath: string
  ) {
    const mapsImages = mvpsData
      .flatMap(({ spawn }) => spawn ?? [])
      .map(({ mapname }) => mapname);

    const mapsLength = mapsImages.length;

    const spinner = createSpinner(
      `[0/${mapsLength}] Downloading Map images...`
    ).start();

    for (const [index, mapname] of mapsImages.entries()) {
      spinner.update({
        text: `[${index}/${mapsLength}] Downloading Map images...`,
      });
      if (mapname) {
        try {
          await downloadMapImages(mapname, finalPath);
        } catch (error) {
          continue;
        }
      }
    }

    spinner.success({
      text: 'Successfully Downloaded Map Images.',
    });
  }

  /**
   * Start the process of extracting mvps data then save as json file.
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
        spinner.update({
          text: `[${index + 1}/${idsLength}] Extracting mvps...`,
        });
        if (!data) continue;
        mvpsData.push(data);
      }

      const jsonPath = path.join(finalPath, constants.jsonFile);
      saveJSON(jsonPath, mvpsData);

      spinner.success({
        text: 'Successfully extracted mvps',
      });

      return mvpsData;
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
      const mvpsData = await this.extract(finalPath);

      if (this.downloadSprites) {
        await makeDir(path.join(finalPath, constants.spritesFolder));
        await this.downloadAllSprites(mvpsData, finalPath);
      }
      if (this.downloadAnimatedSprites) {
        await makeDir(path.join(finalPath, constants.animatedSpritesFolder));
        await this.downloadAllAnimatedSprites(mvpsData, finalPath);
      }
      if (this.downloadMapImages) {
        await makeDir(path.join(finalPath, constants.mapsFolder));
        await this.downloadAllMapImages(mvpsData, finalPath);
      }
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  }
}
