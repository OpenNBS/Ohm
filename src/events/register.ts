import { opendir } from "node:fs/promises";
import { basename, resolve, join } from "node:path";
import { log } from "~/log";

const self = basename(__filename);
const path = resolve(__dirname);

// TODO: Abstract this so it can be used for other listeners (commands)
export async function register() {
	log.info("Registering all Discord listeners...");

	const directory = await opendir(path);
	for await (const entry of directory) {
		if (entry.name === self) {
			continue;
		}

		log.debug(`Registering ${entry.name}...`);
		await import(join(path, entry.name));
		log.debug("Done! Moving on...");
	}

	log.info("Finished registering!");
}
