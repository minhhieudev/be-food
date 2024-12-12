import RequestGeminiService from "./request-gemini.service.js";
import ytdl from "ytdl-core";
import VideoService from "../../../keyword-tools/services/video.service.js";
class SummaryContentService {

  async getSummaryYoutube(videoID) {
    try {
      const requestGeminiService = new RequestGeminiService();
      const videoService = new VideoService();
      const [info, caption] = await Promise.all([
        ytdl.getInfo(videoID),
        videoService.getContentYoutubeVideo(videoID)
      ])

      const { shortDescription, title } = info.player_response.videoDetails;
     
      if (!caption) throw "Không thể tóm tắt nội dung";

      const prompt = `
        Viết tóm tắt ngắn nội dung video trên youtube dựa trên phụ đề của video và 1 số thông tin: 
        Tiêu đề:  ${title}.
        Mô tả: ${shortDescription}.
        Phụ đề: ${caption}
        `;

      const data = await requestGeminiService.requestByText(prompt);
      return data;
    } catch (error) {
      console.log("error while summary youtube: ", error);
      return "";
    }
  }
}

export default SummaryContentService;
