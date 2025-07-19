import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import type Subcommand from '../../../interfaces/subcommand.js';
import { prisma } from '../../../utils/client.js';
import { celestialEmojis, utilEmojis } from '../../../utils/emoji.js';

export default {
  data: new SlashCommandSubcommandBuilder()
    .setName('list')
    .setDescription('View the list of channels being read for messages.'),
  usage: '/config channels list',
  execute: async interaction => {
    if (!interaction.guild) return;

    const guildId = interaction.guild.id;

    const existingGuild = await prisma.guild.findUnique({
      where: { id: guildId },
      select: { channels: { select: { id: true } } },
    });

    if (!existingGuild || existingGuild.channels.length === 0) {
      await interaction.reply({
        content: `${utilEmojis.error} There are no channels currently being read for messages.`,
        flags: 'Ephemeral',
      });

      return;
    }

    const channelList = existingGuild.channels
      .map(channel => `${celestialEmojis.sparkles} <#${channel.id}>`)
      .join('\n');

    const listEmbed = new EmbedBuilder({
      author: {
        name: interaction.guild.name,
        iconURL: interaction.guild.iconURL({ size: 4096 }) || '',
      },
      title: 'Channels Being Tracked',
      description: channelList,
    });

    await interaction.reply({ embeds: [listEmbed] });
  },
} satisfies Subcommand;
