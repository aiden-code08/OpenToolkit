"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ratelimit = Ratelimit;
const auth_1 = require("./auth");
const logger_1 = require("../utils/logger");
const ratelimit_1 = require("../utils/ratelimit");
const config_1 = require("../utils/config");
const rateLimiter = new ratelimit_1.RateLimiter((0, config_1.loadConfig)().ratelimit.requests, 60_000);
function Ratelimit(req, res, next) {
    console.log(req.path);
    if (req.path.includes("login"))
        return next();
    const authHeader = req.headers.authorization;
    (0, logger_1.log)(rateLimiter.usage(authHeader));
    const authToken = (0, auth_1.readHeader)(authHeader);
    if (!rateLimiter.allow(authHeader))
        return res.status(429).json({ message: "Rate Limited" });
    rateLimiter.add(authToken);
    next();
}
