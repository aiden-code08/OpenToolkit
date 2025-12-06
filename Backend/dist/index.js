"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_js_1 = require("./api/server.js");
const OpenToolkit_js_1 = require("./core/OpenToolkit.js");
async function main() {
    const toolkit = new OpenToolkit_js_1.OpenToolkit();
    await toolkit.initialize();
    new server_js_1.Server(toolkit);
}
main();
