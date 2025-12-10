import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Login } from "../types";
import { Request, Response } from "express";
import { db } from "../server";
import { RateLimiter } from "../utils/ratelimit";

const loginRatelimit = new RateLimiter(5, 60000)

dotenv.config()

export function handleLogin(req: Request, res: Response) {
    loginRatelimit.add(req.ip)
    
    if (!loginRatelimit.allow(req.ip)) return res.status(429).json({ message: "Rate Limited" });

    const login = req.body as Login;

    if (!login.username) return res.status(401).json({ message: "Missing username from body", code: 1 });
    if (!login.password) return res.status(401).json({ message: "Missing password from body", code: 2 });

    const account = db.getAccount(login.username);

    if (!account) return res.status(401).json({ message: "username or password invalid", code: 10 });

    if (account.password !== login.password) return res.status(401).json({ message: "username or password invalid", code: 10 });

    const valid_token = generateToken(account.id);

    if (account.token !== valid_token) db.setAccountToken(login.username, valid_token);

    res.status(200).json({ token: valid_token });
}

export function generateToken(userId: string) {
    const secret = process.env.SECRET;

    const payload = { userId };

    const token = jwt.sign(payload, secret, { expiresIn: "24h" });

    return token;
}

export function decodeVerifyToken(token: string) {
    const secret = process.env.SECRET;

    try {
        const decoded = jwt.verify(token, secret);
        return decoded;
    } catch {
        return null;
    }
}