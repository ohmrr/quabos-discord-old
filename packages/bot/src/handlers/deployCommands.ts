import { REST, Routes } from 'discord.js';
import { client } from '../utils/client.js';
import config from '../utils/config.js';
import { utilEmojis } from '../utils/emoji.js';
import logger from '../utils/logger.js';

export default async function deployCommands() {
	if (!client.user) {
		logger.error(`${utilEmojis.error} Error deploying commands, client is not yet ready.`);
		process.exit(1);
	}

	const userId = client.user.id;
	const rest = new REST().setToken(config.token);
	const commands = client.commands.map(command => command.data.toJSON());
	const route =
		config.nodeEnv === 'production'
			? Routes.applicationCommands(userId)
			: Routes.applicationGuildCommands(userId, config.devGuildId!);

	try {
		await rest.put(route, { body: commands });
		logger.info(
			`${utilEmojis.success} Application (/) commands successfully registered to ${config.nodeEnv}.`,
		);
	} catch (error) {
		logger.error(
			error,
			`${utilEmojis.error} Error deploying ${config.nodeEnv === 'production' ? 'global' : 'guild'} `,
		);
		process.exit(1);
	}
}
