import {
  ChannelType,
  PermissionsBitField,
  SlashCommandSubcommandBuilder,
  TextChannel,
} from 'discord.js';
import type Subcommand from '../../../interfaces/subcommand.js';
import { prisma } from '../../../utils/client.js';
import { utilEmojis } from '../../../utils/emoji.js';
import logger from '../../../utils/logger.js';

export default {
  data: new SlashCommandSubcommandBuilder()
    .setName('add')
    .setDescription('Allows a channel to be used for message collection.')
    .addChannelOption(option =>
      option
        .setName('channel')
        .setDescription('The channel you want Quabos to gather messages from.')
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText),
    ),
  permissions: new PermissionsBitField(PermissionsBitField.Flags.ManageGuild),
  usage: '/config channels add [channel]',
  execute: async interaction => {
    if (!interaction.guild) return;

    const guildId = interaction.guild.id;
    const selectedChannel = interaction.options.getChannel('channel', true);

    if (!(selectedChannel instanceof TextChannel)) {
      await interaction.reply({
        content: `${utilEmojis.error} The selected channel is not a text channel.`,
        flags: 'Ephemeral',
      });
      return;
    }

    const clientGuildMember = interaction.guild.members.me;
    if (!clientGuildMember) return;

    const clientPermissions = clientGuildMember.permissionsIn(selectedChannel) || null;
    if (!clientPermissions || !clientPermissions.has(PermissionsBitField.Flags.ViewChannel)) {
      await interaction.reply({
        content: `${utilEmojis.error} I don't have permissions to read messages in the selected channel.`,
      });
      return;
    }

    const existingGuild = await prisma.guild.findUnique({
      where: { id: guildId },
      select: { channels: { select: { id: true } } },
    });

    if (existingGuild) {
      const isAlreadyTracked = existingGuild.channels.some(
        channel => channel.id === selectedChannel.id,
      );

      if (isAlreadyTracked) {
        await interaction.reply({
          content: `${utilEmojis.error} Channel <#${selectedChannel.id}> is already being read for new messages.`,
          flags: 'Ephemeral',
        });
        return;
      }

      try {
        await prisma.guild.update({
          where: { id: guildId },
          data: {
            channels: {
              create: {
                id: selectedChannel.id,
              },
            },
          },
        });

        await interaction.reply(
          `${utilEmojis.success} Channel <#${selectedChannel.id}> is now being read for new messages.`,
        );
        return;
      } catch (error) {
        logger.error(
          { err: error, guildId: interaction.guild.id, name: interaction.guild.name },
          `${utilEmojis.error} Error updating guild record.`,
        );
        await interaction.reply({
          content: `${utilEmojis.error} An error occurred while updating the channel record.`,
          flags: 'Ephemeral',
        });
      }
    }

    try {
      await prisma.guild.create({
        data: {
          id: guildId,
          channels: {
            create: {
              id: selectedChannel.id,
            },
          },
        },
      });

      await interaction.reply(
        `${utilEmojis.success} Channel <#${selectedChannel.id}> is now being read for new messages.`,
      );
    } catch (error) {
      logger.error(
        { err: error, guildId },
        `${utilEmojis.error} Failed to create guild record in database.`,
      );
      await interaction.reply({
        content: `${utilEmojis.error} An error occurred while creating the guild record. Please try again later.`,
        flags: 'Ephemeral',
      });
    }
  },
} satisfies Subcommand;
