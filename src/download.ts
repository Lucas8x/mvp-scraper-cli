import fs from 'fs';
import path from 'path';
import { axiosInstance } from './axios';
import {
  FailedAnimatedSpriteDownload,
  FailedMapImageDownload,
  FailedSpriteDownload,
} from './errors';

async function downloadImage(url: string, path) {
  try {
    const { data } = await axiosInstance.get(url);
    const image = Buffer.from(data, 'binary');
    fs.writeFileSync(path, image);
  } catch (error) {
    throw error;
  }
}

export async function downloadMvpSprite(mvpID: string | number): Promise<void> {
  const url = `https://static.divine-pride.net/images/mobs/png/${mvpID}.png`;

  try {
  } catch (error) {
    throw new FailedSpriteDownload('');
  }
}

export async function downloadAnimatedMvpSprite(
  mvpID: string | number
): Promise<void> {
  const url = `https://db.irowiki.org/image/monster/${mvpID}.png`;

  try {
  } catch (error) {
    throw new FailedAnimatedSpriteDownload('');
  }
}

export async function downloadMapImages(mapName: string): Promise<void> {
  const originalMapUrl = `https://www.divine-pride.net/img/map/original/${mapName}`;
  const rawMapUrl = `https://www.divine-pride.net/img/map/raw/${mapName}`;

  try {
  } catch (error) {
    throw new FailedMapImageDownload('');
  }
}
