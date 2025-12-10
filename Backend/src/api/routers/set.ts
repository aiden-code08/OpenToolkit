import { Router } from "express";
import { obs, sessions } from "../../core/OpenToolkit";

export const setRouter = Router();

setRouter.post("/scene/:sessionid/:scenename", async (req, res) => {
    const { sessionid, scenename } = req.params;

    const session = sessions.get(sessionid);

    if (!session) return res.status(404).json({
        message: "Session not found"
    });

    const exists = await obs.obs.reidentify({});

    if (!exists) {
        obs.connect();
        return res.status(500).json({
            code: 6,
            message: "OBS is not connected"
        })
    }

    obs.obs.call("SetCurrentProgramScene", {
        sceneName: scenename
    });

    return res.status(200).json({ "message": "Scene Changed" });
})

setRouter.post("/stream/:action", async (req, res) => {
    const action = req.params.action;

    const status = await obs.obs.call("GetStreamStatus");

    switch (action) {
        case "start":
            if (!status.outputActive) {
                obs.obs.call("StartStream")
                res.status(200).json({
                    message: "Stream Started"
                })
            } else {
                res.status(400).json({
                    code: 7,
                    message: "Stream already started"
                })
            }
            break;
        case "stop":
            if (status.outputActive) {
                obs.obs.call("StopStream")
                res.status(200).json({
                    message: "Stream Stopped"
                })
            } else {
                res.status(400).json({
                    code: 8,
                    message: "Stream already stopped"
                })
            }
            break;
        default:
            res.status(400).json({
                code: 9,
                message: "Unknown action"
            })
            break;
    }

    res.status(200)
})