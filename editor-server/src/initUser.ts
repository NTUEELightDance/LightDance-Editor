import bcrypt from "bcrypt";
import "dotenv-defaults/config";
import mongoose from "mongoose";
import fs from "fs";

import model from "./models";

const filePath = process.argv[2];

let rawdata: any = fs.readFileSync(filePath);
let userData = JSON.parse(rawdata);

async function main() {
  const { MONGO_HOST, MONGO_DBNAME } = process.env;

  mongoose
    .connect(`mongodb://${MONGO_HOST}/${MONGO_DBNAME}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(async (res) => {
      await model.User.deleteMany();
      const saltRounds = 10;
      await Promise.all(
        userData.map(async (data: any) => {
          const { userID, name, password } = data;
          const newPassword = await bcrypt.hash(password, saltRounds);
          const user = new model.User({ userID, password: newPassword, name });
          await user.save();
        })
      );
      mongoose.connection.close();
    });
}

main().catch((error: any) => console.error(error));
