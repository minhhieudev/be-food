import ThirdPartyApiService from "./third-party-api.service.js";

class CustomerService {
  async getDownloadLink(req, res) {
    try {
      const thirdPartyApiService = new ThirdPartyApiService();

      const { url } = req.body;
      const youtubeRegex =
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

      const tiktokRegex =
        /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@[^\/]+\/video\/(\d+)/;

      const dailymotionRegex =
        /https:\/\/www\.dailymotion\.com\/video\/([a-zA-Z0-9]+)/;

      const facebookVideoRegex =
        /(?:https?:\/\/)?(?:www\.)?(?:facebook\.com|fb\.com|fb\.watch)\/(?:.*\/)?(video(?:s)?\.php\?v=\d+|[\w\-\.]+\/videos\/(?:\d+|vb\.\d+\/\d+)|[\w\-\.]+\/posts\/\d+|groups\/[^\/]+\/permalink\/\d+|watch\/?\??v=\d+)(?:\/|\?|$)/;

      const matchYoutube = youtubeRegex.test(url);
      const matchTiktok = tiktokRegex.test(url);
      const matchDailymotion = dailymotionRegex.test(url);
      const matchFacebookVideo = facebookVideoRegex.test(url);

      let downloadLink = "";
      
      switch (true) {
        case matchYoutube: {
          downloadLink =
            await thirdPartyApiService.requestGetLinkDownloadYoutube(
              url,
              "youtube-video"
            );
          break;
        }
        case matchTiktok: {
          downloadLink =
            await thirdPartyApiService.requestGetLinkDownloadTiktok(
              url,
              "tiktok-video"
            );
          break;
        }
        case matchDailymotion: {
          downloadLink =
            await thirdPartyApiService.requestGetLinkDownloadDailymotion(url);
          break;
        }
        case matchFacebookVideo: {
          downloadLink =
            await thirdPartyApiService.requestGetLinkDownloadVideoFacebook(url);
          break;
        }
        default:
          downloadLink = "";
      }
      return res.status(200).json({ success: true, data: { downloadLink } });
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
const customerService = new CustomerService();

export default customerService;
