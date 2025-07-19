import { SlashCommandBuilder } from 'discord.js';
import type Command from '../interfaces/command.js';
import { celestialEmojis, utilEmojis } from '../utils/emoji.js';
import logger from '../utils/logger.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Fetch the client and websocket ping.'),
  usage: '/ping',
  execute: async interaction => {
    try {
      await interaction.deferReply();
      const reply = await interaction.fetchReply();

      const clientLatency = reply.createdTimestamp - interaction.createdTimestamp;
      await interaction.editReply(
        `${celestialEmojis.alien} **Client**: ${clientLatency}ms | **Websocket**: ${interaction.client.ws.ping}ms`,
      );
    } catch (error) {
      logger.error(error, `${utilEmojis.error} Unable to respond to /ping interaction.`);
      await interaction.reply({
        content: `${utilEmojis.error} There was an error getting the client ping. Please try again later.`,
        flags: 'Ephemeral',
      });
    }
  },
} satisfies Command;
