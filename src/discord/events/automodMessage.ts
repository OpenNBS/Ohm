import type { Channel, User } from "discord.js";
import { Events } from "discord.js";
import { sleep } from "bun";
import { client } from "../client";
import { string } from "../../util/env";
import { log } from "../../log";

const ruleId = string("AUTOMOD_RULE_ID");
const blockedReason = "To prevent spam, links are blocked until you're verified! You'll be verified in a few messages :)";

function getReason(user?: User) {
	let reason = blockedReason;

	if (user) {
		reason = `<@${user.id}>, ${reason}`;
	}

	return reason;
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

		await sendMessage(action.channel, blockedReason);
		return;
	}

	let success: boolean;
	try {
		await action.user.send(blockedReason);
		success = true;

		log.debug("Sent blocked reason in DM!");
	} catch {
		success = false;
	}

	if (!success) {
		await sendMessage(action.channel, getReason(action.user));
	}
});
