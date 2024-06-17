import { Events } from "discord.js";
import { client } from "~/client";
import { hasPermissions } from "~/helpers/role.ts";
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

		const difference = (now - joinMessage.timestamp) / 1000;

		log.debug(`Join message time difference is "${difference}".`);

		if (difference < 30) {
			return true;
		}
	}

	return false;
}

await hasPermissions("ManageMessages");
client.on(Events.MessageCreate, async (message) => {
	if (!isJoinMessage(message)) {
		return;
	}

	log.debug(`Detected join message for "${message.author.displayName}"`);

	if (isDuplicate(message.author.username)) {
		log.info(`Deleted a duplicate join message for ${message.author.username}!`);

		await message.delete();
	}

	updateLast(message.author.username);
});
