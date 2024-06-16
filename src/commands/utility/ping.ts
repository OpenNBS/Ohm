import type { CommandInteraction } from "discord.js";
import type { CommandMeta } from "~/types/Command.ts";

export const meta: CommandMeta = {
	"label": "Ping",
	"description": "Checks the latency between the bot and Discord's servers.",
	"permission": "member"
};

export async function run(interaction: CommandInteraction) {
	const start = Date.now();

	const reply = await interaction.reply({
		"content": "Testing ping...",
		"ephemeral": true
	});

	const end = Date.now();

	await reply.edit(`The bot's ping is ${end - start} milliseconds.`);
}
