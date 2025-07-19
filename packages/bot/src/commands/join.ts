import { joinVoiceChannel } from '@discordjs/voice';
import { GuildMember, InteractionContextType, SlashCommandBuilder } from 'discord.js';
import type Command from '../interfaces/command.js';
import { utilEmojis } from '../utils/emoji.js';

export default {
  data: new SlashCommandBuilder()
    .setName('join')
    .setDescription('Joins the voice channel you are currently in.')
    .setContexts(InteractionContextType.Guild),
  usage: '/join',
  cooldown: 5,
  execute: async interaction => {
    if (!interaction.guild) return;
    if (!(interaction.member instanceof GuildMember)) return;

    const guildMember = interaction.member;
    const clientMember = interaction.guild.members.me;
    if (!clientMember) return;

    const voiceChannel = guildMember.voice.channel;
    if (!voiceChannel) {
      await interaction.reply({
        content: `${utilEmojis.error} You are not in a voice channel.`,
        flags: 'Ephemeral',
      });
      return;
    }

    joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: interaction.guild.id,
      selfMute: false,
      selfDeaf: false,
      adapterCreator: interaction.guild.voiceAdapterCreator,
    });

    await interaction.reply(`${utilEmojis.audio} Joined the voice channel ${voiceChannel.name}.`);
  },
} satisfies Command;
