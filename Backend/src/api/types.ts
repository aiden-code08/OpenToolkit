export interface Config {
    host: string;
    port: number;
}

export interface JWT {
    expiresAt: string;
    token: string;
}

export interface Login {
    username: string;
    password: string;
}

export interface Account {
    id: string;
    username: string;
    password: string;
    token: string;
}

export interface Session {
    sessionId: string;
    streamKey: string;
}