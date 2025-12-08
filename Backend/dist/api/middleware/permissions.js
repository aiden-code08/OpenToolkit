"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Permissions = Permissions;
const auth_1 = require("./auth");
function Permissions(req, res, next) {
    const authHeader = req.headers.Authorization;
    const authToken = (0, auth_1.readHeader)(authHeader);
    next();
}
