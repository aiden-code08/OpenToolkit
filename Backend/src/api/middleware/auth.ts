import { NextFunction, Request, Response } from "express";
import { log } from "../utils/logger";
import { db } from "../server";

export function Authenticate(req: Request, res: Response, next: NextFunction) {
    const skipPaths = [
        "/login"
    ]

    for (let path in skipPaths) {
        if (req.path.startsWith(skipPaths[path])) return next()
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || authHeader === "") return res.status(401).json({ message: "Auth header is required", code: 3 });

    const authToken = readHeader(authHeader);
    if (!authToken) return res.status(401).json({ message: "Malformed auth header", code: 4 });

    const validToken = db.getAccountByToken(authToken);
    if (!validToken) return res.status(401).json({ message: "Invalid Token", code: 5 });

    if (validToken.token !== authToken) return res.status(400).json({ message: "Invalid Token", code: 5 });

    next();
}

export function readHeader(input: string) {
    const format = input.toLowerCase().startsWith("bearer ");
    if (!format) return null;

    const token = input.substring(7).trim();
    if (!token) return null;

    return token;
}