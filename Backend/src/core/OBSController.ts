import { OBSWebSocket } from "obs-websocket-js";
import { Config, OBSConfig } from "../types.js";
import { error, log } from "../utils/logger.js";
import { loadOBSConfig } from "../utils/config.js";

export class OBSController {
    public obs = new OBSWebSocket();

    public sceneUuid!: string;
    public lowBitrateGroupId!: string;

    public LBRT_itemId!: number;
    public LBRV_itemId!: number;
    public LBRV_index!: number;
    public obsConfig: OBSConfig = loadOBSConfig();

    public reconnectRetries: number = 0;

    public connected: boolean = false;
    public reconnecting: boolean = false;

    constructor(private config: Config) { }

    async connect() {
        while (!this.connected) {
            this.reconnecting = true;
            this.obs.once("ConnectionOpened", () => this.connected = true)

            await this.obs.connect()

            if (this.connected) log("Connection to OBS Websocket successful."), this.reconnecting = false;

            await new Promise((res) => setInterval(res, 500))
        }
    }

    async cacheSceneInfo() {
        const { scenes } = await this.obs.call("GetSceneList");

        const mainScene = scenes.find(
            s => s.sceneUuid === this.config.main_scene.scene_uuid
        );

        if (!mainScene) throw new Error("Main scene not found");

        this.sceneUuid = mainScene.sceneUuid as string;

        const { sceneItems } = await this.obs.call("GetSceneItemList", {
            sceneUuid: this.sceneUuid,
        });

        const folder = sceneItems.find(
            i => i.sourceUuid === this.config.main_scene.sources.low_bitrate.folder
        );

        if (!folder) throw new Error("Low bitrate folder missing");

        this.lowBitrateGroupId = folder.sourceUuid as string;

        const { sceneItems: groupItems } = await this.obs.call("GetGroupSceneItemList", {
            sceneUuid: folder.sourceUuid as string
        });

        const textItem = groupItems.find(
            i => i.sourceUuid === this.config.main_scene.sources.low_bitrate.text_uuid
        );

        const videoItem = groupItems.find(
            i => i.sourceUuid === this.config.main_scene.sources.low_bitrate.video_uuid
        );

        if (!textItem || !videoItem) {
            throw new Error("Text or video in low bitrate group missing");
        }

        this.LBRT_itemId = textItem.sceneItemId as number;
        this.LBRV_itemId = videoItem.sceneItemId as number;
        this.LBRV_index = videoItem.sceneItemIndex as number;

        log("OBS scene cached");
    }

    async setEnabled(itemId: number, enabled: boolean) {
        return this.obs.call("SetSceneItemEnabled", {
            sceneUuid: this.lowBitrateGroupId,
            sceneItemId: itemId,
            sceneItemEnabled: enabled,
        });
    }

    async setTextAboveVideo() {
        return this.obs.call("SetSceneItemIndex", {
            sceneUuid: this.lowBitrateGroupId,
            sceneItemId: this.LBRT_itemId,
            sceneItemIndex: this.LBRV_index + 1
        });
    }
}