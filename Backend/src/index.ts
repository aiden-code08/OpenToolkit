import { Server } from "./api/server.js";
import { OpenToolkit } from "./core/OpenToolkit.js";

async function main() { 
    const toolkit = new OpenToolkit();
    await toolkit.initialize();
    toolkit.startRTMP()

    new Server(toolkit);
}

main();