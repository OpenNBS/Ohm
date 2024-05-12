import { Events } from "discord.js";
import { client } from "~/client";
import { log } from "~/log";
import { string } from "~/util/env";

const roles = {
	"supporter": string("SUPPORTER_ROLE"),
	"donator": string("DONATOR_ROLE"),
	"booster": string("BOOSTER_ROLE")
};

client.on(Events.GuildMemberUpdate, (old, current) => {
	const hadSupporter = old.roles.cache.has(roles.supporter);
	const hasSupporter = current.roles.cache.has(roles.supporter);
	if (hadSupporter !== hasSupporter) {
		return;
	}

	const hadDonator = old.roles.cache.has(roles.donator);
	const hasDonator = current.roles.cache.has(roles.donator);

	const hadBooster = old.roles.cache.has(roles.booster);
	const hasBooster = current.roles.cache.has(roles.booster);

	log.debug(`Roles updated for ${current.displayName}.`);
	log.debug(`Donator role: ${hadDonator} -> ${hasDonator}`);
	log.debug(`Booster role: ${hadBooster} -> ${hasBooster}`);

	if (hadDonator === hasDonator && hadBooster === hasBooster) {
		log.debug("Nothing changed! Not modifying roles.");
		return;
	}

	if ((!hadDonator && hasDonator) || (!hadBooster && hasBooster)) {
		log.debug("Adding the supporter role!");

		current.roles.add(roles.supporter);
		return;
	}

	if (hadBooster && !hasBooster) {
		log.debug("Removing the supporter role!");

		current.roles.remove(roles.supporter);
	}
});
