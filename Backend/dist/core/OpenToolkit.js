"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenToolkit = void 0;
const OBSController_js_1 = require("./OBSController.js");
const BitrateManager_js_1 = require("./BitrateManager.js");
const RTMPServer_js_1 = require("./RTMPServer.js");
const config_js_1 = require("../utils/config.js");
class OpenToolkit {
    config = (0, config_js_1.loadConfig)();
    obs = new OBSController_js_1.OBSController(this.config);
    bitrate = new BitrateManager_js_1.BitrateManager(this.obs, this.config);
    rtmp;
    constructor() { }
    async initialize() {
        await this.obs.connect();
        await this.obs.cacheSceneInfo();
        this.startRTMP();
    }
    startRTMP() {
        this.rtmp = new RTMPServer_js_1.RTMPServer(session => console.log("[RTMP] START", session.id), session => console.log("[RTMP] STOP", session.id), data => this.handleBitrate(data));
        this.rtmp.start();
    }
    async handleBitrate(data) {
        this.bitrate.addBitrate(data.sessionId, data.inBps);
        await this.bitrate.update(data.sessionId);
    }
}
exports.OpenToolkit = OpenToolkit;
