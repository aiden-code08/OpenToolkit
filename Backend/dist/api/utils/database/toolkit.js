"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolkitDatabase = void 0;
const sqlite3_1 = __importDefault(require("sqlite3"));
class ToolkitDatabase {
    db;
    constructor(path = "toolkit.db") {
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
                password TEXT NOT NULL,
                token TEXT NOT NULL
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
    getAccount(username) {
        return new Promise((resolve, reject) => {
            this.db.get("SELECT * FROM accounts WHERE username = ?", [username], (err, row) => {
                if (err)
                    return reject(err);
                resolve(row ?? null);
            });
        });
    }
    getAccountByToken(token) {
        return new Promise((resolve, reject) => {
            this.db.get("SELECT * FROM accounts WHERE token = ?", [token], (err, row) => {
                if (err)
                    return reject(err);
                resolve(row ?? null);
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
    addSession(sessionId, streamKey) {
        return new Promise((resolve, reject) => {
            this.db.run("INSERT INTO sessions (sessionId, streamKey) VALUES (?, ?)", [sessionId, streamKey], function (err) {
                if (err)
                    return reject(err);
                resolve(this.lastID);
            });
        });
    }
    getSession(identifier) {
        return new Promise((resolve, reject) => {
            let query = "";
            let value = "";
            if (identifier.sessionId) {
                query = "SELECT * FROM sessions WHERE sessionId = ?";
                value = identifier.sessionId;
            }
            else if (identifier.streamKey) {
                query = "SELECT * FROM sessions WHERE streamKey = ?";
                value = identifier.streamKey;
            }
            else {
                return reject(new Error("No sessionId or streamKey provided."));
            }
            this.db.all(query, [value], (err, rows) => {
                if (err)
                    return reject(err);
                resolve(rows);
            });
        });
    }
    getSessions() {
        return new Promise((resolve, reject) => {
            this.db.all("SELECT * FROM sessions", (err, rows) => {
                if (err)
                    return reject(err);
                resolve(rows);
            });
        });
    }
}
exports.ToolkitDatabase = ToolkitDatabase;
