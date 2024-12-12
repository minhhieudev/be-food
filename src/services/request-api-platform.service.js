import config from "../configs/config.js";
import axios from "axios";
class RequestApiPlatformService {
  async requestGetFacebookVideoById(url) {
    try {
      // https://rapidapi.com/ugoBoy/api/fb-video-reels
      const apiKey = config.keywordTool.rapidApiKey;
      const options = {
        method: "GET",
        url: "https://fb-video-reels.p.rapidapi.com/smvd/get/all",
        params: {
          url,
          filename: "Test video",
        },
        headers: {
          "X-RapidAPI-Key": apiKey,
          "X-RapidAPI-Host": "fb-video-reels.p.rapidapi.com",
        },
      };
      const response = await axios.request(options);
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  async requestGetProfileFacebook(id) {
    try {
      // https://rapidapi.com/andryerics/api/facebook-profil-scraper
      const encodedParams = new URLSearchParams();
      encodedParams.set("id", id);
      const apiKey = config.keywordTool.rapidApiKey;
      const options = {
        method: "POST",
        url: "https://facebook-profil-scraper.p.rapidapi.com/fb",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          "X-RapidAPI-Key": apiKey,
          "X-RapidAPI-Host": "facebook-profil-scraper.p.rapidapi.com",
        },
        data: encodedParams,
      };

      const response = await axios.request(options);
      return response?.data;
    } catch (error) {
      console.log(error, error?.message);
      return "";
    }
  }
}

export default RequestApiPlatformService;
