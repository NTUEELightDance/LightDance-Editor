import * as redis from "redis";

const { REDIS_HOST, REDIS_PORT } = process.env;

console.log(REDIS_HOST, REDIS_PORT);

const client = redis.createClient({
  url: `redis://${REDIS_HOST}:${REDIS_PORT}`,
});

client.connect().then(() => {
  console.log("redis connected");
});

client.on("error", (err) => {
  console.log(err);
});

export default client;
