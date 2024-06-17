import type { ApplicationCommandDataResolvable, ChatInputCommandInteraction } from "discord.js";

export type Permission = "member" | "moderator" | "administrator";

export interface CommandMeta {
	"permission": Permission;
	"builder": ApplicationCommandDataResolvable;
	"run": (interaction: ChatInputCommandInteraction) => void | Promise<void>;
}

export interface CategoryMeta {
	"label": string;
	"description"?: string;
}
