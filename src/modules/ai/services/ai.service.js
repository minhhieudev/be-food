// const speech = require("@google-cloud/speech");
import path, { dirname } from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import speech from "@google-cloud/speech";

class AiService {
  constructor() {}

  recognizeAudio(
    flacFilePath,
    languageCode = "vi-VN",
    encoding = "FLAC",
    sampleRateHertz = 44100
  ) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    const keyFilename = path.join(
      __dirname,
      "../keys/xenon-broker-425403-f1-50d3cccba97f.json"
    );
    const client = new speech.SpeechClient({ keyFilename });

    return new Promise((resolve, reject) => {
      const request = {
        config: {
          encoding,
          sampleRateHertz,
          languageCode,
          audioChannelCount: 2,
        },
        interimResults: false, // If you want interim results, set this to true
      };

      const recognizeStream = client.streamingRecognize(request);

      const stream = fs.createReadStream(flacFilePath).pipe(recognizeStream);

      let result = [];

      stream.on("data", (data) => {
        result.push(data.results[0].alternatives[0].transcript);
      });

      stream.on("end", () => {
        resolve(result.join(" "));
      });

      stream.on("error", (error) => {
        reject(error);
      });
    });
  }
}

export default AiService;
