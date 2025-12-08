"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
const express_1 = __importDefault(require("express"));
const fs = __importStar(require("fs"));
const auth_js_1 = require("./middleware/auth.js");
const get_js_1 = require("./routers/get.js");
const login_js_1 = require("./routers/login.js");
const set_js_1 = require("./routers/set.js");
class Server {
    app = (0, express_1.default)();
    router = express_1.default.Router();
    constructor(toolkit) {
        this.app.use(express_1.default.json());
        this.router = express_1.default.Router();
        this.app.use("/api/v1", this.router);
        this.router.use(auth_js_1.Authenticate);
        this.router.use("/get", get_js_1.getRouter);
        this.router.use("/set", set_js_1.setRouter);
        this.router.post("/login", login_js_1.handleLogin);
        this.app.listen(3000, (error) => {
            if (!error) {
                console.log("Listening on port config");
                JSON.parse(fs.readFileSync("config.json", "utf-8"));
            }
        });
    }
}
exports.Server = Server;
