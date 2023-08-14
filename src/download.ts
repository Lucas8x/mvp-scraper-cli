import fs from 'fs';
import path from 'path';

import { axiosInstance } from './axios.js';
import { constants } from './constants.js';
import {
  FailedAnimatedSpriteDownload,
  FailedMapImageDownload,
  FailedSpriteDownload,
  NoImageData,
} from './errors.js';
import { fileExists } from './helpers.js';

async function downloadImage(url: string, filePath: string) {
  try {
    if (await fileExists(filePath)) {
      return;
    }

    const { data } = await axiosInstance.get(url, {
      responseType: 'arraybuffer',
    });

    if (data.length === 0) {
      throw new NoImageData(
        `Successfully response but ${url} has no image data.`
      );
    }

    const image = Buffer.from(data, 'binary');
    await fs.promises.writeFile(filePath, image);
  } catch (error) {
    throw error;
  }
}

export async function downloadMvpSprite(
  mvpID: string | number,
  outputPath: string
): Promise<void> {
  const fileName = `${mvpID}.png`;
  const url = `https://static.divine-pride.net/images/mobs/png/${fileName}`;

  try {
    const filePath = path.join(outputPath, constants.spritesFolder, fileName);
    await downloadImage(url, filePath);
  } catch (error) {
    throw new FailedSpriteDownload(
      error instanceof Error
        ? `Sprite Download error: ${url} | ${error.message}`
        : 'Unknown error downloading mvp sprite. ${error}'
    );
  }
}

export async function downloadAnimatedMvpSprite(
  mvpID: string | number,
  outputPath: string
): Promise<void> {
  const fileName = `${mvpID}.png`;
  const url = `https://db.irowiki.org/image/monster/${fileName}`;

  try {
    const filePath = path.join(
      outputPath,
      constants.animatedSpritesFolder,
      fileName
    );
    await downloadImage(url, filePath);
  } catch (error) {
    throw new FailedAnimatedSpriteDownload(
      error instanceof Error
        ? `AnimSprite Download error: ${url} | ${error.message}`
        : 'Unknown error downloading animated sprite.'
    );
  }
}

export async function downloadMapImages(
  mapName: string,
  outputPath: string
): Promise<void> {
  const urlFileName = `${mapName}.png`;
  const rawFileName = `${mapName}_raw.png`;

  const originalMapUrl = `https://www.divine-pride.net/img/map/original/${urlFileName}`;
  const rawMapUrl = `https://www.divine-pride.net/img/map/raw/${urlFileName}`;

  const originalFilePath = path.join(
    outputPath,
    constants.mapsFolder,
    urlFileName
  );
  const rawFilePath = path.join(outputPath, constants.mapsFolder, rawFileName);

  try {
    await Promise.all([
      await downloadImage(originalMapUrl, originalFilePath),
      await downloadImage(rawMapUrl, rawFilePath),
    ]);
  } catch (error) {
    throw new FailedMapImageDownload(
      error instanceof Error
        ? `MapImg Download error: ${originalMapUrl};${rawMapUrl} | ${error.message}`
        : 'Unknown error downloading map image.'
    );
  }
}
