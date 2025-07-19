import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  EmbedBuilder,
  PermissionsBitField,
  SlashCommandSubcommandBuilder,
  type Interaction,
} from 'discord.js';
import type Subcommand from '../../interfaces/subcommand.js';
import { prisma } from '../../utils/client.js';
import { utilEmojis } from '../../utils/emoji.js';

export default {
  data: new SlashCommandSubcommandBuilder()
    .setName('resetlog')
    .setDescription('Deletes all the message logs for your server.'),
  permissions: new PermissionsBitField(PermissionsBitField.Flags.ManageGuild),
  usage: '/config resetlog',
  execute: async interaction => {
    if (!interaction.guild) return;

    const guildId = interaction.guild.id;
    const guildRecord = await prisma.guild.findUnique({
      where: { id: guildId },
      include: { messages: true },
    });

    if (!guildRecord || guildRecord.messages.length === 0) {
      await interaction.reply({
        content: `${utilEmojis.error} There are currently no messages stored.`,
        flags: 'Ephemeral',
      });
      return;
    }

    const confirmButton = new ButtonBuilder()
      .setCustomId('confirm')
      .setLabel('Confirm')
      .setStyle(ButtonStyle.Danger);

    const cancelButton = new ButtonBuilder()
      .setCustomId('cancel')
      .setLabel('Cancel')
      .setStyle(ButtonStyle.Secondary);

    const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      confirmButton,
      cancelButton,
    );

    const deleteLogEmbed = new EmbedBuilder().setDescription(
      `**Are you sure you want to continue?**
      
      There are currently ${guildRecord.messages.length} stored. Press confirm to continue. You will not be able to undo this action.`,
    );

    const cancelEmbed = new EmbedBuilder().setDescription(
      `Deletion of message logs has been cancelled.`,
    );

    const reply = await interaction.reply({
      embeds: [deleteLogEmbed],
      components: [buttonRow],
    });

    const filter = (i: Interaction) => i.user.id === interaction.user.id;
    const collector = reply.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 15000,
      filter,
    });

    collector.on('collect', async i => {
      if (i.customId === 'confirm') {
        await prisma.message.deleteMany({ where: { guildId } });

        const confirmEmbed = new EmbedBuilder().setDescription(
          `${utilEmojis.success} All the message logs have been deleted.`,
        );
        await i.update({ embeds: [confirmEmbed], components: [] });
      } else if (i.customId === 'cancel') {
        await i.update({ embeds: [cancelEmbed], components: [] });
      }
    });

    collector.on('end', async collected => {
      if (collected.size === 0) {
        interaction.editReply({ embeds: [cancelEmbed], components: [] });
      }
    });
  },
} satisfies Subcommand;
