import { OBSWebSocket } from "obs-websocket-js";
import { XMLParser } from "fast-xml-parser";
import * as fs from "fs";
import os from 'os';

import { Config } from "./lib/types";
import NodeMediaServer from "node-media-server";
import path from "path";
import { BaseSession } from "./session";

class OpenToolkit {
    private obs = new OBSWebSocket();
    private showingLBRT = false;
    private config!: Config;

    private sceneUuid!: string;
    private LBRT_itemId!: number;

    private updateTimer: NodeJS.Timeout | null = null;

    private lastBytes: Map<string, number> = new Map()
    private lastTime: Map<string, number> = new Map()

    private sessions: Map<String, BaseSession> = new Map()

    private mediaServer!: NodeMediaServer;

    constructor() {
        this.initialize();
    }

    private async initialize() {
        this.loadConfig();
        await this.connectOBS();
        await this.cacheSceneInfo();
        this.startRTMPServer();
    }

    private startRTMPServer() {
        this.mediaServer = new NodeMediaServer({
            bind: "127.0.0.1",
            logType: 0,
            auth: {
                play: false,
                publish: false,
                api: true,
                secret: "nodemedia2017privatekey",
                jwt: {
                    expiresIn: "24h",
                    refreshExpiresIn: "7d",
                    algorithm: "HS256",
                    users: [
                        { username: "admin", password: "admin123", role: "admin" }
                    ]
                }
            },
            rtmp: {
                port: 1935,
                chunk_size: 60000,
                gop_cache: true,
                ping: 30,
                ping_timeout: 60
            },
            http: {
                mediaroot: path.join(os.homedir(), 'Documents/OpenToolkit/Frontend'),
                port: 8000,
                allow_origin: '*'
            }
        });
        this.mediaServer.run()

        this.mediaServer.on('postPublish', (session: BaseSession) => {
            console.log("[RTMP] Stream Started:", session.id)
            this.updateLoop(session)
        });

        this.mediaServer.on("bitrateUpdate", (data) => {
            console.clear()
            console.log(`Session ${data.sessionId} (${data.streamPath})`);
            console.log(`    Incoming: ${Math.round(data.inBps / 1000)} Kbps, Outgoing: ${Math.round(data.outBps / 1000)} Kbps`);
        });

        this.mediaServer.on("sessionUpdate", (session: BaseSession) => {
            this.sessions.set(session.id, session)
        })

        this.mediaServer.on('donePublish', (session: BaseSession) => {
            console.log("[RTMP] Stream ended:", session.id);
            if (this.updateTimer) clearInterval(this.updateTimer)
        });
    }

    private loadConfig() {
        this.config = JSON.parse(fs.readFileSync("config.json", "utf-8")) as Config;
    }

    private async getToken() {
        const response = await fetch('http://localhost:8000/api/v1/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'admin123' })
        });
        return JSON.parse(await response.text()).data.token
    }

    private async connectOBS() {
        if (this.obs.identified) return;

        console.log("Connecting to OBS WebSocket...");

        try {
            await this.obs.connect("ws://localhost:4455");
            console.log("Connected to OBS.");
        } catch (err) {
            console.error("Failed to connect to OBS:", err);
            setTimeout(() => this.connectOBS(), 2000);
        }
    }

    private async cacheSceneInfo() {
        const { scenes } = await this.obs.call("GetSceneList");

        const mainScene = scenes.find(
            (s) => s.sceneUuid === this.config.main_scene.scene_uuid
        );

        if (!mainScene) throw new Error("Main scene not found in OBS");

        //@ts-ignore
        this.sceneUuid = mainScene.sceneUuid;

        const { sceneItems } = await this.obs.call("GetSceneItemList", {
            sceneUuid: this.sceneUuid,
        });

        const LBRT_item = sceneItems.find(
            (s) => s.sourceUuid === this.config.main_scene.sources.low_bitrate.text_uuid
        );

        if (!LBRT_item)
            throw new Error("Low bitrate source not found in the main scene!");

        //@ts-ignore
        this.LBRT_itemId = LBRT_item.sceneItemId;

        console.log("Scene cached. LBRT Scene Item ID:", this.LBRT_itemId);
    }

    private updateLoop(session: BaseSession) {
        // if (this.updateTimer) clearInterval(this.updateTimer);

        // this.sessions.set(session.id, session);
        // const sessionKey = session.id;

        // this.updateTimer = setInterval(async () => {
        //     try {
                
        //     } catch (err) {
        //         console.error("Update loop error:", err);
        //     }
        // }, 200);
    }

    private async showLBRT() {
        if (this.showingLBRT) return;

        await this.obs.call("SetSceneItemEnabled", {
            sceneUuid: this.sceneUuid,
            sceneItemId: this.LBRT_itemId,
            sceneItemEnabled: true,
        });

        this.showingLBRT = true;
        console.log("[LBRT] SHOW");
    }

    private async hideLBRT() {
        if (!this.showingLBRT) return;

        await this.obs.call("SetSceneItemEnabled", {
            sceneUuid: this.sceneUuid,
            sceneItemId: this.LBRT_itemId,
            sceneItemEnabled: false,
        });

        this.showingLBRT = false;
        console.log("[LBRT] HIDE");
    }
}

new OpenToolkit();