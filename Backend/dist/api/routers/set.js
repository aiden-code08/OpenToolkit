"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setRouter = void 0;
const express_1 = require("express");
exports.setRouter = (0, express_1.Router)();
exports.setRouter.post("/scene/:sessionid/:scenename", (req, res) => {
    const { sessionid, scenename } = req.params;
});
