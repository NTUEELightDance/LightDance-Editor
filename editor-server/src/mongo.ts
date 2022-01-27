import mongoose from "mongoose"
import "dotenv-defaults/config"
import {initData} from "./utility"
import { syncBuiltinESMExports } from "module";

export default () => {
    const { MONGO_HOST, MONGO_DBNAME } = process.env;

    mongoose.connect(`mongodb://${MONGO_HOST}/${MONGO_DBNAME}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).then((res)=>{
        console.log("mongo db connection created")
    })
    const db = mongoose.connection
    db.once("open", async () => {
        // await db.dropDatabase()
        initData()
    })
}