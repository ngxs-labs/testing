import { join } from 'path';
import { promisify } from 'util';
import { argv } from 'yargs';
import * as fs from 'fs';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

class InvalidCreateProjectArguments extends Error {
  constructor() {
    super('You have to run command using appropriate format - "yarn create-project --name $PROJECT_NAME"');
  }
}

async function main() {
  const name = argv.name as string | undefined;

  if (typeof name !== 'string' || name.length < 5) {
    throw new InvalidCreateProjectArguments();
  }

  const filesToUpdate = [
    'package.json',
    'angular.json',
    'src/package.json',
    'devops/definitions.sh'
  ];

  for (const file of filesToUpdate) {
    const path = join(__dirname, '..', file);
    const content = await readFile(path, { encoding: 'utf-8' });

    await writeFile(
      path,
      content.replace(/skeleton/g, name)
    );
  }
}

main();
