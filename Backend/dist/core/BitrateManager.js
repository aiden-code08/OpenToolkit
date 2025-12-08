"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BitrateManager = exports.bitrate = void 0;
exports.bitrate = 0;
class BitrateManager {
    obs;
    config;
    hideDelay;
    last = new Map();
    showLBRT = false;
    showLBRV = false;
    hideTimerText = null;
    hideTimerVideo = null;
    constructor(obs, config, hideDelay = 3000) {
        this.obs = obs;
        this.config = config;
        this.hideDelay = hideDelay;
    }
    addBitrate(streamId, bitrate) {
        const arr = this.last.get(streamId) ?? [];
        arr.push(bitrate);
        if (arr.length > 10)
            arr.shift();
        this.last.set(streamId, arr);
    }
    getAvg(streamId) {
        const arr = this.last.get(streamId);
        if (!arr || !arr.length)
            return 0;
        exports.bitrate = arr.reduce((a, b) => a + b) / arr.length / 1000;
        return exports.bitrate;
    }
    async update(streamId) {
        const avg = this.getAvg(streamId);
        const tThresh = this.config.low_bitrate_actions.screen_text;
        const vThresh = this.config.low_bitrate_actions.screen_animated_video;
        await this.obs.setTextAboveVideo();
        if (avg <= tThresh)
            this.forceShowText();
        else
            this.delayedHideText();
        if (avg <= vThresh)
            this.forceShowVideo();
        else
            this.delayedHideVideo();
    }
    async forceShowText() {
        // log("SHOW [text]")
        if (this.hideTimerText)
            clearTimeout(this.hideTimerText);
        if (!this.showLBRT) {
            this.showLBRT = true;
            await this.obs.setEnabled(this.obs.LBRT_itemId, true);
        }
    }
    delayedHideText() {
        // log("HIDE [text]")
        if (!this.hideTimerText) {
            this.hideTimerText = setTimeout(async () => {
                this.showLBRT = false;
                await this.obs.setEnabled(this.obs.LBRT_itemId, false);
                this.hideTimerText = null;
            }, this.hideDelay);
        }
    }
    async forceShowVideo() {
        // log("SHOW [video]")
        if (this.hideTimerVideo)
            clearTimeout(this.hideTimerVideo);
        if (!this.showLBRV) {
            this.showLBRV = true;
            await this.obs.setEnabled(this.obs.LBRV_itemId, true);
        }
    }
    delayedHideVideo() {
        // log("HIDE [video]")
        if (!this.hideTimerVideo) {
            this.hideTimerVideo = setTimeout(async () => {
                this.showLBRV = false;
                await this.obs.setEnabled(this.obs.LBRV_itemId, false);
                this.hideTimerVideo = null;
            }, this.hideDelay);
        }
    }
}
exports.BitrateManager = BitrateManager;
