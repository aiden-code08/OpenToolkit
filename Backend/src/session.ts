// types/nms-sessions.d.ts

import { Socket } from "net";
import { Request, Response } from "express";
import WebSocket from "ws";
import { AVPacket } from "../core/avpacket.js";
import BroadcastServer from "../server/broadcast_server.js";
import { IncomingMessage } from "obs-websocket-js";

export interface JWTUser {
    username: string;
    password: string;
    role?: string;
}

export interface JWTConfig {
    expiresIn: string;
    refreshExpiresIn: string;
    algorithm: string;
    users: JWTUser[];
}

export interface AuthConfig {
    play?: boolean;
    publish?: boolean;
    api?: boolean;
    secret?: string;
    jwt?: JWTConfig;
}

export interface RTMPConfig {
    port: number;
    chunk_size?: number;
    gop_cache?: boolean;
    ping?: number;
    ping_timeout?: number;
}

export interface HTTPConfig {
    mediaroot: string;
    port: number;
    allow_origin: string;
}

export interface NodeMediaServerConfig {
    bind: string;
    auth?: AuthConfig;
    rtmp?: RTMPConfig;
    http?: HTTPConfig;
}

// ================= BaseSession =================
export declare class BaseSession {
    id: string;
    ip: string;
    isPublisher: boolean;
    protocol: string;
    streamHost: string;
    streamApp: string;
    streamName: string;
    streamPath: string;
    streamQuery: Record<string, any>;
    createTime: number;
    endTime: number;

    videoCodec: number;
    videoWidth: number;
    videoHeight: number;
    videoFramerate: number;
    videoDatarate: number;
    audioCodec: number;
    audioChannels: number;
    audioSamplerate: number;
    audioDatarate: number;

    inBytes: number;
    outBytes: number;

    filePath: string;

    sendBuffer(buffer: Buffer): void;
    close(): void;
}

// ================= RtmpSession =================
export declare class RtmpSession extends BaseSession {
    socket: Socket;
    rtmp: any;
    broadcast: BroadcastServer;

    constructor(socket: Socket);

    run(): void;
    onConnect(req: { app: string; name: string; host: string; query: Record<string, any> }): void;
    onPlay(): void;
    onPush(): void;
    onOutput(buffer: Buffer): void;
    onPacket(packet: AVPacket): void;
    onData(data: Buffer): void;
    onClose(): void;
    onError(error: Error): void;
}

export declare class NodeRecordSession extends BaseSession {
    broadcast: BroadcastServer;
    fileStream: import("fs").WriteStream;

    constructor(session: BaseSession, filePath: string);

    run(): void;
    sendBuffer(buffer: Buffer): void;
}
export declare class FlvSession extends BaseSession {
    req: Request | IncomingMessage;
    res: Response | WebSocket;
    flv: any;

    constructor(req: Request | IncomingMessage, res: Response | WebSocket);

    run(): void;
    onPlay(): void;
    onPush(): void;
    onData(data: Buffer): void;
    onClose(): void;
    onError(err: string): void;
    onPacket(packet: AVPacket): void;
    sendBuffer(buffer: Buffer): void;
    close(): void;
}
