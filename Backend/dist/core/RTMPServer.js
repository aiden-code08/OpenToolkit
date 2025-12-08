"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RTMPServer = void 0;
const node_media_server_1 = __importDefault(require("node-media-server"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
class RTMPServer {
    onPreStart;
    onStart;
    onStop;
    onBitrate;
    server;
    constructor(onPreStart, onStart, onStop, onBitrate) {
        this.onPreStart = onPreStart;
        this.onStart = onStart;
        this.onStop = onStop;
        this.onBitrate = onBitrate;
    }
    start() {
        this.server = new node_media_server_1.default({
            bind: "127.0.0.1",
            logType: 0,
            auth: {
                play: false,
                publish: false,
                api: true,
                secret: "nodemedia2017privatekey",
                //@ts-ignore
                jwt: {
                    expiresIn: "24h",
                    refreshExpiresIn: "7d",
                    algorithm: "HS256",
                    users: [{ username: "admin", password: "admin123", role: "admin" }],
                },
            },
            rtmp: {
                port: 1935,
                chunk_size: 60000,
                gop_cache: true,
                ping: 30,
                ping_timeout: 60,
            },
            http: {
                mediaroot: path_1.default.join(os_1.default.homedir(), "Documents/OpenToolkit/Frontend"),
                port: 8000,
                allow_origin: "*",
            },
            trans: {
                ffmpeg: '/usr/bin/ffmpeg',
                tasks: [
                    {
                        app: 'live',
                        hls: true,
                        hlsFlags: '[hls_time=2:hls_list_size=6:hls_flags=delete_segments]'
                    }
                ]
            }
        });
        this.server.run();
        this.server.on("prePublish", session => this.onPreStart(session));
        this.server.on("postPublish", session => this.onStart(session));
        this.server.on("donePublish", session => this.onStop(session));
        this.server.on("bitrateUpdate", data => this.onBitrate(data));
    }
}
exports.RTMPServer = RTMPServer;
