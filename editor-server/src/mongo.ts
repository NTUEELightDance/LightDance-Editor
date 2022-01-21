import mongoose from "mongoose"
import "dotenv-defaults/config"
import {initData} from "./utility"

export default () => {
    const { MONGO_HOST, MONGO_DBNAME } = process.env;

    mongoose.connect(`mongodb://${MONGO_HOST}/${MONGO_DBNAME}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).then((res)=>{
        console.log("mongo db connection created")
        initData()
    })
    const db = mongoose.connection
}