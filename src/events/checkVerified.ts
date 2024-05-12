import type { Role } from "discord.js";
import { Events } from "discord.js";
import { client } from "~/client";
import { isSystemMessage } from "~/util/message";
import { seeUser, verifyUser } from "~/database";
import { number, string } from "~/util/env";
import { log } from "~/log";

const roleId = string("VERIFIED_ROLE");
const minimumMessages = number("MINIMUM_MESSAGES");

// TODO: Abstract this so it can be used for other roles
let roleValid = false;
for (const [_, guild] of client.guilds.cache) {
	const roles = await guild.roles.fetch();

	let verifiedRole: Role | undefined;
	let selfRole: Role | undefined;
	for (const [_, role] of roles) {
		if (role.id === roleId) {
			verifiedRole = role;
			continue;
		}

		if (role.name === "Ohm" && role.managed) {
			selfRole = role;
		}
	}

	log.debug(`Verified role name: ${verifiedRole?.name}`);
	log.debug(`Managed role ID: ${selfRole?.id}`);
	if (!verifiedRole || !selfRole) {
		continue;
	}

	if (verifiedRole.position > selfRole.position) {
		throw "Verified role is below the bot's managed role!";
	}

	roleValid = true;
	break;
}

if (!roleValid) {
	throw "Role setup is not valid.";
}

client.on(Events.MessageCreate, async (message) => {
	if (!message.member || isSystemMessage(message)) {
		return;
	}

	log.debug(`Checking verification status for ${message.author.username}...`);

	const user = seeUser(message.member.id);

	if (!user || user.verified) {
		log.debug("Nothing to do!");
		return;
	}

	log.debug(`Message count is ${user.count}.`);
	if (user.count > minimumMessages) {
		log.debug("Verifying member...");
		if (message.member.moderatable) {
			await message.member.roles.add(roleId);

			const currentMember = await message.guild?.members.fetch({
				"user": message.author
			});

			if (!currentMember || currentMember.roles.cache.has(roleId)) {
				log.warn(`Could not verify member ${message.member.displayName}! Not verifying yet.`);
				return;
			}
		} else {
			log.warn("Cannot verify member due to permissions.");
		}

		verifyUser(message.member.id);
		log.debug("Verified member!");
	}
});
