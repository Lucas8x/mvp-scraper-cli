import fs from 'fs';

export async function saveJSON(path: fs.PathOrFileDescriptor, data: any) {
  const stringifiedData = JSON.stringify(data, null, 2);
  fs.writeFile(path, stringifiedData, 'utf8', (err) => {
    if (err) throw err;
  });
}

export async function isWriteable(directory: string): Promise<boolean> {
  try {
    await fs.promises.access(directory, (fs.constants || fs).W_OK);
    return true;
  } catch (err) {
    return false;
  }
}
