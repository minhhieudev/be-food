import he from "he";
import RequestApiPlatformService from "./request-api-platform.service.js";
import fetch from "node-fetch";
import jsdom from "jsdom";
const { JSDOM } = jsdom;
class ChannelService {
  constructor() {
    this.getVideoInfo = this.getVideoInfo.bind(this);
    this.getTitle = this.getTitle.bind(this);
  }

  async getVideoInfo(req, res) {
    try {
      const { link } = req.body;
      const name = await this.getTitle(link);

      res.status(200).json({
        success: true,
        data: { name },
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

  async getTitle(thumbnailUrl) {
    const channelService = new ChannelService();
    const requestApiPlatformService = new RequestApiPlatformService();
    const regex =
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

    const youtubeChannelRegex =
      /^(https?:\/\/)?(www\.)?(youtube\.com\/(c\/|channel\/|user\/)?|youtu\.be\/)/i;

    const tiktokVideoRegex =
      /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@[^\/]+\/video\/(\d+)/;

    const profileFacebookRegex =
      /(?:https?:\/\/)?(?:www\.)?(?:facebook\.com|fb\.com)\/(?:profile\.php\?id=)?([^\/?]+)/i;

    const facebookVideoRegex =
    /(?:https?:\/\/)?(?:www\.)?(?:facebook\.com|fb\.com|fb\.watch)\/(?:.*\/)?(video(?:s)?\.php\?v=\d+|[\w\-\.]+\/videos\/(?:\d+|vb\.\d+\/\d+)|[\w\-\.]+\/posts\/\d+|groups\/[^\/]+\/permalink\/\d+|watch\/?\??v=\d+)(?:\/|\?|$)/;

    const matchYoutubeVideo = await thumbnailUrl.match(regex);
    const matchChannel = thumbnailUrl.match(youtubeChannelRegex);
    const matchTiktokVideo = thumbnailUrl.match(tiktokVideoRegex);
    const matchFacebookVideo = facebookVideoRegex.test(thumbnailUrl)
    const matchProfileFacebook = thumbnailUrl.match(profileFacebookRegex);
    let name = "";
  
    switch (true) {
      case !!matchYoutubeVideo:
      case !!matchChannel: {
        const newTitle = await channelService.fetchAndExtractTitleElement(
          thumbnailUrl,
          "title"
        );
        if (newTitle.endsWith("- YouTube")) {
          name = newTitle.slice(0, -"- YouTube".length).trim();
          break;
        } else name = newTitle;
        break;
      }

      case !!matchTiktokVideo: {
        const newTitle = await channelService.fetchAndExtractTitleElement(
          thumbnailUrl,
          "#__UNIVERSAL_DATA_FOR_REHYDRATION__"
        );

        const newRes = JSON.parse(newTitle);
        name =
          newRes.__DEFAULT_SCOPE__[
            "webapp.video-detail"
          ].itemInfo.itemStruct.desc.trim();
        break;
      }

      case matchFacebookVideo: {
        const detailVideo =
          await requestApiPlatformService.requestGetFacebookVideoById(
            thumbnailUrl
          );
        name = he.decode(detailVideo?.title) || "";
        break;
      }

      case !!matchProfileFacebook: {
        const id = matchProfileFacebook[1];
        const detailFacebook =
          await requestApiPlatformService.requestGetProfileFacebook(id);
        if (detailFacebook?.name) {
          name = he.decode(detailFacebook?.name) || "";
          break;
        }
        name = "";
        break;
      }

      default:
        name = "";
    }

    return name;
  }

  async fetchAndExtractTitleElement(thumbnailUrl, select) {
    const response = await fetch(thumbnailUrl);
    if (!response.ok) return null;

    const html = await response.text();
    const dom = new JSDOM(html);
    const titleElement = dom.window.document.querySelector(select).textContent;
    return titleElement;
  }
}

export default ChannelService;
