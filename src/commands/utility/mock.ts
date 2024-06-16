import type { ChatInputCommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "discord.js";
import { guild } from "~/client.ts";
import { log } from "~/log.ts";
import type { CommandMeta } from "~/types/Command.ts";

export const meta: CommandMeta = {
	"builder": new SlashCommandBuilder()
		.setName("mock")
		.setDescription("Takes the provided arguments and re-sends them as the bot.")
		.addStringOption((option) => option.setName("message").setDescription("The message to mock.").setRequired(true)),
	"permission": "administrator"
};

export async function run(interaction: ChatInputCommandInteraction) {
	const message = interaction.options.getString("message");
	if (!message) {
		log.warn(`User "${interaction.user.username}" didn't provide required argument "message" in command "${interaction.commandName}"..?`);

		return;
	}

	const channel = await guild.channels.fetch(interaction.channelId);
	if (!channel || !("send" in channel)) {
		await interaction.reply({
			"content": "Unable to mock message in this channel context.",
			"ephemeral": true
		});

		return;
	}

	await interaction.reply({
		"content": "Fine... here ya go.",
		"ephemeral": true
	});

	const success = await channel.send(message);
	if (!success) {
		await interaction.followUp({
			"content": "Seems as though I'm unable to send a message here! Shame!",
			"ephemeral": true
		});
	}
}
