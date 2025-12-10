import Express from "express";
import * as fs from "fs"
import { Config } from "./types.js";
import { OpenToolkit } from "../core/OpenToolkit.js";
import { Authenticate } from "./middleware/auth.js";
import { getRouter } from "./routers/get.js";
import { handleLogin } from "./routers/login.js";
import { setRouter } from "./routers/set.js";
import { Permissions } from "./middleware/permissions.js";
import { log } from "../utils/logger.js";
import { Ratelimit } from "./middleware/ratelimit.js";
import { Database } from "../utils/database";
import { loadConfig } from "./utils/config.js";

export const db = new Database(true);

export class Server {
    private app: Express.Express = Express()
    private router: Express.Router = Express.Router()

    constructor(toolkit: OpenToolkit) {
        this.app.use(Express.json());

        this.router = Express.Router();

        this.app.use("/api/v1", this.router);

        /**
         * --------------------
         * >    Middleware
         * --------------------
         */
        this.router.use(Authenticate);
        this.router.use(Ratelimit);
        // this.router.use(Permissions);
        // this.router.use(Logging)


        this.router.use("/get", getRouter)
        this.router.use("/set", setRouter)
        
        this.router.post("/login", handleLogin)

        const config = loadConfig();

        this.app.listen(config.port, (error) => {
            if (!error) {
                log(`Listening on port: ${config.port}`)
                JSON.parse(fs.readFileSync("config.json", "utf-8")) as Config
            }
        })
    }
}