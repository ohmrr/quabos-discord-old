import { PrismaClient } from '@prisma/client';
import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';
import packageJson from '../../package.json' with { type: 'json' };

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildVoiceStates,
  ],
  allowedMentions: {
    repliedUser: true,
    parse: ['roles', 'users'],
  },
  partials: [Partials.Message, Partials.GuildMember, Partials.Channel],
  failIfNotExists: false,
});

client.version = `v${packageJson.version}`;
client.commands = new Collection();
client.cooldowns = new Collection();
client.guildInactivityTimers = new Collection();

export const prisma = new PrismaClient();
