import type { ClientEvents } from 'discord.js';

interface Event<K extends keyof ClientEvents> {
  name: K;
  once: boolean;
  execute: (...params: ClientEvents[K]) => Promise<void>;
}

export default function createEvent<K extends keyof ClientEvents>(
  name: K,
  once: boolean,
  execute: (...params: ClientEvents[K]) => Promise<void>,
): Event<K> {
  return { name, once, execute };
}
