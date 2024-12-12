import Keyword from "../models/keyword.model.js";
import ThirdPartyApiService from "./third-party-api.service.js";
import CollectedKeyword from "../models/collected-keyword.model.js";
import KeywordTopic from "../models/keyword-topic.model.js";
import config from "../../configs/config.js";
import moment from "moment";
import  YoutubeApiKeySchema  from "../models/youtube-api-key.model.js";
import _ from "lodash";
class CollectedKeywordService {
  // Collected data and save to DB
  async collectedKeyword() {
    try {
      const date = moment().utcOffset(420);
      
      // find keyword and keywordTopics
      const [keywords, keywordTopics] = await Promise.all([
        Keyword.aggregate([
          { $match: { isEnabled: true } },
          { $project: { name: "$keyword" } },
        ]),
        KeywordTopic.aggregate([
          { $match: { isEnabled: true } },
          { $project: { name: "$topicName" } },
        ]),
      ]);

      // Get data, limit: 10 for every platform
      const collectedKeywordService = new CollectedKeywordService();
      const [newKeywordStatistics, newKeywordTopicStatistics] =
        await Promise.all([
          collectedKeywordService.getData(keywords, "keyword", date) || [],
          collectedKeywordService.getData(keywordTopics, "topic", date) || [],
        ]);

      // insert new collected keyword
      if (newKeywordStatistics.length > 0) {
        const newData = [...newKeywordStatistics, ...newKeywordTopicStatistics];
        await CollectedKeyword.insertMany(newData);
      }

      console.log("collected data youtube, tiktok, dailymotion");
    } catch (error) {
      console.log("error while keyword-tools/collectAndSaveData: ", error);
    }
  }

  async getData(list, entityType, date) {
    const thirdPartyApiService = new ThirdPartyApiService();
    const youtubeApiKeys = await YoutubeApiKeySchema.find({isActive: true}).lean();
    const apiKeys = _.map(youtubeApiKeys, "apiKey");
    
    const calculate = list.map(async (item) => {
      const limit = config.keywordTool.limitData || 10;
      const indexKey = Math.floor(Math.random() * apiKeys.length);
      const youtubeApiKey = apiKeys[indexKey] || "";

      const [
        youtubeData,
        tiktokData,
        dailymotionData,
        suggestedYoutubeKeyword,
        suggestedTiktokKeyword,
      ] = await Promise.all([
        thirdPartyApiService.getYoutubeData(item.name, limit, youtubeApiKey),
        thirdPartyApiService.getTiktokData(item.name, limit),
        thirdPartyApiService.getDailymotionData(item.name, limit),
        thirdPartyApiService.requestGetSuggestedKeywordYoutube(item.name),
        thirdPartyApiService.requestGetSuggestedKeywordTiktok(item.name),
      ]);

      return {
        date,
        entity: item._id,
        entityType,
        interactions: [
          {
            platform: "youtube",
            totalViews: youtubeData?.statistics?.totalViews || 0,
            totalLikes: youtubeData?.statistics?.totalLikes || 0,
            totalComments: youtubeData?.statistics?.totalComments || 0,
            totalVideos: youtubeData?.statistics?.totalVideos || 0,
            suggestedKeywords: suggestedYoutubeKeyword,
          },
          {
            platform: "tiktok",
            totalViews: tiktokData?.statistics?.totalViews || 0,
            totalLikes: tiktokData?.statistics?.totalLikes || 0,
            totalComments: tiktokData?.statistics?.totalComments || 0,
            totalVideos: tiktokData?.statistics?.totalVideos || 0,
            suggestedKeywords: suggestedTiktokKeyword || 0,
          },
          {
            platform: "dailymotion",
            totalViews: dailymotionData?.statistics?.totalViews || 0,
            totalLikes: dailymotionData?.statistics?.totalLikes || 0,
            totalComments: dailymotionData?.statistics?.totalComments || 0,
            totalVideos: dailymotionData?.statistics?.totalVideos || 0,
            suggestedKeywords: [],
          },
        ],
        mediaList: [
          ...(youtubeData?.data || []),
          ...(tiktokData?.data || []),
          ...(dailymotionData?.data || []),
        ],
      };
    });

    const newResponse = await Promise.all(calculate);
    return newResponse;
  }

  // Test
  async getAll(req, res) {
    try {
      const keywordStatistic = await CollectedKeyword.find({})
        .sort({ createdAt: -1 })
        .lean();
      res.status(200).json({ data: keywordStatistic });
    } catch (error) {
      res.status(200).json({ message: "That bai" });
    }
  }
}

export default CollectedKeywordService;
