import type { PermissionFlags } from "discord.js";
import { guild, managedRole } from "~/client.ts";
import { log } from "~/log.ts";

export async function validateRoles(...ids: string[]) {
	for (const id of ids) {
		log.debug(`Validating the position of role "${id}"...`);

		const targetRole = guild.roles.cache.get(id);
		if (!targetRole) {
			throw `Role with ID "${id}" cannot be found in guild "${guild.name}"!`;
		}

		log.debug(`Target role name: ${targetRole?.name}`);
		if (managedRole.position < targetRole.position) {
			throw `Managed role "${managedRole.name}" is above "${managedRole.name}", preventing the bot from managing it!`;
		}
	}
}

export async function hasPermissions(...permissions: (keyof PermissionFlags)[]) {
	for (const permission of permissions) {
		log.debug(`Ensuring that the bot has the permission "${permission}"...`);

		const hasPermission = managedRole.permissions.has(permission);
		if (hasPermission) {
			continue;
		}

		throw `The bot's managed role does not have the permission "${permission}"!`;
	}
}
