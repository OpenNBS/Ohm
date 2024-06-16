export type Permission = "member" | "moderator" | "administrator";

export interface CommandMeta {
	"label": string,
	"description"?: string,
	"permission": Permission
}

export interface CategoryMeta {
	"label": string,
	"description"?: string
}
