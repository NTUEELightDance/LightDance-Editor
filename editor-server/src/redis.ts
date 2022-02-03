import * as redis from "redis"
import model from "./models";

const redisPort: any = 6379;
const client = redis.createClient(redisPort);

interface LooseObject {
  [key: string]: any;
}

client.connect().then(() => {console.log("redis connected")})

client.on("error", (err)=> {console.log(err)});

export default client
