import { log } from "../utils/logger.js";
import { OBSController } from "./OBSController.js";
import { Config } from "../types.js";

export let bitrate = 0;

export class BitrateManager {
    private last = new Map<string, number[]>();

    private showLBRT = false;
    private showLBRV = false;

    private hideTimerText: NodeJS.Timeout | null = null;
    private hideTimerVideo: NodeJS.Timeout | null = null;

    constructor(
        private obs: OBSController,
        private config: Config,
        private hideDelay = 3000
    ) {}

    addBitrate(streamId: string, bitrate: number) {
        const arr = this.last.get(streamId) ?? [];
        arr.push(bitrate);

        if (arr.length > 10) arr.shift();
        this.last.set(streamId, arr);
    }

    getAvg(streamId: string): number {
        const arr = this.last.get(streamId);
        if (!arr || !arr.length) return 0;

        bitrate = arr.reduce((a, b) => a + b) / arr.length / 1000
        return bitrate;
    }

    async update(streamId: string) {
        const avg = this.getAvg(streamId);

        const tThresh = this.config.low_bitrate_actions.screen_text;
        const vThresh = this.config.low_bitrate_actions.screen_animated_video;

        await this.obs.setTextAboveVideo();

        if (avg <= tThresh) this.forceShowText();
        else this.delayedHideText();

        if (avg <= vThresh) this.forceShowVideo();
        else this.delayedHideVideo();
    }

    private async forceShowText() {
        // log("SHOW [text]")
        if (this.hideTimerText) clearTimeout(this.hideTimerText);

        if (!this.showLBRT) {
            this.showLBRT = true;
            await this.obs.setEnabled(this.obs.LBRT_itemId, true);
        }
    }

    private delayedHideText() {
        // log("HIDE [text]")
        if (!this.hideTimerText) {
            this.hideTimerText = setTimeout(async () => {
                this.showLBRT = false;
                await this.obs.setEnabled(this.obs.LBRT_itemId, false);
                this.hideTimerText = null;
            }, this.hideDelay);
        }
    }

    private async forceShowVideo() {
        // log("SHOW [video]")
        if (this.hideTimerVideo) clearTimeout(this.hideTimerVideo);

        if (!this.showLBRV) {
            this.showLBRV = true;
            await this.obs.setEnabled(this.obs.LBRV_itemId, true);
        }
    }

    private delayedHideVideo() {
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
