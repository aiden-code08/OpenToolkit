"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setRouter = void 0;
const express_1 = require("express");
const OpenToolkit_1 = require("../../core/OpenToolkit");
exports.setRouter = (0, express_1.Router)();
exports.setRouter.post("/scene/:sessionid/:scenename", async (req, res) => {
    const { sessionid, scenename } = req.params;
    const session = OpenToolkit_1.sessions.get(sessionid);
    if (!session)
        return res.status(404).json({
            message: "Session not found"
        });
    const exists = await OpenToolkit_1.obs.obs.reidentify({});
    if (!exists) {
        OpenToolkit_1.obs.connect();
        return res.status(500).json({
            code: 6,
            message: "OBS is not connected"
        });
    }
    OpenToolkit_1.obs.obs.call("SetCurrentProgramScene", {
        sceneName: scenename
    });
    return res.status(200).json({ "message": "Scene Changed" });
});
exports.setRouter.post("/stream/:action", async (req, res) => {
    const action = req.params.action;
    const status = await OpenToolkit_1.obs.obs.call("GetStreamStatus");
    switch (action) {
        case "start":
            if (!status.outputActive) {
                OpenToolkit_1.obs.obs.call("StartStream");
                res.status(200).json({
                    message: "Stream Started"
                });
            }
            else {
                res.status(400).json({
                    code: 7,
                    message: "Stream already started"
                });
            }
            break;
        case "stop":
            if (status.outputActive) {
                OpenToolkit_1.obs.obs.call("StopStream");
                res.status(200).json({
                    message: "Stream Stopped"
                });
            }
            else {
                res.status(400).json({
                    code: 8,
                    message: "Stream already stopped"
                });
            }
            break;
        default:
            res.status(400).json({
                code: 9,
                message: "Unknown action"
            });
            break;
    }
    res.status(200);
});
