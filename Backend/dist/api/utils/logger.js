"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.error = exports.log = void 0;
const log = (...msg) => console.log("[Toolkit API]", ...msg);
exports.log = log;
const error = (...msg) => console.error("[Toolkit API ERROR]", ...msg);
exports.error = error;
