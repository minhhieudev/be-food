import Redis from "ioredis";
import config from "../configs/config.js";

class RedisService {
  constructor() {
    if (!this.redisClient) this.redisClient = this.connectRedis();
  }

  connectRedis() {
    // const connect = new Redis(config.redis.url);
    // connect.on("connect", () => {
    //   console.error("connected to Redis: ");
    // });

    // connect.on("error", (err) => {
    //   console.error("Error while connecting to Redis: ", err);
    // });
   
    
    // return connect;
  }

  async set(key, value, ttl = 604800) {
    try {
      if (!this.redisClient) return null;
      const result = await this.redisClient.set(
        key,
        JSON.stringify(value),
        "EX",
        ttl
      );
      return result;
    } catch (error) {
      return null;
    }
  }

  async get(key) {
    try {
      if (!this.redisClient) return null;
      const data = await this.redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      return null;
    }
  }

  async delete(key) {
    try {
      if (!this.redisClient) return null;
      const result = await this.redisClient.del(key);
      return result;
    } catch (error) {
      return null;
    }
  }

  async deleteServiceListKeys(keyStart) {
    try {
      if (!this.redisClient) return null;
      const keys = await this.redisClient.keys(`${keyStart}*`);
      if (keys.length > 0) {
        const result = await this.redisClient.del(keys);
        return result;
      }
      return 0;
    } catch (error) {
      console.error("Error deleting keys: ", error);
      return null;
    }
  }
}

const redisServiceIntance = new RedisService();

export default redisServiceIntance;
