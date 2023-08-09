import prompts, { PromptObject } from 'prompts';
import Commander from 'commander';
import { cwd } from 'node:process';
import path from 'node:path';

import { Extractor } from './extractor';

import packageJson from '../package.json';

let outputPath: string = '';

interface Options {}

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
  const program = new Commander.Command(packageJson.name)
    .version(packageJson.version)
    .option('-o, --output', 'Download sprites')
    .option('--sprites', 'Download sprites')
    .option('--anim-sprites', 'Save animated sprites')
    .option('--map', 'Save map images')
    .option('--anim-sprites', 'Ignore mvp with no spawn locations')
    .parse(process.argv);
}

async function init(options: Options) {
  const extractor = new Extractor('');
  //await extractor.extract();
}

async function main() {
  const hasArgs = process.argv.length > 2;
  const options = hasArgs ? cli() : await interactiveCLI();
  init({});
}

main();
