import { Database } from "bun:sqlite";
import { log } from "./log";
import { number } from "./util/env";

interface User {
	"id": number;
	// biome-ignore lint/style/useNamingConvention: SQLite convention is in snake_case
	"message_count": number;
	// biome-ignore lint/style/useNamingConvention: SQLite convention is in snake_case
	"last_seen": number;
	"verified": boolean;
}

const messageCooldown = number("MESSAGE_COOLDOWN");

const database = new Database("db.sqlite", {
	"create": true
});

database.exec("PRAGMA journal_mode = WAL;");
database
	.query(`
		CREATE TABLE IF NOT EXISTS users (
			id            TEXT    PRIMARY KEY,
			message_count INTEGER DEFAULT 1,
			last_seen     INTEGER DEFAULT 0,
			verified      BOOLEAN DEFAULT FALSE
		);
	`)
	.run();

const query = {
	"select": database.query("SELECT $id, message_count, last_seen, verified FROM users;"),
	"update": database.query("UPDATE users SET last_seen = unixepoch(CURRENT_TIMESTAMP), message_count = $count WHERE ID = $id;"),
	"verify": database.query("UPDATE users SET verified = true WHERE ID = $id;"),
	"create": database.query(`
		INSERT INTO users (id)
		VALUES ($id);
	`)
};

export function getUser(id: string) {
	const result = query.select.get({
		"$id": id
	});

	return result as User | undefined;
}

export function seeUser(id: string) {
	const user = getUser(id);

	if (!user) {
		query.create.run({
			"$id": id
		});

		return {
			"count": 1,
			"verified": false
		};
	}

	if (user.verified) {
		return {
			"count": user.message_count,
			"verified": true
		};
	}

	let count = user.message_count;
	if (Date.now() / 1000 - user.last_seen > messageCooldown) {
		log.debug("Message cooldown satisfied, incrementing count...");
		count++;
	}

	query.update.run({
		"$id": id,
		"$count": count
	});

	return {
		"count": count,
		"verified": false
	};
}

export function verifyUser(id: string) {
	query.verify.run({
		"$id": id
	});
}
