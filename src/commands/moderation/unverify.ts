import { SlashCommandBuilder } from "discord.js";
import { wrapCommand } from "~/helpers/verify.ts";
import type { CommandMeta } from "~/types/Command.ts";

export const unverify: CommandMeta = {
	"permission": "moderator",
	"builder": new SlashCommandBuilder()
		.setName("unverify")
		.setDescription("Revoke a member's verification status and reset internal message count.")
		.addUserOption((option) => option.setName("member").setDescription("The member to unverify.").setRequired(true)),
	"run": async (interaction) => {
		await wrapCommand(interaction, false);
	}
};
