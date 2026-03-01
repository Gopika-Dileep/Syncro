import Redis from "ioredis";
import { env } from "./env";

const redis = new Redis({
    host:env.REDIS_HOST ,
    port:Number(env.REDIS_PORT)
})


redis.on("connect",()=>console.log("redis connected"))
redis.on("error",(err)=>console.log("redis error:",err))

export async function connectRedis(): Promise<void> {
    try {
        await redis.ping()   
        console.log("Redis connected successfully")
    } catch (err) {
        console.log(`Error connecting Redis: ${err}`)
    }
}


export default redis