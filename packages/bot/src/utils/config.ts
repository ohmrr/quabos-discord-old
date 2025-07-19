import 'dotenv/config';
import { z } from 'zod';
import { utilEmojis } from './emoji.js';

const envSchema = z
	.object({
		NODE_ENV: z.enum(['production', 'development']).default('production'),
		DATABASE_URL: z.string(),
		DISCORD_TOKEN: z.string(),
		DEV_DISCORD_TOKEN: z.string().optional(),
		DEV_GUILD_ID: z.string().optional(),
		TZ: z.string().default('America/Los_Angeles'),
	})
	.refine(env => env.NODE_ENV !== 'development' || !!env.DEV_GUILD_ID, {
		message: `${utilEmojis.error} DEV_GUILD_ID is required when NODE_ENV is "development".`,
	});

const env = envSchema.parse(process.env);

const config = {
	nodeEnv: env.NODE_ENV,
	databaseUrl: env.DATABASE_URL,
	token:
		env.NODE_ENV === 'development' && env.DEV_DISCORD_TOKEN?.trim()
			? env.DEV_DISCORD_TOKEN
			: env.DISCORD_TOKEN,
	devGuildId: env.DEV_GUILD_ID,
	tz: env.TZ,
};

export default config;
