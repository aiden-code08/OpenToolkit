"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolkitDatabase = void 0;
const sqlite3_1 = __importDefault(require("sqlite3"));
class ToolkitDatabase {
    db;
    constructor(path = "users.db") {
        this.db = new sqlite3_1.default.Database(path, (err) => {
            if (err) {
                throw new Error("Users database file was corrupted or moved. Re-correct the path or attempt to repair.");
            }
        });
        this.initializeSchema();
    }
    initializeSchema() {
        const schema = `
            CREATE TABLE IF NOT EXISTS accounts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL,
                password TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS sessions (
                sessionId TEXT NOT NULL,
                streamKey TEXT NOT NULL
            );
        `;
        this.db.exec(schema, (err) => {
            if (err) {
                console.error("Database schema initialization failed:", err);
            }
        });
    }
    get connection() {
        return this.db;
    }
    getAccounts() {
        return new Promise((resolve, reject) => {
            this.db.all("SELECT * FROM accounts", (err, rows) => {
                if (err)
                    return reject(err);
                resolve(rows);
            });
        });
    }
    addAccount(username, password) {
        return new Promise((resolve, reject) => {
            this.db.run("INSERT INTO accounts (username, password) VALUES (?, ?)", [username, password], function (err) {
                if (err)
                    return reject(err);
                resolve(this.lastID);
            });
        });
    }
}
exports.ToolkitDatabase = ToolkitDatabase;
