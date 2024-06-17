import { Events } from "discord.js";
import { client } from "~/client";
import { seeUser } from "~/database/users.ts";
import { manageVerification } from "~/helpers/verify.ts";
import { log } from "~/log";
import { number } from "~/util/env";
import { isSystemMessage } from "~/util/message";

const minimumMessages = number("MINIMUM_MESSAGES");

client.on(Events.MessageCreate, async ({ author, member, guild, ...message }) => {
	if (!member || isSystemMessage(message)) {
		return;
	}

	log.debug(`Checking verification status for ${author.username}...`);

	const user = seeUser(member.id);
	if (!user || user.verified) {
		log.debug("Nothing to do!");
		return;
	}

	log.debug(`Message count is ${user.count}.`);
	if (user.count < minimumMessages || !guild) {
		return;
	}

	await manageVerification(member, true);
});
