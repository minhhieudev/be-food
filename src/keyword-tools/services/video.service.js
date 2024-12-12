import axios from "axios";
import ffmpegPath from "ffmpeg-static";
import Ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import he from "he";
import path, { dirname } from "path";
import striptags from "striptags";
import { fileURLToPath } from "url";
import ytdl from "ytdl-core";
import AiService from "../../modules/ai/services/ai.service.js";
import SummaryContentService from "../../modules/gemini/services/summary-content.service.js";

// Set ffmpeg path
Ffmpeg.setFfmpegPath(ffmpegPath);

class VideoService {
  constructor() {
    this.getContentVideo = this.getContentVideo.bind(this);
    this.downloadAudio = this.downloadAudio.bind(this);
    this.getContentYoutubeVideo = this.getContentYoutubeVideo.bind(this);
    this.getSummaryContentVideo = this.getSummaryContentVideo.bind(this);
  }

  validateVideoId(videoId) {
    if (!videoId) {
      throw "Id video không hợp lệ";
    }
  }

  async validateYoutubeVideo(url) {
    const isValid = await ytdl.validateURL(url);
    if (!isValid) {
      throw "Id Youtube video không hợp lệ";
    }
  }

  async downloadAudio(req, res) {
    try {
      const { platform, videoId } = req.query;
      this.validateVideoId(videoId);

      switch (platform) {
        case "youtube": {
          const url = `https://www.youtube.com/watch?v=${videoId}`;
          await this.validateYoutubeVideo(url);
          res.setHeader(
            "Content-Disposition",
            `attachment; filename="youtube_${videoId}.mp3"`
          );
          res.setHeader("Content-Type", "audio/mpeg");
          // Stream the video to ffmpeg for conversion to mp3
          const audioStream = ytdl(url, { quality: "highestaudio" });
          const ffmpegStream = Ffmpeg(audioStream)
            .audioBitrate(128)
            .toFormat("mp3")
            .on("error", (err) => {
              console.error("Error during conversion:", err);
            });

          ffmpegStream.pipe(res);
          break;
        }

        default: {
          throw "Platform chưa hỗ trợ.";
        }
      }
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

  downloadVideoToFlac(url, outputPath) {
    return new Promise((resolve, reject) => {
      const audioStream = ytdl(url, { quality: "highestaudio" });

      Ffmpeg(audioStream)
        .audioBitrate(128)
        .toFormat("flac")
        .save(outputPath)
        .on("end", async () => {
          resolve(true);
        })
        .on("error", (err) => {
          resolve(false);
          console.error("Error during conversion:", err);
        });
    });
  }

  async getContentYoutubeVideo(videoId) {
    let result = "";
    const url = `https://youtube.com/watch?v=${videoId}`;
    const info = await ytdl.getInfo(url);
    const captionTracks =
      info.player_response.captions?.playerCaptionsTracklistRenderer
        .captionTracks || [];
    const captionTrackUrl =
      captionTracks.length > 0
        ? captionTracks.find((track) => track.languageCode === "vi")?.baseUrl ||
          captionTracks[0].baseUrl
        : "";

    if (!captionTracks) {
      // ai
      // Stream the video to ffmpeg for conversion to mp3
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);
      const outputFlacFilePath = path.join(__dirname, `${videoId}.flac`);
      const downloadVideoToFlacResult = await this.downloadVideoToFlac(
        url,
        outputFlacFilePath
      );
      if (downloadVideoToFlacResult) {
        result = await new AiService().recognizeAudio(outputFlacFilePath);
        fs.unlinkSync(outputFlacFilePath); // Clean up the temporary FLAC file
      }
    } else {
      const { data: transcript } = await axios.get(captionTrackUrl);
      const lines = transcript
        .replace('<?xml version="1.0" encoding="utf-8" ?><transcript>', "")
        .replace("</transcript>", "")
        .split("</text>")
        .filter((line) => line && line.trim())
        .map((line) => {
          const startRegex = /start="([\d.]+)"/;
          const durRegex = /dur="([\d.]+)"/;

          const [, start] = startRegex.exec(line);
          const [, dur] = durRegex.exec(line);

          const htmlText = line
            .replace(/<text.+>/, "")
            .replace(/&amp;/gi, "&")
            .replace(/<\/?[^>]+(>|$)/g, "");

          const decodedText = he.decode(htmlText);
          const text = striptags(decodedText);

          return {
            start,
            dur,
            text,
          };
        });
      result = lines.map((line) => line.text.trim()).join(" ");
    }
    return result;
  }

  async getContentVideo(req, res) {
    try {
      const { platform, videoId } = req.query;
      this.validateVideoId(videoId);
      let result = "";

      switch (platform) {
        case "youtube": {
          const url = `https://www.youtube.com/watch?v=${videoId}`;
          await this.validateYoutubeVideo(url);
          result = await this.getContentYoutubeVideo(videoId);
          break;
        }

        default: {
          throw "Platform chưa hỗ trợ.";
        }
      }
      res.status(200).send({
        success: true,
        data: {
          content: result,
        },
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

  async getSummaryContentVideo(req, res) {
    try {
      const { platform, videoId } = req.query;
      this.validateVideoId(videoId);
      let result = "";

      switch (platform) {
        case "youtube": {
          const url = `https://www.youtube.com/watch?v=${videoId}`;
          await this.validateYoutubeVideo(url);
          const summaryContentService = new SummaryContentService();
          result = await summaryContentService.getSummaryYoutube(videoId);
          break;
        }

        default: {
          throw "Platform chưa hỗ trợ.";
        }
      }
      res.status(200).send({
        success: true,
        data: {
          content: result,
        },
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

export default VideoService;
