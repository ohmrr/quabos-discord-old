import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type Command from '../interfaces/command.js';

export default {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Get the avatar of a specific user.')
    .addUserOption(option =>
      option.setName('user').setDescription('The user you want the avatar of.').setRequired(false),
    ),
  usage: '/avatar [user]',
  execute: async interaction => {
    const user = interaction.options.getUser('user', false) ?? interaction.user;
    const avatarURL = user.avatarURL({ size: 4096, extension: 'png' }) || user.defaultAvatarURL;

    const avatarEmbed = new EmbedBuilder()
      .setAuthor({
        name: user.tag,
        iconURL: avatarURL,
      })
      .setImage(avatarURL);

    await interaction.reply({ embeds: [avatarEmbed] });
  },
} satisfies Command;
