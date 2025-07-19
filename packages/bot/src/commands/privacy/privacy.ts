import { InteractionContextType, SlashCommandBuilder } from 'discord.js';
import type Command from '../../interfaces/command.js';
import { utilEmojis } from '../../utils/emoji.js';
import optin from './optin.js';
import optout from './optout.js';

export default {
  data: new SlashCommandBuilder()
    .setName('privacy')
    .setDescription('Prevent Quabos from storing any messages you send in this server or globally.')
    .setContexts(InteractionContextType.Guild)
    .addSubcommand(optin.data)
    .addSubcommand(optout.data),
  subcommands: {
    optin,
    optout,
  },
  cooldown: 5,
  execute: async interaction => {
    const subcommand = interaction.options.getSubcommand();
    if (!subcommand) {
      await interaction.reply({
        content: `${utilEmojis.error} Error getting the subcommand.`,
        flags: 'Ephemeral',
      });
      return;
    }

    switch (subcommand) {
      case 'opt-in':
        await optin.execute(interaction);
        break;

      case 'opt-out':
        await optout.execute(interaction);
        break;
    }
  },
} satisfies Command;
