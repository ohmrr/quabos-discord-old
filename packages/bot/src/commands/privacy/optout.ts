import { SlashCommandSubcommandBuilder } from 'discord.js';
import type Subcommand from '../../interfaces/subcommand.js';
import { prisma } from '../../utils/client.js';
import { utilEmojis } from '../../utils/emoji.js';
import logger from '../../utils/logger.js';

export default {
  data: new SlashCommandSubcommandBuilder()
    .setName('opt-out')
    .setDescription('Opt-out of message collection for the model.')
    .addStringOption(scope =>
      scope
        .setName('scope')
        .setDescription(
          'Opt-out either only in this server, or globally (in every server that both you and Quabos are in).',
        )
        .addChoices({ name: 'server', value: 'server' }, { name: 'global', value: 'global' })
        .setRequired(true),
    ),
  usage: '/privacy opt-out [scope]',
  execute: async interaction => {
    if (!interaction.guild) return;

    const scope = interaction.options.getString('scope', true);
    const userId = interaction.user.id;
    const guildId = interaction.guild.id;

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { globalIgnored: true, guildIgnoredIds: true },
      });

      if (scope === 'global') {
        if (user?.globalIgnored) {
          await interaction.reply({
            content: `${utilEmojis.error} You have already opted-out globally.`,
            flags: 'Ephemeral',
          });

          return;
        }

        await prisma.user.upsert({
          where: { id: userId },
          update: { globalIgnored: true },
          create: { id: userId, globalIgnored: true },
        });

        await interaction.reply({
          content: `${utilEmojis.success} You have successfully opted-out globally!`,
          flags: 'Ephemeral',
        });

        return;
      }

      if (user?.guildIgnoredIds.includes(guildId)) {
        await interaction.reply({
          content: `${utilEmojis.error} You have already opted-out for this server.`,
          flags: 'Ephemeral',
        });

        return;
      }

      await prisma.user.upsert({
        where: { id: userId },
        update: { guildIgnoredIds: { push: guildId } },
        create: { id: userId, guildIgnoredIds: [guildId] },
      });

      await interaction.reply({
        content: `${utilEmojis.success} You have successfully opted-out for this server!`,
        flags: 'Ephemeral',
      });
    } catch (error) {
      logger.error(error, `${utilEmojis.error} There was an issue with a user opting-out.`);
      await interaction.reply({
        content: `${utilEmojis.error} An error occurred while processing your opt-out request. Please try again later or report this error to the developers.`,
        flags: 'Ephemeral',
      });
    }
  },
} satisfies Subcommand;
