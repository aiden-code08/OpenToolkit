import { OBSWebSocket } from "obs-websocket-js";
import * as fs from "fs";
import os from 'os';
import NodeMediaServer from "node-media-server";
import path from "path";
class OpenToolkit {
    obs = new OBSWebSocket();
    showingLBRT = false;
    config;
    sceneUuid;
    LBRT_itemId;
    updateTimer = null;
    lastBytes = new Map();
    lastTime = new Map();
    sessions = new Map();
    mediaServer;
    constructor() {
        this.initialize();
    }
    async initialize() {
        this.loadConfig();
        await this.connectOBS();
        await this.cacheSceneInfo();
        this.startRTMPServer();
    }
    startRTMPServer() {
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
        this.mediaServer.run();
        this.mediaServer.on('postPublish', (session) => {
            console.log("[RTMP] Stream Started:", session.id);
            this.updateLoop(session);
        });
        this.mediaServer.on("bitrateUpdate", (data) => {
            console.clear();
            console.log(`Session ${data.sessionId} (${data.streamPath})`);
            console.log(`    Incoming: ${Math.round(data.inBps / 1000)} Kbps, Outgoing: ${Math.round(data.outBps / 1000)} Kbps`);
        });
        this.mediaServer.on("sessionUpdate", (session) => {
            this.sessions.set(session.id, session);
        });
        this.mediaServer.on('donePublish', (session) => {
            console.log("[RTMP] Stream ended:", session.id);
            if (this.updateTimer)
                clearInterval(this.updateTimer);
        });
    }
    loadConfig() {
        this.config = JSON.parse(fs.readFileSync("config.json", "utf-8"));
    }
    async getToken() {
        const response = await fetch('http://localhost:8000/api/v1/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'admin123' })
        });
        return JSON.parse(await response.text()).data.token;
    }
    async connectOBS() {
        if (this.obs.identified)
            return;
        console.log("Connecting to OBS WebSocket...");
        try {
            await this.obs.connect("ws://localhost:4455");
            console.log("Connected to OBS.");
        }
        catch (err) {
            console.error("Failed to connect to OBS:", err);
            setTimeout(() => this.connectOBS(), 2000);
        }
    }
    async cacheSceneInfo() {
        const { scenes } = await this.obs.call("GetSceneList");
        const mainScene = scenes.find((s) => s.sceneUuid === this.config.main_scene.scene_uuid);
        if (!mainScene)
            throw new Error("Main scene not found in OBS");
        //@ts-ignore
        this.sceneUuid = mainScene.sceneUuid;
        const { sceneItems } = await this.obs.call("GetSceneItemList", {
            sceneUuid: this.sceneUuid,
        });
        const low_bitrate_folder = sceneItems.find((i) => i.sourceUuid === this.config.main_scene.sources.low_bitrate.folder);
        // try {
        //     const lbf_list = this.obs.call("GetSceneItemList", {
        //         sceneUuid: low_bitrate_folder.sourceUuid
        //     });
        // } catch { }
        const lbf_list = await this.obs.call("GetGroupSceneItemList", {
            sceneUuid: low_bitrate_folder.sourceUuid
        });
        const low_bitrate_text = lbf_list.sceneItems.find(({ sourceUuid }) => sourceUuid === this.config.main_scene.sources.low_bitrate.text_uuid);
        this.LBRT_itemId = low_bitrate_text.sceneItemId;
        console.log("Scene cached. LBRT Scene Item ID:", this.LBRT_itemId);
    }
    updateLoop(session) {
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
    async showLBRT() {
        if (this.showingLBRT)
            return;
        await this.obs.call("SetSceneItemEnabled", {
            sceneUuid: this.sceneUuid,
            sceneItemId: this.LBRT_itemId,
            sceneItemEnabled: true,
        });
        this.showingLBRT = true;
        console.log("[LBRT] SHOW");
    }
    async hideLBRT() {
        if (!this.showingLBRT)
            return;
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
