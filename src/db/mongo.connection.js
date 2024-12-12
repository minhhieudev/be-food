"use strict";

import moment from "moment";
import mongoose from "mongoose";
import config from "../configs/config.js";

class MongoDatabase {
  constructor() {
    this.connect();
  }

  //connect db
  connect() {
    //connect mongodb
    mongoose
      .connect(config.connections.mongoConnectionString, {
        maxPoolSize: 100,
        dbName: config.connections.mongoDBName,
      })
      .then((_) => {
        console.log(
          `[${moment(new Date()).format(
            "HH:mm:ss DD/MM/YYYY"
          )}] Mongodb connected success!`
        );
      })
      .catch((error) => {
        console.error(
          `[${moment(new Date()).format(
            "HH:mm:ss DD/MM/YYYY"
          )}] Mongodb connected fail!`,
          { error }
        );
      });
  }

  static getInstance() {
    if (!MongoDatabase.instance) {
      MongoDatabase.instance = new MongoDatabase();
    }
    return MongoDatabase.instance;
  }
}

const instanceMongodb = MongoDatabase.getInstance();

export default instanceMongodb;
