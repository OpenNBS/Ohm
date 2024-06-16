import { type CommandInteraction, Events } from "discord.js";
import { client, guild } from "~/client.ts";
import { log } from "~/log.ts";
import type { Permission } from "~/types/Command.ts";
import { string } from "~/util/env.ts";
import * as categories from "./categories";

interface Handlers {
	[id: string]: {
		"permission": Permission;
		"runner": (interaction: CommandInteraction) => void | Promise<void>;
	};
}

const handlers: Handlers = {};

const administratorRole = string("ADMINISTRATOR_ROLE");
const moderatorRole = string("MODERATOR_ROLE");

for (const [categoryKey, { meta, ...commands }] of Object.entries(categories)) {
	log.debug(`Registering commands in category "${categoryKey}"...`);

	for (const [commandKey, { meta, run }] of Object.entries(commands)) {
		log.debug(`Registering command "${commandKey}"...`);

		if (handlers[commandKey]) {
			throw `Duplicate commands "${commandKey}" exist!`;
		}

		handlers[commandKey] = {
			"permission": meta.permission as Permission,
			"runner": run
		};

		// TODO: only do this when required
		await guild.commands.create({
			"name": commandKey,
			"description": meta.description ?? ""
		});
	}

	log.info(`Registered ${meta.label.toLocaleLowerCase()} commands!`);
}

client.on(Events.InteractionCreate, async (interaction) => {
	if (!interaction.isCommand()) {
		return;
	}

	log.debug(`Handling command "${interaction.commandName}"`);

	const handler = handlers[interaction.commandName];
	if (!handler) {
		log.warn(`User "${interaction.user.username}" executed non-existent command "${interaction.commandName}"..?`);
		return;
	}

	if (handler.permission !== "member") {
		log.debug(`Checking permissions for member ${interaction.user.username}...`);

		const member = await guild.members.fetch(interaction.user.id);
		if (!member.roles.cache.get(handler.permission === "administrator" ? administratorRole : moderatorRole)) {
			interaction.reply({
				"content": "You do not have permission to run this command.",
				"ephemeral": true
			});

			return;
		}

		log.debug("Member has the required role to use this command");
	}

	await handler.runner(interaction);
});
