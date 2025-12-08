"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleLogin = handleLogin;
exports.generateToken = generateToken;
exports.decodeVerifyToken = decodeVerifyToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const server_1 = require("../server");
dotenv_1.default.config();
function handleLogin(req, res) {
    const login = req.body;
    if (!login.username)
        return res.status(401).json({ message: "Missing username from body", code: 1 });
    if (!login.password)
        return res.status(401).json({ message: "Missing password from body", code: 2 });
    const account = server_1.db.getAccount(login.username);
    if (!account)
        return res.status(401).json({ message: "username or password invalid", code: 10 });
    if (account.password !== login.password)
        return res.status(401).json({ message: "username or password invalid", code: 10 });
    const valid_token = generateToken(account.id);
    if (account.token !== valid_token)
        server_1.db.setAccountToken(login.username, valid_token);
    res.status(200).json({ token: valid_token });
}
function generateToken(userId) {
    const secret = process.env.SECRET;
    const payload = { userId };
    const token = jsonwebtoken_1.default.sign(payload, secret, { expiresIn: "24h" });
    return token;
}
function decodeVerifyToken(token) {
    const secret = process.env.SECRET;
    try {
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        return decoded;
    }
    catch {
        return null;
    }
}
