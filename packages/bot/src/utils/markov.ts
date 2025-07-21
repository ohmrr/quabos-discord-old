import type { Collection, FetchMessagesOptions, Message, Snowflake, TextChannel } from 'discord.js';
import Markov from 'markov-strings';
import { prisma } from './client.js';
import { utilEmojis } from './emoji.js';
import logger from './logger.js';
import { isAuthorIgnored } from './prisma.js';
import safeFetch from './safeFetch.js';

export function isHumanAuthored(message: Message): boolean {
  return !(message.author.bot || message.system);
}

export function isValidMessageContent(content: string): boolean {
  const startsWithCommandChar = /^[!/?]/i;
  if (startsWithCommandChar.test(content) || content.split(' ').length < 2) return false;

  return true;
}

function normalizeString(str: string): string {
  return str
    .normalize('NFKC')
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,!?;:])/g, '$1')
    .replace(/([.,!?;:])\s*/g, '$1 ')
    .trim();
}

export async function saveMessage(message: Message<boolean>): Promise<boolean> {
  const { embeds, attachments, author, content, guildId, channelId, id: messageId } = message;

  if (!guildId || !isValidMessageContent(message.content)) return false;

  const isIgnored = await isAuthorIgnored(author.id, guildId);
  if (isIgnored) return false;

  const urls: string[] = [];
  const normalized = normalizeString(content);

  attachments.forEach(attachment => urls.push(attachment.url));
  embeds.forEach(embed => {
    if (embed.data.url && (embed.data.type === 'image' || embed.data.type === 'gifv')) {
      urls.push(embed.data.url);
    }

    if (embed.image?.url) {
      urls.push(embed.image.url);
    }
  });

  const hasAttachments = urls.length > 0;

  try {
    await prisma.message.create({
      data: {
        id: messageId,
        content: normalized,
        authorId: author.id,
        guildId: guildId,
        channelId: channelId,
        attachments: hasAttachments ? { create: urls.map(url => ({ url })) } : undefined,
      },
    });

    return true;
  } catch (error) {
    logger.error(
      { err: error, guildId, channelId },
      `${utilEmojis.error} Error saving message to database.`,
    );
    return false;
  }
}

async function getGuildMessages(guildId: string): Promise<string[] | null> {
  try {
    const messageData = await prisma.message.findMany({
      where: { guildId },
      select: { content: true },
    });
    if (!messageData) return null;

    const messages = messageData.map(message => message.content);
    return messages;
  } catch (error) {
    logger.error(error, `${utilEmojis.error} Unable to fetch guild messages from database.`);
    return null;
  }
}

export async function generateResponse(guildId: string): Promise<string | null> {
  const { data: messages, error } = await safeFetch(getGuildMessages(guildId));
  if (error) {
    logger.error(
      error,
      `${utilEmojis.error} There was an error fetching guild messages for response generation.`,
    );
    return null;
  }

  if (!messages || messages.length < 50) return null;
  const markov = new Markov.default({ stateSize: 2 });

  try {
    markov.addData(messages);

    const result = markov.generate({
      maxTries: 50,
      filter: result => result.string.split(' ').length >= 5,
    });
    return result.string;
  } catch (error) {
    logger.error(error, `${utilEmojis.error} There was an error generating a markov result.`);
    return null;
  }
}

export async function fetchChannelMessages(channel: TextChannel) {
  let allMessages: Message[] = [];
  let lastMessageId: string | null = null;
  let fetchedMessages: Collection<Snowflake, Message<true>>;

  do {
    const options: FetchMessagesOptions = lastMessageId
      ? { limit: 100, before: lastMessageId }
      : { limit: 100 };

    fetchedMessages = await channel.messages.fetch(options);
    allMessages = allMessages.concat(Array.from(fetchedMessages.values()));

    lastMessageId = fetchedMessages.last()?.id ?? null;
  } while (fetchedMessages.size === 100);

  return allMessages;
}
