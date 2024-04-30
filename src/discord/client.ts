import { Client, GatewayIntentBits } from "discord.js";
import { log } from "../log";
import { string } from "../util/env";

log.info("Creating Discord client...");

export const client = new Client({
	"intents": [GatewayIntentBits.MessageContent, GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

const success = !!(await client.login(string("DISCORD_TOKEN")));

if (success) {
	log.info("Logged in!");
} else {
	throw "Client unable to log in.";
}
