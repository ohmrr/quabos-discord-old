import { getVoiceConnection } from '@discordjs/voice';
import { InteractionContextType, SlashCommandBuilder } from 'discord.js';
import type Command from '../interfaces/command.js';
import logger from '../utils/logger.js';
import { utilEmojis } from '../utils/emoji.js';

export default {
  data: new SlashCommandBuilder()
    .setName('disconnect')
    .setDescription('Disconnect from the voice channel.')
    .setContexts(InteractionContextType.Guild),
  usage: '/disconnect',
  cooldown: 10,
  execute: async interaction => {
    if (!interaction.guild || !interaction.member) return;

    try {
      const voiceConnection = getVoiceConnection(interaction.guild.id);
      if (!voiceConnection) {
        await interaction.reply({
          content: `${utilEmojis.error} I am not in any voice channels.`,
          flags: 'Ephemeral',
        });
        return;
      }

      voiceConnection.destroy();
      await interaction.reply(`${utilEmojis.success} Disconnected from the voice channel.`);
    } catch (error) {
      logger.error(
        error,
        `${utilEmojis.error} Unable to disconnect from the voice channel and respond to the interaction.`,
      );
    }
  },
} satisfies Command;
