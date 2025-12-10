import * as fs from "fs";
import { Config, OBSConfig } from "../types.js";

export function loadConfig(): Config {
    return JSON.parse(fs.readFileSync("./config.json", "utf-8")).toolkit;
}

export function loadOBSConfig(): OBSConfig {
    return JSON.parse(fs.readFileSync("./config.json", "utf-8")).obs;
}