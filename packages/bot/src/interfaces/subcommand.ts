import type {
	ChatInputCommandInteraction,
	PermissionsBitField,
	SlashCommandSubcommandBuilder,
} from 'discord.js';

export default interface Subcommand {
	data: SlashCommandSubcommandBuilder;
	permissions?: PermissionsBitField;
	usage: string;
	execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}
