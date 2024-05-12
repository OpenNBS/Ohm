import { Events } from "discord.js";
import { client } from "~/client";
import { log } from "~/log";
import { isJoinMessage } from "~/util/message";

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

		if ((now - joinMessage.timestamp) / 1000 < 30) {
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
		log.debug("..which is a duplicate!");
		message.delete();
	}

	updateLast(message.author.username);
});
