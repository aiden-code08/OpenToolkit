"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenToolkit = exports.obs = exports.sessions = void 0;
const OBSController_js_1 = require("./OBSController.js");
const BitrateManager_js_1 = require("./BitrateManager.js");
const RTMPServer_js_1 = require("./RTMPServer.js");
const config_js_1 = require("../utils/config.js");
const logger_js_1 = require("../utils/logger.js");
exports.sessions = new Map();
const config = (0, config_js_1.loadConfig)();
exports.obs = new OBSController_js_1.OBSController(config);
class OpenToolkit {
    rtmp;
    bitrate = new BitrateManager_js_1.BitrateManager(exports.obs, config);
    constructor() { }
    async initialize() {
        await exports.obs.connect();
        await exports.obs.cacheSceneInfo();
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
