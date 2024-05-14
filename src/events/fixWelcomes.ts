import { Events } from "discord.js";
import { client } from "~/client";
import { isJoinMessage } from "~/util/message";
import { log } from "~/log";

interface JoinMessage {
	"username": string;
	"timestamp": number;
}

const joinMessages: JoinMessage[] = [];

function updateLast(username: string) {
	const timestamp = Date.now();

	joinMessages.unshift({
		username,
		timestamp
	});

	if (joinMessages.length > 3) {
		joinMessages.pop();
	}
}

function isDuplicate(username: string) {
	const now = Date.now();

	for (const joinMessage of joinMessages) {
		if (username !== joinMessage.username) {
			continue;
		}

		const difference = (now - joinMessage.timestamp) / 1000;

		log.debug(`Join message time difference is "${difference}".`);

		if (difference < 30) {
			return true;
		}
	}

	return false;
}

client.on(Events.MessageCreate, (message) => {
	if (!isJoinMessage(message)) {
		return;
	}

	log.debug(`Join message for member ${message.author.displayName} detected.`);

	if (isDuplicate(message.author.username)) {
		log.debug("...which is a duplicate!");
		message.delete();
	}

	updateLast(message.author.username);
});
