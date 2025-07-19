import { ActivityType } from 'discord.js';
import createEvent from '../interfaces/event.js';
import logger from '../utils/logger.js';
import { utilEmojis } from '../utils/emoji.js';

export default createEvent('ready', false, async client => {
	const wordArt = `   ____              __              
  / __ \\__  ______ _/ /_  ____  _____
 / / / / / / / __ \`/ __ \\/ __ \\/ ___/
/ /_/ / /_/ / /_/ / /_/ / /_/ (__  ) 
\\___\\_\\__,_/\\__,_/_.___/\\____/____/\n`;

	logger.info(`\n${wordArt}`);
	logger.info(`Quabos ${client.version}`);
	logger.info(
		`${utilEmojis.success} Logged in as ${client.user.tag} in ${client.guilds.cache.size} servers.`,
	);

	const guildSize = client.guilds.cache.size;
	client.user.setPresence({
		status: 'online',
		activities: [
			{
				type: ActivityType.Watching,
				name: `${guildSize} servers`,
			},
		],
	});
});
