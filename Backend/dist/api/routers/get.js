"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRouter = void 0;
const express_1 = require("express");
const OpenToolkit_1 = require("../../core/OpenToolkit");
exports.getRouter = (0, express_1.Router)();
exports.getRouter.get("/bitrate/:sessionid", (req, res) => {
    const sessionId = req.params.sessionid;
    const session = OpenToolkit_1.sessions.get(sessionId);
    if (!session)
        return res.status(404).json({
            message: "Session not found"
        });
    res.status(200).json({ bitrate: session.bitrate.getAvg(sessionId) });
});
exports.getRouter.get("/scenes/:sessionid", (req, res) => {
    const sessionId = req.params.sessionid;
    const session = OpenToolkit_1.sessions.get(sessionId);
});
