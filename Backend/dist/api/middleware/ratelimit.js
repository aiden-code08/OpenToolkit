"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ratelimit = Ratelimit;
const auth_1 = require("./auth");
const logger_1 = require("../utils/logger");
function Ratelimit(req, res, next) {
    const authHeader = req.headers.authorization;
    (0, logger_1.log)(authHeader);
    const authToken = (0, auth_1.readHeader)(authHeader);
    next();
}
