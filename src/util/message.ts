import type { Message } from "discord.js";
import { MessageType } from "discord.js";

export function isSystemMessage(message: Message) {
	if (message.system) {
		return true;
	}

	return false;
}

export function isJoinMessage(message: Message) {
	if (isSystemMessage(message) && message.type === MessageType.UserJoin) {
		return true;
	}

	return false;
}
