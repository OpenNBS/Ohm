import { Client, GatewayIntentBits, type Role } from "discord.js";
import { log } from "~/log";
import { string } from "~/util/env";

log.info("Creating Discord client...");

export const client = new Client({
	"intents": [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers, GatewayIntentBits.AutoModerationExecution]
});

const success = !!(await client.login(string("DISCORD_TOKEN")));
if (!success || !client.user) {
	throw "Client unable to log in!";
}

export const username = client.user.username;
log.info(`Logged in under username "${username}".`);

log.debug("Fetching primary guild...");
await client.guilds.fetch();
export const guild = await client.guilds.fetch(string("GUILD_ID"));

log.debug("Finding managed role...");
let foundManagedRole: Role | undefined;
for (const [_, role] of guild.roles.cache) {
	if (role.name !== username) {
		continue;
	}

	foundManagedRole = role;
	break;
}

if (!foundManagedRole) {
	throw "Could not find the bot's managed role!";
}
log.debug(`Managed role ID: ${foundManagedRole.id}`);

export const managedRole = foundManagedRole;
log.info(`Managing guild "${guild.name}".`);
