import type { ChatInputCommandInteraction, GuildMember } from "discord.js";
import { guild } from "~/client.ts";
import { resetUser, verifyUser } from "~/database/users.ts";
import { hasPermissions, validateRoles } from "~/helpers/role.ts";
import { log } from "~/log.ts";
import { string } from "~/util/env.ts";

const verifiedRole = string("VERIFIED_ROLE");
await validateRoles(verifiedRole);
await hasPermissions("ManageRoles");

export async function manageVerification(member: GuildMember, toVerify: boolean) {
	if (!member.moderatable) {
		log.warn(`Cannot manage member's verification status ("${member.user.username}") due to permissions!`);
		return false;
	}

	log.debug(`Setting member's verification status ("${member.user.username}") to "${toVerify}"...`);
	await member.roles[toVerify ? "add" : "remove"](verifiedRole);

	setTimeout(() => {
		if (member.roles.cache.has(verifiedRole) === !toVerify) {
			log.warn(`Could not manage member's verification status! ("${member.user.username}") Not internally verifying.`);
			return false;
		}
	}, 3000);

	toVerify ? verifyUser(member.id) : resetUser(member.id);
	log.debug("Successfully managed member's verification status!");

	return true;
}

export async function wrapCommand(interaction: ChatInputCommandInteraction, toVerify: boolean) {
	const user = interaction.options.getUser("member", true);
	const member = await guild.members.fetch(user.id);

	const success = await manageVerification(member, toVerify);

	await interaction.reply({
		"content": success ? "Successfully managed member's verification status!" : "Something went wrong... Check the logs!",
		"ephemeral": true
	});
}
