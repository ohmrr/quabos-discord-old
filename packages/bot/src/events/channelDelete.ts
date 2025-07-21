import { TextChannel } from 'discord.js';
import createEvent from '../interfaces/event.js';
import { deleteChannelRecord } from '../utils/prisma.js';

export default createEvent('channelDelete', false, async channel => {
  if (!(channel instanceof TextChannel)) return;

  await deleteChannelRecord(channel.id);
});
