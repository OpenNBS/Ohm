import type { Message } from "discord.js";
import { MessageType } from "discord.js";

type PartialMessage = Pick<Message, "system" | "type">;

export function isSystemMessage({ system }: PartialMessage) {
	return system;
}

export function isJoinMessage(message: PartialMessage) {
	return isSystemMessage(message) && message.type === MessageType.UserJoin;
}
