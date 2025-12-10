import { Router } from "express";
import { obs, sessions, startTime } from "../../core/OpenToolkit";

export const getRouter = Router();

getRouter.get("/bitrate/:sessionid", (req, res) => {
    const sessionId = req.params.sessionid;
    const session = sessions.get(sessionId);

    if (!session) return res.status(404).json({
        message: "Session not found"
    });

    res.status(200).json({ bitrate: session.bitrate.getAvg(sessionId) });
})

getRouter.get("/scenes/:sessionid", async (req, res) => {
    const sessionId = req.params.sessionid;

    const session = sessions.get(sessionId);

    if (!session) return res.status(404).json({
        message: "Session not found",
        code: 6
    });

    const scene_list = await obs.obs.call("GetSceneList");

    return res.status(200).json(scene_list);
})

getRouter.get("/stream/alive", async (req, res) => {
    res.status(200).json({ alive: !!startTime });
})

getRouter.get("/stream/timealive", async (req, res) => {
    //@ts-ignore
    res.status(200).json({ time: (Date.now() - startTime) });
})

getRouter.get("/preview/screenshot", async (req, res) => {
    const scene = (await obs.obs.call("GetSceneList")).currentProgramSceneUuid

    const screenshotData = await obs.obs.call("GetSourceScreenshot",
        {
            sourceUuid: scene,
            imageFormat: "png",
            imageWidth: 960,
            imageHeight: 540,
            imageCompressionQuality: 60
        }
    );

    res.status(200).json({ image: screenshotData.imageData });
})


getRouter.get("/sessions", async (req, res) => {
    const sessionIds = [];
    for (const [id, session] of sessions.entries()) {
        sessionIds.push({ sessionId: id, bitrate: session.bitrate.getAvg(id) });
    }
    
    res.status(200).json({ sessions: sessionIds });
})