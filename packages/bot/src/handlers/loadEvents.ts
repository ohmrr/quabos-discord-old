import { readdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import createEvent from '../interfaces/event.js';
import { client } from '../utils/client.js';
import { utilEmojis } from '../utils/emoji.js';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function loadEventFromFile(filePath: string): Promise<void> {
  try {
    const moduleUrl = pathToFileURL(filePath).href;
    const { default: eventModule } = await import(moduleUrl);

    if (!eventModule.name || !eventModule.execute) {
      logger.warn(
        { filePath },
        `${utilEmojis.error} Event is missing properties. Skipping onto the next file...`,
      );
      return;
    }

    const event = createEvent(eventModule.name, eventModule.once, eventModule.execute);
    if (event.once) client.once(event.name, (...params) => event.execute(...params));
    else client.on(event.name, (...params) => event.execute(...params));
  } catch (error) {
    logger.error(
      { err: error, filePath },
      `${utilEmojis.error} Error initializing an event listener.`,
    );
  }
}

export default async function loadEvents(): Promise<void> {
  const eventDir = path.join(__dirname, '..', 'events');
  const eventFiles = (await readdir(eventDir)).filter(file => file.endsWith('.js'));

  await Promise.all(
    eventFiles.map(file => {
      const filePath = path.join(eventDir, file);
      return loadEventFromFile(filePath);
    }),
  );
}
