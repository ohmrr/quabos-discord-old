import {
  ChannelType,
  PermissionsBitField,
  SlashCommandSubcommandBuilder,
  TextChannel,
} from 'discord.js';
import type Subcommand from '../../../interfaces/subcommand.js';
import { prisma } from '../../../utils/client.js';
import { utilEmojis } from '../../../utils/emoji.js';
import { deleteChannelRecord } from '../../../utils/prisma.js';

export default {
  data: new SlashCommandSubcommandBuilder()
    .setName('remove')
    .setDescription('Removes a channel that Quabos reads messages from.')
    .addChannelOption(option =>
      option
        .setName('channel')
        .setDescription('Channel to remove.')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true),
    ),
  permissions: new PermissionsBitField(PermissionsBitField.Flags.ManageGuild),
  usage: '/config channels remove [channel]',
  execute: async interaction => {
    if (!interaction.guild) return;

    const guildId = interaction.guild.id;
    const selectedChannel = interaction.options.getChannel('channel', true);

    const existingGuild = await prisma.guild.findUnique({
      where: { id: guildId },
      select: { channels: { select: { id: true } } },
    });

    if (
      !existingGuild ||
      !existingGuild.channels.some(channel => channel.id === selectedChannel.id)
    ) {
      await interaction.reply(
        `${utilEmojis.error} Channel <#${selectedChannel.id}> is not being read for new messages.`,
      );
      return;
    }

    if (!(selectedChannel instanceof TextChannel)) return;

    await deleteChannelRecord(selectedChannel.id);
    await interaction.reply(
      `${utilEmojis.success} Channel <#${selectedChannel.id}> is no longer being read for new messages.`,
    );
  },
} satisfies Subcommand;
