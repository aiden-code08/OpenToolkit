"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRouter = void 0;
const express_1 = require("express");
const BitrateManager_1 = require("../../core/BitrateManager");
exports.getRouter = (0, express_1.Router)();
exports.getRouter.get("/bitrate/:sessionid", (req, res) => {
    // const token = req.params.sessionid
    // handle permissions later on
    res.status(200).json({ bitrate: BitrateManager_1.bitrate });
});
