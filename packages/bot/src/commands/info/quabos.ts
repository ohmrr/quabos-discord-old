import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import type Subcommand from '../../interfaces/subcommand.js';
import formatUnixTimestamp from '../../utils/formatUnixTimestamp.js';

export default {
  data: new SlashCommandSubcommandBuilder()
    .setName('quabos')
    .setDescription('Information about Quabos, including a Discord server and website!'),
  usage: '/info quabos',
  execute: async interaction => {
    const client = interaction.client;
    const avatarURL =
      client.user.avatarURL({ size: 4096, extension: 'png' }) || client.user.defaultAvatarURL;

    const quabosInfoEmbed = new EmbedBuilder()
      .setTitle('Quabos Status')
      .addFields([
        {
          name: 'Client Version',
          value: client.version,
          inline: true,
        },
        {
          name: 'Uptime',
          value: formatUnixTimestamp(new Date(), 'R'),
          inline: true,
        },
      ])
      .setThumbnail(avatarURL)
      .setTimestamp(Date.now());

    await interaction.reply({ embeds: [quabosInfoEmbed], flags: 'Ephemeral' });
  },
} satisfies Subcommand;
