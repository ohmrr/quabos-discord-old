import { Collection, type ChatInputCommandInteraction } from 'discord.js';
import type Command from '../interfaces/command.js';
import { utilEmojis } from './emoji.js';

export default async function handleCooldown(
	interaction: ChatInputCommandInteraction,
	command: Command,
): Promise<boolean> {
	const { cooldowns } = interaction.client;
	const commandName = command.data.name;
	const userId = interaction.user.id;

	if (!cooldowns.has(commandName)) cooldowns.set(commandName, new Collection());

	const now = Date.now();
	const timestamps = cooldowns.get(commandName);
	const defaultCooldownAmount = 3;
	const cooldownAmount = (command.cooldown ?? defaultCooldownAmount) * 1_000;

	if (!timestamps) return false;
	const fetchedTime = timestamps.get(userId);

	if (!fetchedTime) return false;
	const expiration = fetchedTime + cooldownAmount;

	if (now < expiration) {
		const timeLeft = Math.ceil((expiration - now) / 1_000);
		const msg = `Please wait, you are still on cooldown for ${timeLeft} ${timeLeft === 1 ? 'second' : 'seconds'}.`;

		await interaction.reply({
			content: `${utilEmojis.error} ${msg}`,
			flags: 'Ephemeral',
		});
		return true;
	}

	timestamps.set(userId, now);
	setTimeout(() => {
		timestamps.delete(userId);
	}, cooldownAmount);

	return false;
}
