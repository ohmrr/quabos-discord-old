import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import type Subcommand from '../../../interfaces/subcommand.js';
import { prisma } from '../../../utils/client.js';
import { utilEmojis } from '../../../utils/emoji.js';
import logger from '../../../utils/logger.js';

export default {
  data: new SlashCommandSubcommandBuilder()
    .setName('view')
    .setDescription(
      'View the probability of Quabos randomly responding to messages sent in the server.',
    ),
  usage: '/config probability view',
  execute: async interaction => {
    if (!interaction.guild) return;

    const guildId = interaction.guild.id;

    try {
      const guildRecord = await prisma.guild.findUnique({
        where: { id: guildId },
        select: { probability: true },
      });

      const notTrackedEmbed = new EmbedBuilder().setDescription(
        `${utilEmojis.error} This guild is not currently being tracked.`,
      );

      if (!guildRecord) {
        await interaction.reply({ embeds: [notTrackedEmbed], flags: 'Ephemeral' });
        return;
      }

      const probabilityEmbed = new EmbedBuilder().setDescription(
        `The server's current probability is set to **${guildRecord.probability * 100}%**.`,
      );

      await interaction.reply({ embeds: [probabilityEmbed], flags: 'Ephemeral' });
    } catch (error) {
      logger.error(error, `${utilEmojis.error} Unable to fetch guild probability.`);
      await interaction.reply({
        content: `${utilEmojis.error} There was an fetching the guild probability. Please try again.`,
        flags: 'Ephemeral',
      });
    }
  },
} satisfies Subcommand;
