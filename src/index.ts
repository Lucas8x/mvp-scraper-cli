import { Command } from 'commander';
import DivinePride, { ServerTypes, Servers } from 'divine-pride-api-wrapper';
import prompts, { PromptObject } from 'prompts';

import { Extractor } from './extractor';
import type { ExtractorConfig } from './types';

import packageJson from '../package.json' assert { type: 'json' };

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
    {
      type: 'toggle',
      name: 'changeServer',
      message: 'Would you like to change server? (default: iRO)',
      initial: false,
      active: 'yes',
      inactive: 'no',
    },
  ];

  const result = await prompts(questions);
  let server: ServerTypes = 'iRO';

  if (result.changeServer) {
    const { modServer } = await prompts({
      type: 'select',
      name: 'modServer',
      message: 'Which server?',
      choices: Servers.map((server) => ({
        title: server,
        value: server,
      })),
      initial: 4,
    });
    server = modServer;
  }

  /*if (result.changeLanguage) {
  }

  const { useFilter } = await prompts({
    type: 'toggle',
    name: 'useFilter',
    message: 'Want to filter some mvp stats?',
    initial: false,
    active: 'yes',
    inactive: 'no',
  });

  if (useFilter) {
    const { stats } = await prompts({
      type: 'multiselect',
      name: 'stats',
      message: 'Which stats do you want to keep?',
      choices: [{ title: '', value: '' }],
    });
  }*/

  return {
    divinePrideApiKey: result.apiKey,
    downloadSprites: result.downloadSprites,
    downloadAnimatedSprites: result.downloadAnimatedSprites,
    downloadMapImages: result.downloadMapImages,
    ignoreEmptySpawns: result.ignoreEmptySpawns,
    useFilter: [].length > 0,
    desiredStats: undefined,
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
    .option('-sv, --server', 'Data from which server', 'iRO')
    .option('-f, --filter <stats...>', 'Filter mvp stats', [])
    .parse(process.argv);

  const options = program.opts();

  if (!options.output) {
    console.log('\nPlease specify the project directory:\n');
    process.exit(1);
  }

  outputPath = options.output;

  return {
    divinePrideApiKey: options.key,
    downloadSprites: options.sprites,
    downloadAnimatedSprites: options.animSprites,
    downloadMapImages: options.map,
    ignoreEmptySpawns: options.ignore,
    useFilter: options.filter.length > 0,
    desiredStats: options.filter,
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
