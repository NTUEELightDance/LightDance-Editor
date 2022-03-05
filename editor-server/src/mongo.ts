import mongoose from "mongoose";
import "dotenv-defaults/config";
import { initData } from "./utility";
import model from "./models";
import cron from "node-cron";

export default () => {
  const { MONGO_HOST, MONGO_DBNAME } = process.env;

  mongoose
    .connect(`mongodb://${MONGO_HOST}/${MONGO_DBNAME}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then((res) => {
      console.log("mongo db connection created");
    });
  const db = mongoose.connection;
  db.once("open", async () => {
    // await db.dropDatabase()
    initData();
    cron.schedule("0 0 */1 * *", async () => {
      try {
        let targetTime = new Date();
        targetTime.setDate(targetTime.getDate() - 7);
        await model.Logger.deleteMany({ time: { $lt: targetTime } });
      } catch (e) {
        console.log("Delete failed");
      }
    });
  });
};
