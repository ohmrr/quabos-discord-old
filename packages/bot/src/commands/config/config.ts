import { InteractionContextType, SlashCommandBuilder } from 'discord.js';
import type Command from '../../interfaces/command.js';
import { utilEmojis } from '../../utils/emoji.js';
import add from './channels/add.js';
import list from './channels/list.js';
import remove from './channels/remove.js';
import set from './probability/set.js';
import view from './probability/view.js';

export default {
  data: new SlashCommandBuilder()
    .setName('config')
    .setDescription('Manage bot configuration.')
    .setContexts(InteractionContextType.Guild)
    .addSubcommandGroup(channels =>
      channels
        .setName('channels')
        .setDescription('Manage channel settings for Quabos.')
        .addSubcommand(add.data)
        .addSubcommand(remove.data)
        .addSubcommand(list.data),
    )
    .addSubcommandGroup(probability =>
      probability
        .setName('probability')
        .setDescription('Manage probability settings for random message generation.')
        .addSubcommand(set.data)
        .addSubcommand(view.data),
    ),
  subcommands: {
    add,
    remove,
    list,
    set,
    view,
  },
  cooldown: 7,
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
      case 'add':
        await add.execute(interaction);
        break;

      case 'remove':
        await remove.execute(interaction);
        break;

      case 'list':
        await list.execute(interaction);
        break;

      case 'set':
        await set.execute(interaction);
        break;

      case 'view':
        await view.execute(interaction);
        break;
    }
  },
} satisfies Command;
