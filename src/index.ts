import { Command } from 'commander';
import path from 'node:path';
import { cwd } from 'node:process';
import prompts, { PromptObject } from 'prompts';

import packageJson from '../package.json' assert { type: 'json' };
import { Extractor } from './extractor';
import type { ExtractorConfig } from './types';

let outputPath: string = '';

async function interactiveCLI() {
  const questions: PromptObject[] = [
    {
      type: 'password',
      name: 'apiKey',
      message: 'Please provide your divine pride api key',
    },
    {
      type: 'toggle',
      name: 'downloadSprites',
      message: 'Download sprites?',
      initial: false,
      active: 'yes',
      inactive: 'no',
    },
    {
      type: 'toggle',
      name: 'downloadAnimatedSprites',
      message: 'Download animated sprites?',
      initial: false,
      active: 'yes',
      inactive: 'no',
    },
    {
      type: 'toggle',
      name: 'downloadMapImages',
      message: 'Download map images?',
      initial: false,
      active: 'yes',
      inactive: 'no',
    },
    {
      type: 'toggle',
      name: 'ignoreEmptySpawns',
      message: 'Ignore mvp with no spawn locations?',
      initial: false,
      active: 'yes',
      inactive: 'no',
    },
    /* {
      type: 'toggle',
      name: 'changeLanguage',
      message: 'Would you like to change language?',
      initial: false,
      active: 'yes',
      inactive: 'no',
    },
    {
      type: 'toggle',
      name: 'changeServer',
      message: 'Would you like to change server?',
      initial: false,
      active: 'yes',
      inactive: 'no',
    }, */
  ];

  const result = await prompts(questions);
  console.log(result);

  if (result.changeLanguage) {
  }

  return result;
}

function cli() {
  const program = new Command(packageJson.name)
    .version(packageJson.version)
    .option('-o, --output', 'Download sprites')
    .option('--sprites', 'Download sprites')
    .option('--anim-sprites', 'Save animated sprites')
    .option('--map', 'Save map images')
    .option('--anim-sprites', 'Ignore mvp with no spawn locations')
    .parse(process.argv);
}

async function init(options: ExtractorConfig) {
  const {
    divinePrideApiKey,
    downloadSprites,
    downloadAnimatedSprites,
    downloadMapImages,
    ignoreEmptySpawns,
    useFilter,
    desiredStats,
  } = options;
  const extractor = new Extractor(
    divinePrideApiKey,
    downloadSprites,
    downloadAnimatedSprites,
    downloadMapImages,
    ignoreEmptySpawns,
    useFilter,
    desiredStats
  );
  //await extractor.extract();
}

export async function main() {
  const hasArgs = process.argv.length > 2;
  const options = hasArgs ? cli() : await interactiveCLI();
  //init({});
}

main();
