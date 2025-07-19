import createEvent from '../interfaces/event.js';
import { deleteGuildRecord } from '../utils/prisma.js';

export default createEvent('guildDelete', false, async guild => {
  await deleteGuildRecord(guild.id);
});
