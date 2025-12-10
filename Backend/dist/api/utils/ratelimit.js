"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimiter = void 0;
class RateLimiter {
    limit;
    sliceSizeMs;
    states = new Map();
    constructor(limit, sliceSizeMs = 1_000) {
        this.limit = limit;
        this.sliceSizeMs = sliceSizeMs;
    }
    state(k) {
        let s = this.states.get(k);
        if (!s) {
            s = { current: 0, previous: 0, sliceStart: Date.now() };
            this.states.set(k, s);
        }
        return s;
    }
    allow(k, t = Date.now()) {
        const s = this.state(k);
        this.roll(s, t);
        if (this.count(s, t) >= this.limit)
            return false;
        s.current++;
        return true;
    }
    add(k, n = 1, t = Date.now()) {
        const s = this.state(k);
        this.roll(s, t);
        s.current += n;
    }
    reset(k, t = Date.now()) {
        const s = this.state(k);
        s.current = 0;
        s.previous = 0;
        s.sliceStart = t;
    }
    usage(k, t = Date.now()) {
        return this.count(this.state(k), t);
    }
    roll(s, t) {
        const e = t - s.sliceStart;
        if (e < this.sliceSizeMs)
            return;
        const x = Math.floor(e / this.sliceSizeMs);
        s.previous = x === 1 ? s.current : 0;
        s.current = 0;
        s.sliceStart += x * this.sliceSizeMs;
    }
    count(s, t) {
        const e = t - s.sliceStart;
        const p = Math.max(this.sliceSizeMs - e, 0) / this.sliceSizeMs;
        return s.current + s.previous * p;
    }
}
exports.RateLimiter = RateLimiter;
