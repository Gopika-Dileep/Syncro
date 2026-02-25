import dotenv from 'dotenv';
import { createServer, Server } from "http";
dotenv.config();
import App from "./app";
import { env } from "./config/env";
import { connectDb } from './config/mongoose';

const appinstance = new App();

class serverApp {
    private server: Server;

    constructor() {
        this.server = createServer(appinstance.app);
    }


    public async start(): Promise<void> {
        try {
            await connectDb()
            this.server.listen(env.PORT, () => {
                console.log("server is running");
            })

        } catch (err) {
            console.log(err); 

        }
    }
}

new serverApp().start();