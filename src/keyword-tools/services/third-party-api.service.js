import axios from "axios";
import config from "../../configs/config.js";
import _ from "lodash";
import moment from "moment";
class ThirdPartyApiService {
  constructor() {
    this.getYoutubeData = this.getYoutubeData.bind(this);
    this.getTiktokData = this.getTiktokData.bind(this);
    this.getDailymotionData = this.getDailymotionData.bind(this);
  }

  async requestGetYoutube(params) {
    const keywordUrl = "https://www.googleapis.com/youtube/v3/search";

    const options = {
      method: "GET",
      url: keywordUrl,
      params: {
        part: "snippet",
        type: "video",
        order: `viewCount`,
        videoDuration: "any",
        regionCode: "VN",
        ...params,
      },
      timeout: 5000,
    };

    const response = await axios.request(options);
    return response.data;
  }

  async requestGetTiktokVideos(params) {
    const tiktokApiKey = config.keywordTool.rapidApiKey;
    const tiktokApiHost = "tiktok-scraper7.p.rapidapi.com";
    const tiktokApiUrl = "https://tiktok-scraper7.p.rapidapi.com/feed/search";

    const options = {
      method: "GET",
      url: tiktokApiUrl,
      params: {
        region: "vn",
        cursor: "0",
        publish_time: "1",
        sort_type: "0",
        ...params,
      },
      headers: {
        "X-RapidAPI-Key": tiktokApiKey,
        tiktokApiHost,
      },
      timeout: 5000,
    };

    const response = await axios.request(options);
    return response.data;
  }

  async requestGetDailymotionVideos(params) {
    const url = "https://api.dailymotion.com/videos";

    const fields =
      "id,likes_total,owner.username,owner.id,owner.nickname,title,views_total,owner.avatar_720_url";

    const options = {
      method: "GET",
      url,
      params: {
        fields,
        page: 1,
        sort: "relevance",
        explicit: true,
        ...params,
      },
      timeout: 5000,
    };

    const response = await axios.request(options);
    return response.data;
  }

  async requestGetDetailVideoYoutube(videoID, apiKey) {
    try {
      const keywordUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails,snippet&id=${videoID}&key=${apiKey}`;

      const options = {
        method: "GET",
        url: keywordUrl,
        timeout: 5000,
      };

      const response = await axios.request(options);

      return response.data;
    } catch (error) {
      console.error("error while calling detail youtube API: ", error?.message);
    }
  }

  async requestGetSuggestedKeywordYoutube(keyword) {
    try {
      const apiKey = config.keywordTool.rapidApiKey;
      const options = {
        method: "GET",
        url: "https://keyword-research-for-youtube.p.rapidapi.com/yttags.php",
        params: {
          keyword,
        },
        headers: {
          "X-RapidAPI-Key": apiKey,
          "X-RapidAPI-Host": "keyword-research-for-youtube.p.rapidapi.com",
        },
      };
      const response = await axios.request(options);
      const keywords = _.flatMap(response.data.related_keywords, "keyword");

      return keywords;
    } catch (error) {
      console.log(
        "error while keyword-tools/third-api, get suggested keyword youtube fail, error: ",
        error?.message
      );
      return [];
    }
  }

  async requestGetSuggestedKeywordTiktok(keyword) {
    try {
      const apiKey = config.keywordTool.rapidApiKey;
      const options = {
        method: "GET",
        url: "https://tiktok-all-in-one.p.rapidapi.com/search/suggest",
        params: { query: keyword },
        headers: {
          "X-RapidAPI-Key": apiKey,
          "X-RapidAPI-Host": "tiktok-all-in-one.p.rapidapi.com",
        },
      };

      const response = await axios.request(options);
      const keywords = _.flatMap(response.data.sug_list, "content");
      return keywords;
    } catch (error) {
      console.log(
        "error while keyword-tools/third-api, get suggested keyword tiktok fail, error: ",
        error?.message
      );
      return [];
    }
  }

  // https://rapidapi.com/ugoBoy/api/social-media-video-downloader
  async requestGetLinkDownloadTiktok(url, fineName) {
    const apiKey = config.keywordTool.rapidApiKey;
    const options = {
      method: "GET",
      url: "https://social-media-video-downloader.p.rapidapi.com/smvd/get/tiktok",
      params: {
        url,
        filename: fineName,
      },
      headers: {
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": "social-media-video-downloader.p.rapidapi.com",
      },
    };

    const response = await axios.request(options);
    return response.data.links[0].link;
  }

  // https://rapidapi.com/ugoBoy/api/social-media-video-downloader
  async requestGetLinkDownloadYoutube(url, fileName) {
    const apiKey = config.keywordTool.rapidApiKey;
    const options = {
      method: "GET",
      url: "https://social-media-video-downloader.p.rapidapi.com/smvd/get/youtube",
      params: {
        url,
        filename: fileName,
      },
      headers: {
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": "social-media-video-downloader.p.rapidapi.com",
      },
    };

    const response = await axios.request(options);
    return response?.data?.links[0]?.link || "";
  }

  // https://rapidapi.com/eaidoo005/api/all-media-downloader2/
  async requestGetLinkDownloadDailymotion(url) {
    try {
      const apiKey = config.keywordTool.rapidApiKey;
      const options = {
        method: "GET",
        url: "https://all-media-downloader2.p.rapidapi.com/amd-rapid",
        params: {
          url,
        },
        headers: {
          "X-RapidAPI-Key": apiKey,
          "X-RapidAPI-Host": "all-media-downloader2.p.rapidapi.com",
        },
      };
      const response = await axios.request(options);
      return response?.data?.qualities[0]?.url || "";
    } catch (error) {}
  }

  // https://rapidapi.com/eaidoo005/api/all-media-downloader2/
  async requestGetLinkDownloadVideoFacebook(url) {
    try {
      const apiKey = config.keywordTool.rapidApiKey;
      const options = {
        method: "GET",
        url: "https://social-media-video-downloader.p.rapidapi.com/smvd/get/facebook",
        params: {
          url,
          filename: "video-facebook",
        },
        headers: {
          "x-rapidapi-key": apiKey,
          "x-rapidapi-host": "social-media-video-downloader.p.rapidapi.com",
        },
      };
      const response = await axios.request(options);
      if (response?.data?.success === false) return "";
      return response?.data?.links[0]?.link || "";
    } catch (error) {
      console.error("error while requestGetLinkDownloadVideoFacebook: ", error);
      return "";
    }
  }

  async getYoutubeData(keyword, limit, apiKey) {
    try {
      // Xác định thời gian bắt đầu và kết thúc của ngày hiện tại
      const startOfDay = moment().utcOffset(420).startOf("day").toISOString();
      const endOfDay = moment().utcOffset(420).endOf("day").toISOString();

      const params = {
        maxResults: limit,
        q: keyword,
        publishedAfter: startOfDay,
        publishedBefore: endOfDay,
        key: apiKey,
      };

      const youtubeData = await this.requestGetYoutube(params);

      const list = [];
      let totalLikes = 0,
        totalComments = 0,
        totalViews = 0;

      // Get detail video
      const addData = youtubeData.items.map(async (video) => {
        // console.log("video: ", video);
        const id = video.id.videoId;
        const title = video.snippet.title;
        const channelID = video.snippet.channelId;
        const thumbnail = video.snippet.thumbnails?.high?.url;
        const channelName = video.snippet?.channelTitle;
        const data = await this.requestGetDetailVideoYoutube(id, apiKey);
        if (!data) throw `${data.error}`;
        const { viewCount, likeCount, commentCount } =
          data?.items[0]?.statistics;

        // Calculate total
        totalLikes += +likeCount || 0;
        totalComments += +commentCount || 0;
        totalViews += +viewCount || 0;

        list.push({
          mediaID: id,
          type: "video",
          platform: "youtube",
          totalViews: +viewCount,
          title,
          thumbnail,
          author: {
            id: channelID,
            name: channelName
          },
        });
      });

      await Promise.all(addData);

      return {
        statistics: {
          totalLikes,
          totalComments,
          totalViews,
          totalVideos: list.length,
        },
        data: list,
      };
    } catch (error) {
      console.error("error while calling youtube API: ", error?.message);
      return {
        statistics: {
          totalLikes: 0,
          totalComments: 0,
          totalViews: 0,
          totalVideos: 0,
        },
        data: [],
      };
    }
  }

  async getTiktokData(keyword, limit) {
    try {
      const options = {
        count: limit,
        keywords: keyword,
      };
      const tiktokData = await this.requestGetTiktokVideos(options);

      let list = [];
      let totalLikes = 0,
        totalComments = 0,
        totalViews = 0;

      const collectData = tiktokData?.data?.videos.map((video) => {
        totalLikes += +video?.digg_count || 0;
        totalComments += +video?.comment_count || 0;
        totalViews += +video?.play_count || 0;
        list.push({
          mediaID: video?.video_id,
          type: "video",
          platform: "tiktok",
          totalViews: +video?.play_count,
          title: video?.title,
          thumbnail: video?.cover,
          author: {
            id: video?.author?.id,
            // username: video?.author?.unique_id,
            // name: video?.author?.nickname,
            // avatar: video?.author?.avatar,
          },
        });
      });

      await Promise.all(collectData);

      return {
        statistics: {
          totalLikes,
          totalComments,
          totalViews,
          totalVideos: list.length,
        },
        data: list,
      };
    } catch (error) {
      console.error("error while calling tiktok API, error: ", error?.message);
      return {
        statistics: {
          totalLikes: 0,
          totalComments: 0,
          totalViews: 0,
          totalVideos: 0,
        },
        data: [],
      };
    }
  }

  async getDailymotionData(keyword, limit) {
    try {
      // get timestamp 1 day ago
      const now = moment();
      const timestamp = now.subtract(1, "days").unix();

      const fields =
        "id,likes_total,owner.username,owner.id,owner.nickname,title,views_total,owner.avatar_720_url,thumbnail_url";

      const params = {
        fields,
        created_after: timestamp,
        search: keyword,
        limit,
      };

      const dailymotionData = await this.requestGetDailymotionVideos(params);

      const list = [];
      let totalLikes = 0,
        totalComments = 0,
        totalViews = 0;

      const collectedData = dailymotionData.list.map((video) => {
        if (this.filterDataByKeyword(video.title, keyword)) {
          totalLikes += +video.likes_total || 0;
          totalViews += +video.views_total || 0;

          list.push({
            author: {
              id: video["owner.id"],
              // username: video["owner.username"],
              // name: video["owner.nickname"],
              // avatar: video["owner.avatar_720_url"],
            },
            mediaID: video?.id || "",
            type: "video",
            platform: "dailymotion",
            totalViews: +video?.views_total || 0,
            title: video?.title || "",
            thumbnail: video?.thumbnail_url || "",
          });
        }
      });
      await Promise.all(collectedData);

      return {
        statistics: {
          totalLikes,
          totalComments,
          totalViews,
          totalVideos: list.length,
        },
        data: list,
      };
    } catch (error) {
      console.error(
        "error while calling dailymotion API, error: ",
        error?.message
      );
      return {
        statistics: {
          totalLikes: 0,
          totalComments: 0,
          totalViews: 0,
          totalVideos: 0,
        },
        data: [],
      };
    }
  }

  filterDataByKeyword(dataTitle, keyword) {
    const keywords = keyword.toLowerCase().split(" ");

    const lowerCaseItem = dataTitle.toLowerCase().split(" ");

    // Kiểm tra xem mỗi từ khóa có tồn tại trong tiêu đề dữ liệu không
    return keywords.every((kw) => {
      return lowerCaseItem.some((item) => item.startsWith(kw));
    });
  }
}

export default ThirdPartyApiService;
