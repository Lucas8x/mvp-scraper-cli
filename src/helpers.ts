import fs from 'node:fs/promises';

export function saveJSON(directory: string, data: any) {
  const stringifiedData = JSON.stringify(data, null, 2);

  return fs.writeFile(directory, stringifiedData, {
    encoding: 'utf-8',
  });
}

export function makeDir(
  root: string,
  options = { recursive: true }
): Promise<string | undefined> {
  return fs.mkdir(root, options);
}

export async function fileExists(filePath: string) {
  try {
    await fs.access(filePath);
    return true;
  } catch (error) {
    return false;
  }
}
