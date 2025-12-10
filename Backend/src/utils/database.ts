import sql from "better-sqlite3"
import { Account, Session } from "../api/types";
import { PermissionSet, Role } from "../types";
import { db } from "../api/server";

export class Database {
    private database: sql.Database;

    constructor(init = false) {
        this.database = new sql("toolkit.db", { fileMustExist: false });
        if (init) this.initialize();
    }

    private initialize() {
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

    public getAccounts(): Account[] | null {
        const query = this.database.prepare("SELECT * FROM accounts");

        return query.all() as Account[];
    }

    public getAccount(username: string) {
        const query = this.database.prepare("SELECT * FROM accounts WHERE username = ?;");

        return query.get(username) as Account | null;
    }

    public getAccountByToken(token: string) {
        const query = this.database.prepare("SELECT * FROM accounts WHERE token = ?;");

        return query.get(token) as Account | null;
    }

    public setAccountToken(username: string, token: string) {
        const query = this.database.prepare("UPDATE accounts SET token = ? WHERE username = ?")
    
        query.run(token, username);
    }

    /**
     * ----------------------------------
     * > Roles
     * ----------------------------------
     */
    public getRoles(): Role[] | null {
        const query = this.database.prepare("SELECT * FROM roles");

        return query.all() as Role[];
    }

    public getRole(roleid: string): Role | null {
        const query = this.database.prepare("SELECT * FROM roles WHERE roleid = ?");

        return query.get(roleid) as Role;

    }

    public getRoleByPermissionid(permissionid: string): Role[] | null {
        const query = this.database.prepare("SELECT * FROM roles WHERE permissionid = ?");

        return query.all(permissionid) as Role[];
    }

    /**
     * ----------------------------------
     * > Account Permissions
     * ----------------------------------
     */
    public getPermissions(): PermissionSet[] | null {
        const query = this.database.prepare("SELECT * FROM permissions");

        return query.all() as PermissionSet[];;
    }

    public getPermission(permissionid: string): PermissionSet | null {
        const query = this.database.prepare("SELECT * FROM permissions WHERE permissionid = ?");

        return query.get(permissionid) as PermissionSet;
    }

    public getPermissionByRoleId(roleid: string): PermissionSet | null {
        const query = this.database.prepare("SELECT * FROM permissions WHERE roleid = ?");

        return query.get(roleid) as PermissionSet;
    }

    /**
     * ----------------------------------
     * > Sessions
     * ----------------------------------
     */

    public getSessions(): Session[] | null {
        const query = this.database.prepare("SELECT * FROM sessions");

        return query.all() as Session[];;
    }

    public getSession(sessionid: string): Session | null {
        const query = this.database.prepare("SELECT * FROM sessions WHERE sessionid = ?;");

        return query.get(sessionid) as Session | null;
    }

    public getSessionByStreamkey(streamkey: string): Session | null {
        const query = this.database.prepare("SELECT * FROM sessions WHERE streamkey = ?;");

        return query.get(streamkey) as Session | null;
    }

    // /**
    //  * ----------------------------------
    //  * > Stream Keys
    //  * ----------------------------------
    //  */

    // public getStreamkeys(): string[] | null {
    //     const query = this.database.prepare("SELECT * FROM streamkeys");

    //     const rows = query.all();

    //     return rows as string[];
    // }
    // public getStreamkey(key: string): string | null {
    //     const query = this.database.prepare("SELECT * FROM streamkeys WHERE key = ?");

    //     return query.get(key) as string;
    // }
}