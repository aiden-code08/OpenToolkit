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
exports.getRouter.get("/scenes/:sessionid", async (req, res) => {
    const sessionId = req.params.sessionid;
    const session = OpenToolkit_1.sessions.get(sessionId);
    if (!session)
        return res.status(404).json({
            message: "Session not found",
            code: 6
        });
    const scene_list = await OpenToolkit_1.obs.obs.call("GetSceneList");
    return res.status(200).json(scene_list);
});
exports.getRouter.get("/stream/alive", async (req, res) => {
    res.status(200).json({ alive: !!OpenToolkit_1.startTime });
});
exports.getRouter.get("/stream/timealive", async (req, res) => {
    //@ts-ignore
    res.status(200).json({ time: (Date.now() - OpenToolkit_1.startTime) });
});
exports.getRouter.get("/preview/screenshot", async (req, res) => {
    const scene = (await OpenToolkit_1.obs.obs.call("GetSceneList")).currentProgramSceneUuid;
    const screenshotData = await OpenToolkit_1.obs.obs.call("GetSourceScreenshot", {
        sourceUuid: scene,
        imageFormat: "png",
        imageWidth: 960,
        imageHeight: 540,
        imageCompressionQuality: 60
    });
    res.status(200).json({ image: screenshotData.imageData });
});
