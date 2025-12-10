import { NextFunction, Request, Response } from "express";
import { readHeader } from "./auth";
import { log } from "../utils/logger";


export function Permissions(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    log(authHeader);
    const authToken = readHeader(authHeader);

    

    next()
}