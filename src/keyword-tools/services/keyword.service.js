import Keyword from "../models/keyword.model.js";
import CollectedKeyword from "../models/collected-keyword.model.js";
import KeywordStatistic from "../models/keyword-statistic.model.js";
import KeywordTopic from "../models/keyword-topic.model.js";
import Customer from "../../models/customer.model.js";
import _ from "lodash";

class KeywordService {
  async create(req, res) {
    try {
      const data = req.body;
      const { keyword, topicCode, isEnabled } = data;
      const newKeywordName = keyword.trim();

      // Validate topic Code
      const hasTopicCode = await KeywordTopic.exists({ _id: topicCode });
      if (!hasTopicCode) throw "Chủ đề không tồn tại";

      // Validate name
      const hasKeyword = await Keyword.exists({
        keyword: { $regex: new RegExp("^" + newKeywordName + "$", "i") },
        topicCode,
      });

      if (hasKeyword) throw "Từ khoá đã tồn tại";

      const newData = {
        keyword: newKeywordName,
        topicCode,
        isEnabled,
      };

      const newKeyword = await Keyword.create(newData);

      res.status(200).send({
        success: true,
        message: "Thêm mới thành công",
        data: newKeyword,
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

  async gets(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 20;
      const skip = (page - 1) * pageSize;
      const { search, isEnabled } = req.query;
      let filter = {};

      if (search) {
        filter = { keyword: { $regex: _.escapeRegExp(search), $options: "i" } };
      }

      if (isEnabled == true || isEnabled == "true") {
        filter = Object.assign(filter, { isEnabled: true });
      } else if (isEnabled == "false" || isEnabled === false) {
        filter = Object.assign(filter, { isEnabled: false });
      }

      const total = await Keyword.countDocuments(filter);
      const totalPages = Math.ceil(total / pageSize);
      const keywords = await Keyword.find(filter)
        .select("keyword topicCode isEnabled createdAt")
        .populate({ path: "topicCode", select: "topicName isEnabled" })
        .lean()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize);

      const pagination = {
        total,
        page,
        pageSize,
        totalPage: totalPages,
      };

      // Calculate total videos, likes, comment at collected keyword schema
      const newData = await Promise.all(
        keywords.map(async (keyword) => {
          const statistic = await CollectedKeyword.find({
            entity: keyword._id,
            entityType: "keyword",
          })
            .select("interactions")
            .lean();

          // Tính tổng số lượt like, view, comment
          let totalLikes = 0;
          let totalComments = 0;
          let totalVideos = 0;
          let totalViews = 0;

          if (statistic.length > 0) {
            statistic.map((item) => {
              item.interactions.map((interaction) => {
                totalLikes += interaction.totalLikes;
                totalComments += interaction.totalComments;
                totalVideos += interaction.totalVideos;
                totalViews += interaction.totalViews;
              });
            });
          }

          return {
            ...keyword,
            totalLikes,
            totalVideos,
            totalComments,
            totalViews,
          };
        })
      );

      res.status(200).json({
        success: true,
        data: { pagination, keywords: newData },
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

  async getOne(req, res) {
    try {
      const { id } = req.params;
      const keyword = await Keyword.findOne({ _id: id })
        .populate({ path: "topicCode", select: "topicName" })
        .select("keyword topicCode isEnabled")
        .lean();

      if (!keyword) throw "Từ khoá không tồn tại";

      const keywordStatistic = await KeywordStatistic.findOne({ entityID: id })
        .select("platformDetails")
        .lean();

      const statisticDetails = await keywordStatistic?.platformDetails.map(
        (platform) => {
          return {
            platform: platform.platform,
            viewGrowthRate: platform.viewGrowthRate,
            likeGrowthRate: platform.likeGrowthRate,
            commentGrowthRate: platform.commentGrowthRate,
            volumePoint: platform.volumePoint,
            suggestedKeywords: platform.suggestedKeywords,
          };
        }
      );

      const newResponse = {
        ...keyword,
        statisticDetails,
      };
      res.status(200).send({
        success: true,
        data: { keyword: newResponse },
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

  async getByTopicCode(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 20;
      const skip = (page - 1) * pageSize;
      const { search, isEnabled } = req.query;
      const { topicID } = req.params;

      let filter = {};

      if (search) {
        filter = { keyword: { $regex: _.escapeRegExp(search), $options: "i" } };
      }

      if (isEnabled == true || isEnabled == "true") {
        filter = Object.assign(filter, { isEnabled: true });
      } else if (isEnabled == "false" || isEnabled === false) {
        filter = Object.assign(filter, { isEnabled: false });
      }

      const topic = await KeywordTopic.exists({ _id: topicID });
      if (!topic) throw "Chủ đề không tồn tại";

      filter = Object.assign(filter, { topicCode: topicID });
      const total = await Keyword.countDocuments(filter);
      const totalPages = Math.ceil(total / pageSize);

      const keywords = await Keyword.find(filter)
        .select("keyword isEnabled createdAt")
        .lean()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize);

      const pagination = {
        total,
        page,
        pageSize,
        totalPage: totalPages,
      };

      res.status(200).json({
        success: true,
        data: { pagination, keywords },
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

  async update(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const { topicCode, isEnabled } = data;
      const hasKeyword = await Keyword.findById(id);

      // Validate topic Code
      if (topicCode) {
        const hasTopicCode = await KeywordTopic.exists(topicCode);
        if (!hasTopicCode) throw "Chủ đề không tồn tại";
      }

      const newData = {
        topicCode,
        isEnabled,
      };

      await Promise.all([
        hasKeyword.updateOne(newData),
        KeywordStatistic.findOneAndUpdate(
          { entityID: id, entityType: "keyword" },
          { isEnabled: isEnabled },
          { runValidators: true }
        ),
      ]);

      res.status(200).send({
        success: true,
        message: "Cập nhật thành công",
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

  async delete(req, res) {
    try {
      const { id } = req.params;

      const keyword = await Keyword.findById(id);

      if (!keyword) {
        throw "ID không tồn tại";
      }

      await Keyword.findByIdAndDelete(id);

      await CollectedKeyword.deleteMany({ entity: id, entityType: "keyword" });

      await KeywordStatistic.deleteOne({
        entityID: id,
        entityType: "keyword",
      });

      res.status(200).send({
        success: true,
        message: "Xoá thành công",
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

  // Search keyword, home page  CUSTOMER
  async searchListByCustomer(req, res) {
    try {
      const { search, topicIDs } = req.query;
      let listTopic = [];
      let filter = {};
      const keywordsResponse = [];

      if (!search) {
        return res.status(200).json({
          success: true,
          data: { keywords: [] },
        });
      }
      if (topicIDs) listTopic = topicIDs.replace(/\s/g, "").split(",");
      if (listTopic.length > 0) {
        filter = Object.assign(filter, { topicCode: { $in: listTopic } });
      }

      filter = Object.assign(filter, {
        keyword: { $regex: _.escapeRegExp(search), $options: "i" },
      });

      // Filter keyword by topicCode
      const keywords = await Keyword.find(filter)
        .select("keyword topicCode")
        .populate({ path: "topicCode", select: "topicName" })
        .lean()
        .sort({ createdAt: -1 });

      // Get volume point
      await Promise.all(
        keywords.map(async (keyword) => {
          const hasExistKeyword = await KeywordStatistic.findOne({
            entityID: keyword._id,
            entityType: "keyword",
            isEnabled: true,
          })
            .select("volumePoint")
            .lean();

          const newKeyword = {
            ...keyword,
            volumePoint: hasExistKeyword?.volumePoint,
          };

          if (hasExistKeyword) keywordsResponse.push(newKeyword);
        })
      );

      // Sắp xếp theo volume point giảm dần
      keywordsResponse.sort(
        (keywordA, keywordB) => keywordB.volumePoint - keywordA.volumePoint
      );

      res.status(200).json({
        success: true,
        data: { keywords: keywordsResponse },
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

  async follow(req, res) {
    try {
      const { keywordID } = req.body;
      const user = req.user;

      const keyword = await KeywordStatistic.findOne({
        entityID: keywordID,
        isEnabled: true,
        entityType: "keyword",
      })
        .select("entityID")
        .lean();

      if (!keyword) throw "Từ khoá không tồn tại";

      const customer = await Customer.findById({ _id: user._id }).select(
        "kwKeywords"
      );

      if (!customer.kwKeywords.includes(keyword.entityID)) {
        await customer.updateOne({
          $push: { kwKeywords: keyword.entityID },
        });

        return res.status(200).send({
          success: true,
          message: "Theo dõi từ khoá thành công",
        });
      }

      await customer.updateOne({
        $pull: { kwKeywords: keyword.entityID },
      });

      return res.status(200).send({
        success: true,
        message: "Bỏ theo dõi từ khoá thành công",
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

  async getFollowedListByCustomer(req, res) {
    try {
      const user = req.user;
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 5;
      const skip = (page - 1) * pageSize;
      const { search } = req.query;

      const customer = await Customer.findOne({ _id: user._id })
        .select("kwKeywords")
        .lean();

      let filter = {
        entityID: { $in: customer.kwKeywords },
        entityType: "keyword",
        isEnabled: true,
      };

      if (search) {
        filter = Object.assign(filter, {
          entitySnapshot: { $regex: _.escapeRegExp(search), $options: "i" },
        });
      }

      const [keywords, total] = await Promise.all([
        KeywordStatistic.find(filter)
          .select("entityID entitySnapshot volumePoint -_id")
          .sort({ volumePoint: "desc" })
          .skip(skip)
          .limit(pageSize)
          .lean(),
        KeywordStatistic.countDocuments(filter),
      ]);

      const keywordsRes = await Promise.all(
        keywords.map(async (keyword) => {
          const keywordDetail = await Keyword.findOne({ _id: keyword.entityID })
            .select("topicCode")
            .populate({ path: "topicCode", select: "topicName" })
            .lean();

          return {
            ...keyword,
            topic: {
              topicCode: keywordDetail?.topicCode?._id,
              topicName: keywordDetail?.topicCode?.topicName,
            },
          };
        })
      );

      const totalPages = Math.ceil(total / pageSize);

      const pagination = {
        total,
        page,
        pageSize,
        totalPage: totalPages,
      };

      res.status(200).json({
        success: true,
        data: { pagination, keywords: keywordsRes },
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

  async getDetailByCustomer(req, res) {
    try {
      const { id } = req.params;
      const user = req.user;
      let followed = true;

      const keyword = await KeywordStatistic.findOne({
        entityID: id,
        entityType: "keyword",
        isEnabled: true,
      })
        .select("entityID entitySnapshot volumePoint platformDetails entityType")
        .lean();

      if (!keyword) throw "Từ khoá không tồn tại";

      const customer = await Customer.findOne({
        _id: user._id,
        kwKeywords: id,
      })
        .select("kwKeywords")
        .lean();

      if (!customer) {
        followed = false;
      }

      const newPlatform = keyword.platformDetails.map((platform) => {
        return {
          platform: platform.platform,
          viewGrowthRate: platform.viewGrowthRate,
          likeGrowthRate: platform.likeGrowthRate,
          commentGrowthRate: platform.commentGrowthRate,
          volumePoint: platform.volumePoint,
          suggestedKeywords: platform.suggestedKeywords,
          mediaList: platform.mediaList,
        };
      });

      await Promise.all(newPlatform);

      const newResponse = {
        _id: keyword.entityID,
        entityType: keyword.entityType,
        entitySnapshot: keyword.entitySnapshot,
        volumePoint: keyword.volumePoint,
        followed,
        statistic: newPlatform,
      };

      res.status(200).send({
        success: true,
        data: { keyword: newResponse },
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

  async getFeaturedKeywordByTopic(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 5;
      const skip = (page - 1) * pageSize;
      const { search, topicID } = req.query;
      let filter = { entityType: "keyword", isEnabled: true };
      const user = await Customer.findOne({ _id: req.user._id })
        .select("kwTopics")
        .lean();

      const topicFilter = topicID
        ? { topicCode: topicID }
        : { topicCode: { $in: user.kwTopics } };
      const keywords = await Keyword.find(topicFilter).select("_id").lean();
      const keywordIDs = _.map(keywords, "_id");

      if (keywordIDs.length > 0) {
        filter = Object.assign(filter, { entityID: { $in: keywordIDs } });
        console.log("filter: ", filter);
      } else {
        return res.status(200).json({
          success: true,
          data: {
            pagination: {
              total: 0,
              page: 1,
              pageSize: 0,
              totalPage: 1,
            },
            keywords: [],
          },
        });
      }

      if (search) {
        filter = Object.assign(filter, {
          entitySnapshot: { $regex: _.escapeRegExp(search), $options: "i" },
        });
      }

      const [keywordStatistic, total] = await Promise.all([
        KeywordStatistic.find(filter)
          .select("entitySnapshot entityID volumePoint -_id")
          .sort({ volumePoint: -1 })
          .skip(skip)
          .limit(pageSize)
          .lean(),
        KeywordStatistic.countDocuments(filter),
      ]);

      const keywordsRes = await Promise.all(
        keywordStatistic.map(async (keyword) => {
          const keywordDetail = await Keyword.findOne({ _id: keyword.entityID })
            .select("topicCode")
            .populate({ path: "topicCode", select: "topicName" })
            .lean();

          return {
            ...keyword,
            topic: {
              topicCode: keywordDetail?.topicCode?._id,
              topicName: keywordDetail?.topicCode?.topicName,
            },
          };
        })
      );

      const totalPages = Math.ceil(total / pageSize);

      const pagination = {
        total,
        page,
        pageSize,
        totalPage: totalPages,
      };

      res.status(200).json({
        success: true,
        data: { pagination, keywords: keywordsRes },
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

  async getKeywordSuggest(req, res) {
    //Hiển thị 3 từ khóa bất kỳ có volumePoint cao nhất không nằm trong danh sách chủ đề hoặc từ khóa đã theo dõi
    try {
      const user = req.user;
      const customer = await Customer.findOne({ _id: user._id })
        .select("kwKeywords kwTopics")
        .lean();

      let notKeywords = [];

      // Get keyword ID by follow
      const keyword = await Keyword.find({
        topicCode: { $in: customer?.kwTopics },
        isEnabled: true,
      })
        .select("_id")
        .lean();

      const keywordIdsFromKw = _.map(keyword, "_id") || [];
      const keywordIdsFromFollowed = customer?.kwKeywords || [];
      notKeywords = [...keywordIdsFromFollowed, ...keywordIdsFromKw];

      const keywordStatistics = await KeywordStatistic.find({
        entityType: "keyword",
        entityID: {
          $nin: notKeywords,
        },
        isEnabled: true,
      })
        .select("entityID entitySnapshot volumePoint -_id")
        .sort({ volumePoint: "desc" })
        .limit(3)
        .lean();

      const newKeywordRes = await Promise.all(
        keywordStatistics.map(async (keywordStatistic) => {
          const keywordDetails = await Keyword.findOne({
            _id: keywordStatistic.entityID,
          })
            .select("topicCode")
            .populate({
              path: "topicCode",
              select: "topicName",
            })
            .lean();
          return {
            entityID: keywordStatistic.entityID,
            entitySnapshot: keywordStatistic.entitySnapshot,
            volumePoint: keywordStatistic.volumePoint,
            topic: {
              topicCode: keywordDetails?.topicCode?._id,
              topicName: keywordDetails?.topicCode?.topicName,
            },
          };
        })
      );

      res.status(200).json({
        success: true,
        data: { keywords: newKeywordRes },
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

  async getFeaturedContent(req, res) {
    try {
      const contents = [
        {
          platform: "youtube",
          mediaList: ["xypzmu5mMPY", "6X5rXjNJ3nE", "RLqY6T4SyOM"],
        },
        {
          platform: "tiktok",
          mediaList: [
            "7366054542808599809",
            "7365796474757631248",
            "7365815597285920018",
            "7365806296714464530",
          ],
        },
        {
          platform: "dailymotion",
          mediaList: ["x8y29p8", "x8y3cio"],
        },
      ];

      const creators = [
        {
          platform: "youtube",
          authorID: "FinoKim0801",
        },
        {
          platform: "tiktok",
          authorID: "tramcamxuc_6991",
        },
        {
          platform: "dailymotion",
          authorID: "Phimbotrungquoc",
        },
      ];
      res.status(200).json({ success: true, data: { contents, creators } });
    } catch (error) {
      res.status(200).json({ message: "That bai" });
    }
  }
}

export default KeywordService;
