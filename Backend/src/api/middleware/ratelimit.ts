import { NextFunction, Request, Response } from "express";
import { readHeader } from "./auth";
import { log } from "../utils/logger";
import { RateLimiter } from "../utils/ratelimit";
import { loadConfig } from "../utils/config";

const rateLimiter = new RateLimiter(loadConfig().ratelimit.requests, 60_000)

export function Ratelimit(req: Request, res: Response, next: NextFunction) {
    console.log(req.path)

    if (req.path.includes("login")) return next();
    const authHeader = req.headers.authorization as string;
    log(rateLimiter.usage(authHeader));
    const authToken = readHeader(authHeader);

    if (!rateLimiter.allow(authHeader)) return res.status(429).json({ message: "Rate Limited" });

    rateLimiter.add(authToken)

    next()
}