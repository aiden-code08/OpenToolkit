"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (req, res, next) => {
    let token = req.headers.authorization;
    if (!token)
        return res.status(401).json({
            message: "Required header Authorization is required"
        });
    const authKey = readToken(token);
    if (authKey instanceof Error)
        return res.status(400).json({
            message: "Invalid or malformed token"
        });
};
function readToken(input) {
    const token = input.split("Bearer")[1].trim();
    if (!token)
        return Error("Invalid Token, Bad Request.");
    return token;
}
