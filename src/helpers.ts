import fs from 'fs';

export function saveJSON(directory: string, data: any) {
  const stringifiedData = JSON.stringify(data, null, 2);
  fs.promises.writeFile(directory, stringifiedData);

  fs.writeFile(directory, stringifiedData, 'utf8', (err) => {
    if (err) throw err;
  });
}

export function makeDir(
  root: string,
  options = { recursive: true }
): Promise<string | undefined> {
  return fs.promises.mkdir(root, options);
}

export async function fileExists(filePath: string) {
  try {
    await fs.promises.access(filePath);
    return true;
  } catch (error) {
    return false;
  }
}
