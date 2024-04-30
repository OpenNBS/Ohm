import type { Role } from "discord.js";
import { Events } from "discord.js";
import { client } from "../client";
import { seeUser, verifyUser } from "../../database";
import { number, string } from "../../util/env";
import { log } from "../../log";

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

client.on(Events.MessageCreate, (event) => {
	log.debug(`New message creation event for user ${event.author.username}...`);
	if (!event.member) {
		return;
	}

	const user = seeUser(event.author.id);
	if (user.verified) {
		log.debug("Member has already been verified!");
		return;
	}

	log.debug(`Message count is ${user.count}.`);
	if (user.count > minimumMessages) {
		log.debug("Verifying member...");
		if (event.member.moderatable) {
			event.member.roles.add(roleId);
		}

		verifyUser(event.member.id);
		log.debug("Verified member!");
	}
});
