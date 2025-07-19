import { SlashCommandSubcommandBuilder } from 'discord.js';
import type Subcommand from '../../interfaces/subcommand.js';
import { prisma } from '../../utils/client.js';
import { utilEmojis } from '../../utils/emoji.js';
import logger from '../../utils/logger.js';

export default {
  data: new SlashCommandSubcommandBuilder()
    .setName('opt-in')
    .setDescription('Opt-in to message collection for the model.')
    .addStringOption(scope =>
      scope
        .setName('scope')
        .setDescription(
          'Opt-in either only in this server, or globally (in every server that both you and Quabos are in).',
        )
        .addChoices({ name: 'server', value: 'server' }, { name: 'global', value: 'global' })
        .setRequired(true),
    ),
  usage: '/privacy opt-in [scope]',
  execute: async interaction => {
    if (!interaction.guild) return;

    const scope = interaction.options.getString('scope', true);
    const userId = interaction.user.id;
    const guildId = interaction.guild.id;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      await interaction.reply({
        content: `${utilEmojis.error} You have already opted-in ${scope === 'global' ? 'globally' : 'for this server.'}!`,
        flags: 'Ephemeral',
      });

      return;
    }

    if (scope === 'global') {
      if (!user.globalIgnored) {
        await interaction.reply({
          content: `${utilEmojis.error} You have already opted-in globally.`,
          flags: 'Ephemeral',
        });

        return;
      }

      try {
        await prisma.user.update({ where: { id: userId }, data: { globalIgnored: false } });
        await interaction.reply({
          content: `${utilEmojis.success} You have successfully opted-in globally!`,
          flags: 'Ephemeral',
        });
      } catch (error) {
        logger.error(
          error,
          `${utilEmojis.error} There was an error with opting-in a user globally.`,
        );
        await interaction.reply({
          content: `${utilEmojis.error} There was an error opting you in globally. Please try again later or report this error to the developers.`,
          flags: 'Ephemeral',
        });
      }

      return;
    }

    if (!user.guildIgnoredIds.includes(guildId)) {
      await interaction.reply({
        content: `${utilEmojis.error} You have already opted-in for this server.`,
        flags: 'Ephemeral',
      });

      return;
    }

    try {
      const updatedGuildList = user.guildIgnoredIds.filter(id => id !== guildId);
      await prisma.user.update({
        where: { id: userId },
        data: { guildIgnoredIds: updatedGuildList },
      });

      await interaction.reply({
        content: `${utilEmojis.success} You have successfully opted-in for this server!`,
        flags: 'Ephemeral',
      });
    } catch (error) {
      logger.error(error, `${utilEmojis.error} Unable to opt a user in for a server.`);
      await interaction.reply({
        content: `${utilEmojis.error} There was an error opting you in for this server. Please try again later or report this error to the developers.`,
        flags: 'Ephemeral',
      });
    }
  },
} satisfies Subcommand;
