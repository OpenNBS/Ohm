import type { Channel, User } from "discord.js";
import { Events } from "discord.js";
import { sleep } from "bun";
import { client } from "~/client";
import { number, string } from "~/util/env";
import { getUser } from "~/database";
import { log } from "~/log";

const ruleId = string("AUTOMOD_RULE_ID");
const minimumMessages = number("MINIMUM_MESSAGES");

function formatReason(mention?: string, messages?: number) {
	let base = "prevent spam, links are blocked until you're verified.";

	if (mention) {
		base = `${mention}, to ${base}`;
	} else {
		base = `To ${base}`;
	}

	if (messages !== undefined) {
		base += ` ${messages} ${messages > 1 ? "messages" : "message"} to go!`;
	}

	return base;
}

function getReason(user?: User, toMention = false) {
	const mention = toMention && user ? `<@${user.id}>` : undefined;
	let messages: number | undefined;

	if (user) {
		const databaseUser = getUser(user.id);
		messages = minimumMessages - (databaseUser?.message_count ?? 0);
	}

	return formatReason(mention, messages);
}

async function sendMessage(channel: Channel | null, reason: string) {
	if (!channel || !("send" in channel)) {
		return;
	}

	log.debug("Sending blocked reason channel message...");
	const message = await channel.send(reason);

	await sleep(7000);
	message.delete();
}

client.on(Events.AutoModerationActionExecution, async (action) => {
	if (action.ruleId !== ruleId || action.alertSystemMessageId) {
		return;
	}

	log.debug(`Detected auto moderation action for user ${action.userId}...`);

	if (!action.user) {
		log.debug("User is not defined.");

		await sendMessage(action.channel, getReason());
		return;
	}

	let success: boolean;
	try {
		await action.user.send(getReason(action.user));
		success = true;

		log.debug("Sent blocked reason in DM!");
	} catch {
		success = false;
	}

	if (!success) {
		await sendMessage(action.channel, getReason(action.user, true));
	}
});
