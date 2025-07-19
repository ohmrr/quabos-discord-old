import type { Collection } from 'discord.js';
import type Command from './interfaces/command.ts';

type InactivityTriggerData = {
	timeoutId: NodeJS.Timeout;
	timestamp: number;
};

declare module 'discord.js' {
	interface Client {
		version: string;
		commands: Collection<string, Command>;
		cooldowns: Collection<string, Collection<string, number>>;
		guildInactivityTimers: Collection<string, InactivityTriggerData>;
	}
}
