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
        this.database.prepare(`
            CREATE TABLE IF NOT EXISTS accounts (
                id TEXT NOT NULL,
                username TEXT NOT NULL,
                password TEXT NOT NULL,
                token TEXT NOT NULL,
                roleid TEXT,
                permissionid TEXT
            );
        `).run();
        this.database.prepare(`
            CREATE TABLE IF NOT EXISTS sessions (
                sessionid TEXT NOT NULL,
                streamkey TEXT NOT NULL
            );
        `).run();
        this.database.prepare(`
            CREATE TABLE IF NOT EXISTS streamkeys (
                key TEXT NOT NULL
            );
        `).run();
        this.database.prepare(`
            CREATE TABLE IF NOT EXISTS roles (
                roleid INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                permissionid INTEGER NOT NULL
            );
        `).run();
        this.database.prepare(`
            CREATE TABLE IF NOT EXISTS permissions (
                permission INTEGER PRIMARY KEY AUTOINCREMENT,
                roleid TEXT,

                streamToggle INTEGER DEFAULT 0 CHECK (streamToggle IN (0, 1)),
                streamSetBitrate INTEGER DEFAULT 0 CHECK (streamSetBitrate IN (0, 1)),

                ingest_select INTEGER DEFAULT 0 CHECK (ingest_select IN (0, 1)),
                ingest_manage INTEGER DEFAULT 0 CHECK (ingest_manage IN (0, 1)),

                remote_obs_view INTEGER DEFAULT 0 CHECK (remote_obs_view IN (0, 1)),
                remote_obs_input INTEGER DEFAULT 0 CHECK (remote_obs_input IN (0, 1)),

                logs_view INTEGER DEFAULT 0 CHECK (logs_view IN (0, 1)),

                roles_new INTEGER DEFAULT 0 CHECK (roles_new IN (0, 1)),
                roles_modify INTEGER DEFAULT 0 CHECK (roles_modify IN (0, 1)),
                roles_view INTEGER DEFAULT 0 CHECK (roles_view IN (0, 1)),

                permissions_new INTEGER DEFAULT 0 CHECK (permissions_new IN (0, 1)),
                permissions_manage INTEGER DEFAULT 0 CHECK (permissions_manage IN (0, 1))
            );

        `).run();
    }
    /**
     * ----------------------------------
     * > Accounts
     * ----------------------------------
     */
    getAccounts() {
        const query = this.database.prepare("SELECT * FROM accounts");
        return query.all();
    }
    getAccount(username) {
        const query = this.database.prepare("SELECT * FROM accounts WHERE username = ?;");
        return query.get(username);
    }
    getAccountByToken(token) {
        const query = this.database.prepare("SELECT * FROM accounts WHERE token = ?;");
        return query.get(token);
    }
    setAccountToken(username, token) {
        const query = this.database.prepare("UPDATE accounts SET token = ? WHERE username = ?");
        query.run(token, username);
    }
    /**
     * ----------------------------------
     * > Roles
     * ----------------------------------
     */
    getRoles() {
        const query = this.database.prepare("SELECT * FROM roles");
        return query.all();
    }
    getRole(roleid) {
        const query = this.database.prepare("SELECT * FROM roles WHERE roleid = ?");
        return query.get(roleid);
    }
    getRoleByPermissionid(permissionid) {
        const query = this.database.prepare("SELECT * FROM roles WHERE permissionid = ?");
        return query.all(permissionid);
    }
    /**
     * ----------------------------------
     * > Account Permissions
     * ----------------------------------
     */
    getPermissions() {
        const query = this.database.prepare("SELECT * FROM permissions");
        return query.all();
        ;
    }
    getPermission(permissionid) {
        const query = this.database.prepare("SELECT * FROM permissions WHERE permissionid = ?");
        return query.get(permissionid);
    }
    getPermissionByRoleId(roleid) {
        const query = this.database.prepare("SELECT * FROM permissions WHERE roleid = ?");
        return query.get(roleid);
    }
    /**
     * ----------------------------------
     * > Sessions
     * ----------------------------------
     */
    getSessions() {
        const query = this.database.prepare("SELECT * FROM sessions");
        return query.all();
        ;
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
