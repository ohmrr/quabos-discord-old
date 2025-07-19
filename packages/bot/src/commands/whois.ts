import { EmbedBuilder, InteractionContextType, SlashCommandBuilder } from 'discord.js';
import type Command from '../interfaces/command.js';
import formatUnixTimestamp from '../utils/formatUnixTimestamp.js';

export default {
  data: new SlashCommandBuilder()
    .setName('whois')
    .setDescription('Get user information.')
    .setContexts(InteractionContextType.Guild)
    .addUserOption(option =>
      option
        .setName('member')
        .setDescription('Guild member to get information about.')
        .setRequired(false),
    ),
  usage: '/whois [user]',
  execute: async interaction => {
    if (!interaction.guild) return;

    const user = interaction.options.getUser('member', false) ?? interaction.user;
    const guildMember = interaction.guild.members.cache.get(user.id);
    if (!guildMember || !guildMember.joinedAt) return;

    const memberRoles = guildMember.roles.cache
      .filter(role => role.name !== '@everyone')
      .map(role => `<@&${role.id}>`);

    const whoisEmbed = new EmbedBuilder({
      author: {
        name: user.username,
        iconURL: user.displayAvatarURL({ size: 4096 }),
      },
      thumbnail: { url: user.displayAvatarURL({ size: 4096 }) },
      description: `<@!${user.id}>`,
      fields: [
        {
          name: 'Joined',
          value: formatUnixTimestamp(guildMember.joinedAt, 'F'),
          inline: true,
        },
        {
          name: 'Registered',
          value: formatUnixTimestamp(user.createdAt, 'F'),
          inline: true,
        },
        {
          name: `Roles [${memberRoles.length}]`,
          value: memberRoles.join(' '),
          inline: false,
        },
      ],
      footer: {
        text: `ID: ${user.id}`,
      },
      timestamp: Date.now(),
    });

    await interaction.reply({ embeds: [whoisEmbed] });
  },
} satisfies Command;
