import {
  ChannelType,
  InteractionContextType,
  PermissionsBitField,
  SlashCommandBuilder,
  TextChannel,
} from 'discord.js';
import type Command from '../interfaces/command.js';
import { utilEmojis } from '../utils/emoji.js';
import logger from '../utils/logger.js';
import { fetchChannelMessages, saveMessage } from '../utils/markov.js';
import { isTrackedChannel } from '../utils/prisma.js';
import safeFetch from '../utils/safeFetch.js';

export default {
  data: new SlashCommandBuilder()
    .setName('train')
    .setDescription('Gathers messages from the selected channel')
    .setContexts(InteractionContextType.Guild)
    .addChannelOption(option =>
      option
        .setName('channel')
        .setDescription('The channel you want to gather messages from.')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true),
    ),
  permissions: new PermissionsBitField(PermissionsBitField.Flags.ManageGuild),
  usage: '/train [channel]',
  cooldown: 12,
  execute: async interaction => {
    const selectedChannel = interaction.options.getChannel('channel', true);
    if (!(selectedChannel instanceof TextChannel)) return;

    await interaction.deferReply();

    const channelId = selectedChannel.id;
    const { data: isTracked, error: trackError } = await safeFetch(isTrackedChannel(channelId));
    if (trackError) {
      logger.error(
        { err: trackError, channelId },
        `${utilEmojis.error} Unable to confirm if channel is currently tracked or not.`,
      );
      await interaction.editReply(
        `${utilEmojis.error} Unable to confirm if <#${channelId}> is being tracked. Please try again later.`,
      );
    }

    if (!isTracked) {
      await interaction.editReply(
        `${utilEmojis.error} <#${channelId}> is not being tracked. Please use \`/config channels add <#${channelId}>\``,
      );
      return;
    }

    const { data: messages, error: fetchError } = await safeFetch(
      fetchChannelMessages(selectedChannel),
    );
    if (fetchError) {
      logger.error(
        { err: fetchError, channelId: channelId },
        `${utilEmojis.error} Unable to fetch messages from channel.`,
      );
      await interaction.editReply(
        `${utilEmojis.error} Unable to fetch messages for training. Please try again later.`,
      );
      return;
    }

    if (!messages.length) {
      await interaction.editReply(
        `${utilEmojis.error} No messages were fetched. Please ensure <#${channelId}> has messages and that Quabos can view them.`,
      );
      return;
    }

    const total = messages.length;
    let processed = 0;
    let validMessages = 0;
    const barSize = 20;

    const renderBar = (amountDone: number) => {
      const filled = Math.floor((amountDone / total) * barSize);
      const empty = barSize - filled;
      return '[' + '#'.repeat(filled) + '-'.repeat(empty) + ']';
    };

    await interaction.editReply(
      `${utilEmojis.loading} Processing ${total.toLocaleString()} messages in <#${channelId}>.\n${renderBar(0)} 0%`,
    );

    for (const message of messages) {
      const isSaved = await saveMessage(message);
      if (isSaved) {
        validMessages++;
      }

      processed++;

      if (processed % Math.ceil(total / 20) === 0 || processed === total) {
        const percent = Math.floor((processed / total) * 100);

        await interaction.editReply(
          `${utilEmojis.loadingAlt} Processing ${total.toLocaleString()} messages in <#${channelId}>.\n${renderBar(processed)} ${percent}%`,
        );
      }
    }

    await interaction.editReply(
      `${utilEmojis.success} Training complete. Processed ${total.toLocaleString()} messages, saved ${validMessages.toLocaleString()} messages.`,
    );
  },
} satisfies Command;
