import type { TimestampStylesString } from 'discord.js';

export default function formatUnixTimestamp(date: Date, format: TimestampStylesString): string {
  const timestamp = Math.floor(date.getTime() / 1000);
  return `<t:${timestamp}:${format}>`;
}
