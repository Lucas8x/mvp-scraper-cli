#!/usr/bin/env node
import { Command } from 'commander';
import DivinePride, { ServerTypes, Servers } from 'divine-pride-api-wrapper';
import prompts, { PromptObject } from 'prompts';
import packageJson from '../package.json';
import { StatsList } from './constants.js';
import { Extractor } from './extractor.js';
import type { ExtractorConfig } from './types.js';

let outputPath: string = process.cwd();

interface Config extends ExtractorConfig {
  server: ServerTypes;
}

async function interactiveCLI(): Promise<Config> {
  const questions: PromptObject[] = [
    {
      type: 'password',
      name: 'apiKey',
      message: 'Please provide your divine pride api key',
      validate: (key) =>
        !key.length ? 'The api key is required to continue' : true,
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
  ];

  const result = await prompts(questions);

  const { changeServer } = await prompts({
    type: 'toggle',
    name: 'changeServer',
    message: 'Would you like to change server? (default: iRO)',
    initial: false,
    active: 'yes',
    inactive: 'no',
  });

  if (changeServer) {
    var { server } = await prompts({
      type: 'select',
      name: 'server',
      message: 'Which server?',
      choices: Servers.map((server) => ({
        title: server,
        value: server,
      })),
      initial: 4,
    });
  }

  //if (result.changeLanguage) {}

  const { useFilter } = await prompts({
    type: 'toggle',
    name: 'useFilter',
    message: 'Want to filter mvp?',
    initial: false,
    active: 'yes',
    inactive: 'no',
  });

  if (useFilter) {
    var { desiredStats } = await prompts({
      type: 'multiselect',
      name: 'desiredStats',
      message: 'Which stats do you want to keep?',
      choices: StatsList.map((stats) => ({
        title: stats,
        value: stats,
      })),
    });
  }

  return {
    divinePrideApiKey: result.apiKey,
    downloadSprites: result.downloadSprites,
    downloadAnimatedSprites: result.downloadAnimatedSprites,
    downloadMapImages: result.downloadMapImages,
    ignoreEmptySpawns: result.ignoreEmptySpawns,
    useFilter,
    desiredStats,
    server,
  };
}

function cli(): Config {
  const program = new Command(packageJson.name)
    .version(packageJson.version)
    .requiredOption('-k, --key <key>', 'Your divine pride api key')
    .requiredOption('-o, --output <output>', 'Where to write output')
    .option('-s, --sprites', 'Save sprites', false)
    .option('-as, --anim-sprites', 'Save animated sprites', false)
    .option('-m, --map', 'Save map images', false)
    .option('-i, --ignore', 'Ignore mvp with no spawn locations', false)
    .option('-sv, --server <server>', 'Data from which server', 'iRO')
    .option('-f, --filter', 'Filter mvp', false)
    .option('--stats <stats...>', 'Filter mvp stats', [])
    .parse(process.argv);

  const options = program.opts();

  if (!options.output) {
    console.log('\nPlease specify the project directory:\n');
    process.exit(1);
  }

  if (!Servers.includes(options.server)) {
    console.warn(
      "The defined server isn't on valid server list, the api will probably return data from iRO."
    );
  }

  outputPath = options.output;

  return {
    divinePrideApiKey: options.key,
    downloadSprites: options.sprites,
    downloadAnimatedSprites: options.animSprites,
    downloadMapImages: options.map,
    ignoreEmptySpawns: options.ignore,
    useFilter: options.filter,
    desiredStats: options.stats,
    server: options.server,
  };
}

export async function main() {
  const hasArgs = process.argv.length > 2;
  const {
    divinePrideApiKey,
    downloadSprites,
    downloadAnimatedSprites,
    downloadMapImages,
    ignoreEmptySpawns,
    useFilter,
    desiredStats,
    server,
  } = hasArgs ? cli() : await interactiveCLI();

  if (!divinePrideApiKey) {
    console.error('Divine pride api not found, aborting...');
    process.exit(1);
  }

  const api = new DivinePride(divinePrideApiKey, server);

  const extractor = new Extractor(
    api,
    downloadSprites,
    downloadAnimatedSprites,
    downloadMapImages,
    ignoreEmptySpawns,
    useFilter,
    desiredStats
  );

  await extractor.init(outputPath);
}

main();
