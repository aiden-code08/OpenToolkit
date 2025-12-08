"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OBSController = void 0;
const obs_websocket_js_1 = require("obs-websocket-js");
const logger_js_1 = require("../utils/logger.js");
const config_js_1 = require("../utils/config.js");
class OBSController {
    config;
    obs = new obs_websocket_js_1.OBSWebSocket();
    sceneUuid;
    lowBitrateGroupId;
    LBRT_itemId;
    LBRV_itemId;
    LBRV_index;
    obsConfig = (0, config_js_1.loadOBSConfig)();
    reconnectRetries = 0;
    connected = false;
    reconnecting = false;
    constructor(config) {
        this.config = config;
    }
    async connect() {
        while (!this.connected) {
            this.reconnecting = true;
            this.obs.once("ConnectionOpened", () => this.connected = true);
            await this.obs.connect();
            if (this.connected)
                (0, logger_js_1.log)("Connection to OBS Websocket successful."), this.reconnecting = false;
            await new Promise((res) => setInterval(res, 500));
        }
    }
    async cacheSceneInfo() {
        const { scenes } = await this.obs.call("GetSceneList");
        const mainScene = scenes.find(s => s.sceneUuid === this.config.main_scene.scene_uuid);
        if (!mainScene)
            throw new Error("Main scene not found");
        this.sceneUuid = mainScene.sceneUuid;
        const { sceneItems } = await this.obs.call("GetSceneItemList", {
            sceneUuid: this.sceneUuid,
        });
        const folder = sceneItems.find(i => i.sourceUuid === this.config.main_scene.sources.low_bitrate.folder);
        if (!folder)
            throw new Error("Low bitrate folder missing");
        this.lowBitrateGroupId = folder.sourceUuid;
        const { sceneItems: groupItems } = await this.obs.call("GetGroupSceneItemList", {
            sceneUuid: folder.sourceUuid
        });
        const textItem = groupItems.find(i => i.sourceUuid === this.config.main_scene.sources.low_bitrate.text_uuid);
        const videoItem = groupItems.find(i => i.sourceUuid === this.config.main_scene.sources.low_bitrate.video_uuid);
        if (!textItem || !videoItem) {
            throw new Error("Text or video in low bitrate group missing");
        }
        this.LBRT_itemId = textItem.sceneItemId;
        this.LBRV_itemId = videoItem.sceneItemId;
        this.LBRV_index = videoItem.sceneItemIndex;
        (0, logger_js_1.log)("OBS scene cached");
    }
    async setEnabled(itemId, enabled) {
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
exports.OBSController = OBSController;
