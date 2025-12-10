export type SlidingWindowState = {
    current: number;
    previous: number;
    sliceStart: number;
};

export class RateLimiter {
    private states = new Map<string, SlidingWindowState>();

    constructor(
        private limit: number,
        private sliceSizeMs = 1_000
    ) { }

    private state(k: string) {
        let s = this.states.get(k);
        if (!s) {
            s = { current: 0, previous: 0, sliceStart: Date.now() };
            this.states.set(k, s);
        }
        return s;
    }

    allow(k: string, t = Date.now()) {
        const s = this.state(k);
        this.roll(s, t);
        if (this.count(s, t) >= this.limit) return false;
        s.current++;
        return true;
    }

    add(k: string, n = 1, t = Date.now()) {
        const s = this.state(k);
        this.roll(s, t);
        s.current += n;
    }

    reset(k: string, t = Date.now()) {
        const s = this.state(k);
        s.current = 0;
        s.previous = 0;
        s.sliceStart = t;
    }

    usage(k: string, t = Date.now()) {
        return this.count(this.state(k), t);
    }

    private roll(s: SlidingWindowState, t: number) {
        const e = t - s.sliceStart;
        if (e < this.sliceSizeMs) return;
        const x = Math.floor(e / this.sliceSizeMs);
        s.previous = x === 1 ? s.current : 0;
        s.current = 0;
        s.sliceStart += x * this.sliceSizeMs;
    }

    private count(s: SlidingWindowState, t: number) {
        const e = t - s.sliceStart;
        const p = Math.max(this.sliceSizeMs - e, 0) / this.sliceSizeMs;
        return s.current + s.previous * p;
    }
}
