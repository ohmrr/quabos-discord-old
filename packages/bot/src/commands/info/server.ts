import { ChannelType, EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import type Subcommand from '../../interfaces/subcommand.js';
import { prisma } from '../../utils/client.js';
import formatUnixTimestamp from '../../utils/formatUnixTimestamp.js';

export default {
  data: new SlashCommandSubcommandBuilder()
    .setName('server')
    .setDescription('Information about the current discord server.'),
  usage: '/info server',
  execute: async interaction => {
    if (!interaction.guild) return;

    const { guild } = interaction;
    const guildIcon = guild.iconURL({ size: 4096, extension: 'png' }) || '';
    const guildRoles = guild.roles.cache
      .filter(role => role.name !== '@everyone')
      .sort((a, b) => b.position - a.position)
      .map(role => `<@&${role.id}>`);

    const guildRecord = await prisma.guild.findUnique({
      where: { id: guild.id },
      include: { channels: { include: { messages: true } } },
    });

    const serverInfoEmbed = new EmbedBuilder()
      .setAuthor({
        name: guild.name,
        iconURL: guildIcon,
      })
      .setThumbnail(guildIcon)
      .addFields([
        {
          name: 'Owner',
          value: `<@!${guild.ownerId}>`,
          inline: true,
        },
        {
          name: 'Server Created',
          value: formatUnixTimestamp(guild.createdAt, 'f'),
          inline: true,
        },
        {
          name: 'Members',
          value: `${guild.memberCount}`,
          inline: true,
        },
        {
          name: 'Categories',
          value: `${guild.channels.cache.filter(channel => channel.type === ChannelType.GuildCategory).size}`,
          inline: true,
        },
        {
          name: 'Text Channels',
          value: `${guild.channels.cache.filter(channel => channel.type === ChannelType.GuildText).size}`,
          inline: true,
        },
        {
          name: 'Voice Channels',
          value: `${guild.channels.cache.filter(channel => channel.type === ChannelType.GuildVoice).size}`,
          inline: true,
        },
        {
          name: `Roles [${guildRoles.length}]`,
          value: guildRoles.join(' '),
          inline: false,
        },
      ])
      .setFooter({ text: `ID: ${guild.id}` })
      .setTimestamp(Date.now());

    if (guildRecord && guildRecord.channels.length > 0) {
      const totalMessages = guildRecord.channels.reduce(
        (sum, channel) => sum + channel.messages.length,
        0,
      );
      const trackedChannels = guildRecord.channels.map(channel => `<#${channel.id}>`);

      serverInfoEmbed.addFields(
        {
          name: 'Tracked Channels',
          value: `${trackedChannels.join(' ')}`,
          inline: true,
        },
        {
          name: 'Messages Collected',
          value: `${totalMessages}`,
          inline: true,
        },
      );
    }

    await interaction.reply({ embeds: [serverInfoEmbed] });
  },
} satisfies Subcommand;
