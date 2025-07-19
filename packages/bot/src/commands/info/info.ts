import { InteractionContextType, SlashCommandBuilder } from 'discord.js';
import type Command from '../../interfaces/command.js';
import { utilEmojis } from '../../utils/emoji.js';
import quabos from './quabos.js';
import server from './server.js';

export default {
  data: new SlashCommandBuilder()
    .setName('info')
    .setDescription('Information about Quabos and the current guild.')
    .setContexts(InteractionContextType.Guild)
    .addSubcommand(server.data)
    .addSubcommand(quabos.data),
  subcommands: {
    server,
    quabos,
  },
  execute: async interaction => {
    const subcommand = interaction.options.getSubcommand();
    if (!subcommand) {
      await interaction.reply({
        content: `${utilEmojis.error} Error getting subcommand for main command info.`,
        flags: 'Ephemeral',
      });
      return;
    }

    switch (subcommand) {
      case 'server':
        await server.execute(interaction);
        break;

      case 'quabos':
        await quabos.execute(interaction);
        break;
    }
  },
} satisfies Command;
