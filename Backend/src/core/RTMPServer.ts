import NodeMediaServer from "node-media-server";
import os from "os";
import path from "path";

export class RTMPServer {
    server!: NodeMediaServer;

    constructor(private onPreStart: Function, private onStart: Function, private onStop: Function, private onBitrate: Function) { }

    start() {
        this.server = new NodeMediaServer({
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
                mediaroot: path.join(os.homedir(), "Documents/OpenToolkit/Frontend"),
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
