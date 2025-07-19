import { EmbedBuilder, PermissionsBitField, SlashCommandSubcommandBuilder } from 'discord.js';
import type Subcommand from '../../../interfaces/subcommand.js';
import { prisma } from '../../../utils/client.js';
import { utilEmojis } from '../../../utils/emoji.js';
import logger from '../../../utils/logger.js';

export default {
  data: new SlashCommandSubcommandBuilder()
    .setName('set')
    .setDescription(
      'Change the probability that Quabos will respond to a message sent in your server.',
    )
    .addNumberOption(option =>
      option
        .setName('probability')
        .setDescription('The percent probability that Quabos will respond.')
        .setMaxValue(100)
        .setMinValue(0),
    ),
  permissions: new PermissionsBitField(PermissionsBitField.Flags.ManageGuild),
  usage: '/config probability set [amount]',
  execute: async interaction => {
    if (!interaction.guild) return;

    const guildId = interaction.guild.id;
    const newProbabilityValue = interaction.options.getNumber('probability', true);
    const guildRecord = await prisma.guild.findUnique({
      where: { id: guildId },
      select: { probability: true },
    });

    if (!guildRecord) {
      await interaction.reply({
        content: `${utilEmojis.error} This guild is not currently being tracked.`,
        flags: 'Ephemeral',
      });
      return;
    }

    if (guildRecord.probability * 100 === newProbabilityValue) {
      await interaction.reply({
        content: `${utilEmojis.error} The probability for your server is already set to **${newProbabilityValue}%**.`,
        flags: 'Ephemeral',
      });
      return;
    }

    const probabilityUpdateEmbed = new EmbedBuilder().setDescription(
      `${utilEmojis.success} The server's probability has successfully been set to **${newProbabilityValue}%**.`,
    );

    try {
      await prisma.guild.update({
        where: { id: guildId },
        data: { probability: newProbabilityValue / 100 },
      });

      await interaction.reply({ embeds: [probabilityUpdateEmbed] });
    } catch (error) {
      logger.error(
        { err: error, guildId: interaction.guild.id, newProbabilityValue },
        `${utilEmojis.error} Failed to update guild probability.`,
      );
      await interaction.reply({
        content: `${utilEmojis.error} There was an error updating the probability. Please try again.`,
        flags: 'Ephemeral',
      });
    }
  },
} satisfies Subcommand;
