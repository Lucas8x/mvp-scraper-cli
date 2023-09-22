import fs from 'node:fs';
import path from 'node:path';

import { saveJSON, makeDir } from '../src/helpers';

const tempOutputTestFolder = path.resolve(__dirname, 'test_folder');

function deleteOutputTestFolder() {
  if (fs.existsSync(tempOutputTestFolder)) {
    fs.rmSync(tempOutputTestFolder, { recursive: true });
  }
}

describe('Helpers - makeDir', () => {
  beforeEach(deleteOutputTestFolder);
  afterAll(deleteOutputTestFolder);

  it('Should successfully create a folder', async () => {
    await makeDir(tempOutputTestFolder);
    expect(fs.existsSync(tempOutputTestFolder)).toBe(true);
  });

  it('Should not throw error if folder already exists', async () => {
    await makeDir(tempOutputTestFolder);
    await makeDir(tempOutputTestFolder);
    expect(fs.existsSync(tempOutputTestFolder)).toBe(true);
  });
});

describe('Helpers - writeJSON', () => {
  const testJsonFilePath = path.resolve(
    tempOutputTestFolder,
    'test_json_file.json'
  );

  beforeAll(async () => {
    await makeDir(tempOutputTestFolder);
  });

  beforeEach(() => {
    if (fs.existsSync(testJsonFilePath)) {
      fs.unlinkSync(testJsonFilePath);
    }
  });

  afterAll(deleteOutputTestFolder);

  const data = [
    {
      id: 1087,
      dbname: 'ORK_HERO',
      name: 'Orc Herói',
    },
  ];

  it('Should save data array in JSON file', async () => {
    await saveJSON(testJsonFilePath, data);
    expect(fs.existsSync(testJsonFilePath)).toBe(true);
  });

  it('Should save/read JSON file and data match', async () => {
    saveJSON(testJsonFilePath, data);

    const fileData = await fs.promises.readFile(testJsonFilePath, {
      encoding: 'utf-8',
    });

    expect(JSON.parse(fileData)).toMatchObject(data);
  });
});
