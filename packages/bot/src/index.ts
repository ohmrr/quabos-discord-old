import deployCommands from './handlers/deployCommands.js';
import loadCommands from './handlers/loadCommands.js';
import loadEvents from './handlers/loadEvents.js';
import { client, prisma } from './utils/client.js';
import config from './utils/config.js';
import { utilEmojis } from './utils/emoji.js';
import logger from './utils/logger.js';

function exitWithError(message: string) {
	logger.error(`${utilEmojis.error} ${message}`);
	process.exit(1);
}

async function init() {
	const [db, events, commands] = await Promise.allSettled([
		prisma.$connect(),
		loadEvents(),
		loadCommands(),
	]);

	if (db.status === 'rejected') return exitWithError('Failed to connect to database.');
	if (events.status === 'rejected') return exitWithError('Failed to load client events.');
	if (commands.status === 'rejected') return exitWithError('Failed to load client commands.');

	try {
		await client.login(config.token);
		await deployCommands();
	} catch (error) {
		logger.error(error, `${utilEmojis.error} Failed to connect to database and initialize client.`);
		process.exit(1);
	}
}

await init();
