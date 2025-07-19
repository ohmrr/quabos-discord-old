import { Prisma } from '@prisma/client';
import { prisma } from './client.js';
import { utilEmojis } from './emoji.js';
import logger from './logger.js';

export async function isTrackedChannel(channelId: string): Promise<boolean> {
	try {
		const channelRecord = await prisma.channel.findUnique({ where: { id: channelId } });
		return !!channelRecord;
	} catch (error) {
		logger.error(error, `${utilEmojis.error} There was an issue fetching a channel record.`);
		return false;
	}
}

export async function isAuthorIgnored(userId: string, guildId: string): Promise<boolean> {
	try {
		const messageAuthor = await prisma.user.findUnique({
			where: { id: userId },
			select: { globalIgnored: true, guildIgnoredIds: true },
		});

		if (messageAuthor?.globalIgnored || messageAuthor?.guildIgnoredIds.includes(guildId)) {
			return true;
		}
	} catch (error) {
		logger.error(
			error,
			`${utilEmojis.error} Failed to fetch message author record while checking user privacy settings.`,
		);
		return true;
	}

	return false;
}

export async function deleteGuildRecord(guildId: string): Promise<void> {
	try {
		await prisma.guild.delete({ where: { id: guildId } });

		logger.debug(
			`${utilEmojis.success} Successfully deleted guild ${guildId} and all associated data.`,
		);
	} catch (error) {
		if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
			logger.warn(
				{ err: error, guildId },
				`${utilEmojis.error} Guild record with specified ID not found.`,
      );
      
      return;
		}

		logger.error(
			{ err: error, guildId },
			`${utilEmojis.error} Failed deletion of guild record with specified ID.`,
		);
		throw error;
	}
}

export async function deleteChannelRecord(channelId: string): Promise<void> {
	try {
		await prisma.channel.delete({
			where: {
				id: channelId,
			},
		});

		logger.debug(
			`${utilEmojis.success} Successfully deleted channel ${channelId} and all associated data`,
		);
	} catch (error) {
		if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
			logger.warn(
				{ err: error, channelId },
				`${utilEmojis.error} Channel record with specified ID not found.`,
      );
      
      return;
		}

		logger.error(
			{ err: error, channelId },
			`${utilEmojis.error} Failed deletion of channel record with specified ID.`,
		);
		throw error;
	}
}
