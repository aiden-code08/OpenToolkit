import { OBSController } from "./OBSController.js";
import { BitrateManager } from "./BitrateManager.js";
import { RTMPServer } from "./RTMPServer.js";
import { loadConfig } from "../utils/config.js";
import { log } from "../utils/logger.js";
import { Session } from "../api/types.js";

export const sessions = new Map<string, OpenToolkit>()

const config = loadConfig();
export const obs = new OBSController(config);
export let startTime: Number;

export class OpenToolkit {
    public rtmp!: RTMPServer;

    public bitrate = new BitrateManager(obs, config);

    constructor() { }

    public async initialize() {
        await obs.connect().then(async () =>
            await obs.cacheSceneInfo()
        )
        obs.obs.on("ConnectionClosed", this.handleDisconnect.bind(this))
    }

    public startRTMP() {
        this.rtmp = new RTMPServer(
            session => this.handleValidation(session),
            session => {
                startTime = Date.now();
                sessions.set(session.id, this)
                log("START", session.id)
            },
            session => {
                startTime = null;
                sessions.delete(session.id)
                log("STOP", session.id);
            },
            data => this.handleBitrate(data),
        );

        this.rtmp.start();
    }

    private async handleBitrate(data: { inBps; streamPath; sessionId }) {
        this.bitrate.addBitrate(data.sessionId, data.inBps);
        await this.bitrate.update(data.sessionId);
    }

    private async handleValidation(session: { id: string, rtmp: any, StreamPath: string, args: object }) {
        //     if (session.rtmp.streamApp === "live") {
        //         console.log(session.rtmp.streamName);
        //     }
    }

    private async handleDisconnect() {
        log(obs.reconnecting)
        if (obs.reconnecting) return;
        obs.connected = false
        log("OBS Websocket disconnected")
        await obs.connect();
        await obs.cacheSceneInfo();
    }
}
