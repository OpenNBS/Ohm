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
			last_seen     INTEGER,
			verified      BOOLEAN DEFAULT FALSE
		);
	`)
	.run();

const query = {
	"select": database.query("SELECT id, message_count, last_seen, verified FROM users WHERE id = $id;"),
	"update": database.query("UPDATE users SET last_seen = $timestamp, message_count = $count WHERE ID = $id;"),
	"verify": database.query("UPDATE users SET verified = true WHERE ID = $id;"),
	"create": database.query(`
		INSERT INTO users (id, last_seen)
		VALUES ($id, $timestamp);
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
	if (user?.verified) {
		return {
			"count": user.message_count,
			"verified": true
		};
	}

	const now = Date.now();

	if (!user) {
		query.create.run({
			"$id": id,
			"$timestamp": now
		});

		return {
			"count": 1,
			"verified": false
		};
	}

	if ((now - user.last_seen) / 1000 < messageCooldown) {
		log.debug("Message cooldown hit. Not updating...");
		return;
	}

	const count = user.message_count + 1;

	query.update.run({
		"$id": id,
		"$timestamp": now,
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
