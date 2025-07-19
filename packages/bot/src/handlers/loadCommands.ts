import { readdir, stat } from 'fs/promises';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import type Command from '../interfaces/command.js';
import { client } from '../utils/client.js';
import { utilEmojis } from '../utils/emoji.js';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Returns an array of command files. Commands with subcommands
 * or subcommand groups should have a directory named after the
 * main command, as well as a corresponding file.
 *
 * i.e. /config/config.ts
 */
async function getCommandFiles(directory: string): Promise<string[]> {
	const directoryItems = await readdir(directory);

	const fileList = await Promise.all(
		directoryItems.map(async item => {
			const itemPath = path.join(directory, item);
			const itemStat = await stat(itemPath);

			if (itemStat.isDirectory()) {
				return path.join(itemPath, `${item}.js`);
			} else if (itemPath.endsWith('.js')) {
				return itemPath;
			}

			return null;
		}),
	);

	return fileList.filter((file): file is string => file !== null);
}

async function loadCommandFromFile(filePath: string): Promise<void> {
	try {
		const commandUrl = pathToFileURL(filePath).href;
		const { default: commandModule } = await import(commandUrl);
		const command = commandModule as Command;

		if (!command.data || !command.execute) {
			logger.warn(
				filePath,
				`${utilEmojis.error} Command is missing properties. Skipping onto the next file...`,
			);
			return;
		}

		client.commands.set(command.data.name, command);
	} catch (error) {
		logger.error({ err: error, filePath }, `${utilEmojis.error} Failed to fetch command data.`);
	}
}

export default async function loadCommands(): Promise<void> {
	const commandDir = path.join(__dirname, '..', 'commands');
	const commandFiles = await getCommandFiles(commandDir);

	await Promise.all(commandFiles.map(file => loadCommandFromFile(file)));
}
