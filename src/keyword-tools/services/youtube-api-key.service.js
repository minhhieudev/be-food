import YoutubeApiKeys from "../models/youtube-api-key.model.js";
import csv from "csv-parser";
import stream from "stream";

class YoutubeApiKeyService {
  async createApiKeys(req, res) {
    try {
      const results = [];
      const buffer = req.file.buffer;

      const bufferStream = new stream.PassThrough();
      bufferStream.end(buffer);
      await bufferStream.pipe(csv()).on("data", (data) => {
        results.push({
          apiKey: data.api_key,
        });
      });

      await YoutubeApiKeys.insertMany(results);
    
      res.status(200).send({
        success: true,
        data: results,
      });
    } catch (error) {
      console.log("error: ", error);
      return res.status(200).send({
        success: false,
        alert: "error",
        message: `${error}`,
        error,
      });
    }
  }
}

export default YoutubeApiKeyService;
