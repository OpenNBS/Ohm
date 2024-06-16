import type { ApplicationCommandDataResolvable } from "discord.js";

export type Permission = "member" | "moderator" | "administrator";

export interface CommandMeta {
	"builder": ApplicationCommandDataResolvable;
	"permission": Permission;
}

export interface CategoryMeta {
	"label": string;
	"description"?: string;
}
