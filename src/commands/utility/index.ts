import type { CategoryMeta } from "~/types/Command.ts";

export const meta: CategoryMeta = {
	"label": "Utility",
	"description": "Various non-categorized utilities for niche purposes."
}

export * as mock from "./mock";
export * as ping from "./ping";
