import { SlashCommandBuilder } from "discord.js";
import { wrapCommand } from "~/helpers/verify.ts";
import type { CommandMeta } from "~/types/Command.ts";

export const verify: CommandMeta = {
	"permission": "moderator",
	"builder": new SlashCommandBuilder()
		.setName("verify")
		.setDescription("Manually verify a member.")
		.addUserOption((option) => option.setName("member").setDescription("The member to verify.").setRequired(true)),
	"run": async (interaction) => {
		await wrapCommand(interaction, true);
	}
};
