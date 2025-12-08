"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Authenticate = Authenticate;
exports.readHeader = readHeader;
const database_1 = require("../../utils/database");
const logger_1 = require("../utils/logger");
const db = new database_1.Database();
function Authenticate(req, res, next) {
    const skipPaths = [
        "/login"
    ];
    for (let path in skipPaths) {
        if (req.path.startsWith(skipPaths[path]))
            return next();
    }
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader === "")
        return res.status(401).json({ message: "Auth header is required", code: 3 });
    const authToken = readHeader(authHeader);
    if (!authToken)
        return res.status(401).json({ message: "Malformed auth header", code: 4 });
    const validToken = db.getAccountByToken(authToken);
    (0, logger_1.log)(validToken);
    if (!validToken)
        return res.status(400).json({ message: "Invalid Token", code: 5 });
    next();
}
function readHeader(input) {
    const format = input.toLowerCase().startsWith("bearer ");
    if (!format)
        return null;
    const token = input.substring(7).trim();
    if (!token)
        return null;
    return token;
}
