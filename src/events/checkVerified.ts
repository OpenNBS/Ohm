import { Events } from "discord.js";
import { client } from "~/client";
import { seeUser, verifyUser } from "~/database";
import { log } from "~/log";
import { number, string } from "~/util/env";
import { isSystemMessage } from "~/util/message";
import { validateRoles } from "~/util/role.ts";

const verifiedRole = string("VERIFIED_ROLE");
await validateRoles(verifiedRole);

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

	if (member.moderatable) {
		log.warn("Cannot verify member due to permissions!");
		return;
	}

	log.debug("Verifying member...");
	await member.roles.add(verifiedRole);

	const currentMember = await guild.members.fetch({
		"user": member
	});

	if (!currentMember || currentMember.roles.cache.has(verifiedRole)) {
		log.warn(`Could not verify member ${member.displayName}! Not verifying yet.`);
		return;
	}

	verifyUser(member.id);
	log.debug("Verified member!");
});
