"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
class Database {
    database;
    constructor(init = false) {
        this.database = new better_sqlite3_1.default("toolkit.db", { fileMustExist: false });
        if (init)
            this.initialize();
    }
    initialize() {
        this.database.prepare(`CREATE TABLE IF NOT EXISTS accounts (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL, password TEXT NOT NULL, token TEXT NOT NULL);`).run();
        this.database.prepare(`CREATE TABLE IF NOT EXISTS sessions (sessionid TEXT NOT NULL, streamkey TEXT NOT NULL);`).run();
    }
    /**
     * ----------------------------------
     * >            Accounts
     * ----------------------------------
     */
    getAccounts() {
        const query = this.database.prepare("SELECT * FROM accounts");
        const rows = query.all();
        return rows;
    }
    getAccount(username) {
        const query = this.database.prepare("SELECT * FROM accounts WHERE username = ?;");
        return query.get(username);
    }
    getAccountByToken(token) {
        const query = this.database.prepare("SELECT * FROM accounts WHERE token = ?;");
        return query.get(token);
    }
    // /**
    //  * ----------------------------------
    //  * >       Account Permissions
    //  * ----------------------------------
    //  */
    // public getPermissions(): PermissionSet[] {
    // }
    /**
     * ----------------------------------
     * >            Sessions
     * ----------------------------------
     */
    getSessions() {
        const query = this.database.prepare("SELECT * FROM sessions");
        const rows = query.all();
        return rows;
    }
    getSession(sessionid) {
        const query = this.database.prepare("SELECT * FROM sessions WHERE sessionid = ?;");
        return query.get(sessionid);
    }
    getSessionByStreamkey(streamkey) {
        const query = this.database.prepare("SELECT * FROM sessions WHERE streamkey = ?;");
        return query.get(streamkey);
    }
}
exports.Database = Database;
