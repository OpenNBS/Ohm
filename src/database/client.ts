import { Database } from "bun:sqlite";

export const database = new Database("db.sqlite", {
	"create": true
});

database.exec("PRAGMA journal_mode = WAL;");
