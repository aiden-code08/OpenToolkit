"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleLogin = void 0;
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const handleLogin = (req, res) => {
    const login = req.body;
    if (!login.username)
        return res.status(401).json({ message: "Missing username from body", code: 1 });
    if (!login.password)
        return res.status(401).json({ message: "Missing password from body", code: 2 });
    res.status(200).json(encodeUserToToken(login));
};
exports.handleLogin = handleLogin;
function encodeUserToToken(login) {
    const encodedPassword = crypto_1.default.createHash("sha256").update(login.password).digest("hex");
    const token = jsonwebtoken_1.default.sign({ token: encodedPassword }, process.env.SECRET);
    return token;
}
