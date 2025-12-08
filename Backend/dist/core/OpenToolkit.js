"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenToolkit = exports.sessions = void 0;
const OBSController_js_1 = require("./OBSController.js");
const BitrateManager_js_1 = require("./BitrateManager.js");
const RTMPServer_js_1 = require("./RTMPServer.js");
const config_js_1 = require("../utils/config.js");
const logger_js_1 = require("../utils/logger.js");
exports.sessions = new Map();
class OpenToolkit {
    config = (0, config_js_1.loadConfig)();
    rtmp;
    obs = new OBSController_js_1.OBSController(this.config);
    bitrate = new BitrateManager_js_1.BitrateManager(this.obs, this.config);
    constructor() { }
    async initialize() {
        await this.obs.connect();
        await this.obs.cacheSceneInfo();
        this.startRTMP();
    }
    startRTMP() {
        this.rtmp = new RTMPServer_js_1.RTMPServer(session => this.handleValidation(session), session => {
            exports.sessions.set(session.id, this);
            (0, logger_js_1.log)("START", session.id);
        }, session => (0, logger_js_1.log)("STOP", session.id), data => this.handleBitrate(data));
        this.rtmp.start();
    }
    async handleBitrate(data) {
        this.bitrate.addBitrate(data.sessionId, data.inBps);
        await this.bitrate.update(data.sessionId);
    }
    async handleValidation(session) {
        //     if (session.rtmp.streamApp === "live") {
        //         console.log(session.rtmp.streamName);
        //     }
    }
}
exports.OpenToolkit = OpenToolkit;
