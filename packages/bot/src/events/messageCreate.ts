import createEvent from '../interfaces/event.js';
import { prisma } from '../utils/client.js';
import { getRandomCelestialEmoji, utilEmojis } from '../utils/emoji.js';
import logger from '../utils/logger.js';
import { generateResponse, saveMessage } from '../utils/markov.js';

export default createEvent('messageCreate', false, async message => {
	if (!message.guild || !message.channel) return;
	if (message.author.bot || message.author.system) return;

	if (message.content.toLowerCase().includes('quabos')) {
		message.react(getRandomCelestialEmoji());
	}

	// const client = message.client;
	const guildId = message.guild.id;
	const guildRecord = await prisma.guild.findUnique({
		where: { id: guildId },
		include: { channels: true },
	});
	if (!guildRecord) return;

	if (guildRecord.channels.some(channel => channel.id === message.channel.id)) {
		await saveMessage(message);
	}

	// const { guildInactivityTimers } = client;
	// const existingTrigger = guildInactivityTimers.get(guildId);
	// if (existingTrigger) clearTimeout(existingTrigger.timeoutId);

	// if (guildRecord.inactivityTrigger && guildRecord.inactivityThreshold) {
	//   const thresholdMilliseconds = guildRecord.inactivityThreshold * 60 * 1000;
	//   const timeoutId = setTimeout(async () => {
	//     await inactivityResponse(message);
	//     guildInactivityTimers.delete(guildId);
	//   }, thresholdMilliseconds);

	//   guildInactivityTimers.set(guildId, { timeoutId, timestamp: Date.now() });
	// }

	const shouldRespond = Math.random() < guildRecord.probability;
	if (!shouldRespond) return;

	const emoji = getRandomCelestialEmoji();
	const response = await generateResponse(guildId);
	if (!response) return;

	try {
		await message.channel.sendTyping();
		await new Promise(resolve => setTimeout(resolve, 5000));
		await message.channel.send(`${emoji} ${response}`);
	} catch (error) {
		logger.error(error, `${utilEmojis.error} Failed to send randomly generated message.`);
	}
});
