import type { CommandMeta } from "~/types/Command.ts";

export const ping: CommandMeta = {
	"permission": "member",
	"builder": {
		"name": "ping",
		"description": "Checks the latency between the bot and Discord's servers."
	},
	"run": async (interaction) => {
		const start = Date.now();

		const reply = await interaction.reply({
			"content": "Testing ping...",
			"ephemeral": true
		});

		const end = Date.now();

		await reply.edit(`The bot's ping is ${end - start} milliseconds.`);
	}
};
