import { Client, GatewayIntentBits } from "discord.js";
import { string } from "~/util/env";
import { log } from "~/log";

log.info("Creating Discord client...");

export const client = new Client({
	"intents": [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers, GatewayIntentBits.AutoModerationExecution]
});

const success = !!(await client.login(string("DISCORD_TOKEN")));

if (success) {
	log.info("Logged in!");
} else {
	throw "Client unable to log in.";
}
