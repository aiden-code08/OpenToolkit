import * as fs from "fs";
import { APIConfig } from "../../types.js";

export function loadConfig(): APIConfig {
    return JSON.parse(fs.readFileSync("./config.json", "utf-8")).api;
}