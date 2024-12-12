import KeywordTopic from "../models/keyword-topic.model.js";
import Keyword from "../models/keyword.model.js";
import CollectedKeyword from "../models/collected-keyword.model.js";
import KeywordStatistic from "../models/keyword-statistic.model.js";
import Customer from "../../models/customer.model.js";
import _ from "lodash";
class KeywordTopicService {
  async create(req, res) {
    try {
      const data = req.body;
      const { topicName, isEnabled } = data;
      const newTopicName = topicName.trim();
      const hasTopic = await KeywordTopic.exists({
        topicName: { $regex: new RegExp("^" + newTopicName + "$", "i") },
      });

      if (hasTopic) throw "Chủ đề đã tồn tại";

      const newData = {
        topicName: newTopicName,
        isEnabled,
      };

      const newKeywordTopic = await KeywordTopic.create(newData);

      res.status(200).send({
        success: true,
        message: "Thêm mới thành công",
        data: newKeywordTopic,
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
      const page = parseInt(req.query.page);
      const pageSize = parseInt(req.query.pageSize);

      if (!page || !pageSize) {
        const keywordTopics = await KeywordTopic.find({})
          .select("topicName")
          .sort({ createdAt: -1 })
          .lean();

        return res.status(200).json({
          success: true,
          data: { keywordTopics },
        });
      }

      const skip = (page - 1) * pageSize;
      const { search, isEnabled } = req.query;
      let filter = {};

      if (search) {
        filter = Object.assign(
          {},
          { topicName: { $regex: _.escapeRegExp(search), $options: "i" } }
        );
      }

      if (isEnabled == true || isEnabled == "true") {
        filter = Object.assign(filter, { isEnabled: true });
      } else if (isEnabled == "false" || isEnabled === false) {
        filter = Object.assign(filter, { isEnabled: false });
      }

      const total = await KeywordTopic.countDocuments(filter);
      const totalPages = Math.ceil(total / pageSize);
      const keywordTopics = await KeywordTopic.find(filter)
        .select("-createdAt -updatedAt -__v")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean();

      const pagination = {
        total,
        page,
        pageSize,
        totalPage: totalPages,
      };

      const newKeywordTopics = await Promise.all(
        keywordTopics.map(async (keywordTopic) => {
          const totalKeywords = await Keyword.countDocuments({
            topicCode: keywordTopic._id,
          });

          const totalFollows = await Customer.countDocuments({
            kwTopics: keywordTopic._id,
          });

          return {
            ...keywordTopic,
            totalKeywords,
            totalFollows,
            isEnabled: keywordTopic.isEnabled,
          };
        })
      );

      res.status(200).json({
        success: true,
        data: { pagination, keywordTopics: newKeywordTopics },
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
      const keywordTopic = await KeywordTopic.findOne({ _id: id })
        .select("topicName isEnabled")
        .lean();

      if (!keywordTopic) throw "Dịch vụ không tồn tại";

      const topicStatistic = await KeywordStatistic.findOne({
        entityID: id,
        entityType: "topic",
      })
        .select("platformDetails")
        .lean();

      const statisticDetails = await topicStatistic?.platformDetails.map(
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
        ...keywordTopic,
        statisticDetails,
      };

      res.status(200).send({
        success: true,
        data: { keywordTopic: newResponse },
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
      const { isEnabled } = data;

      const keywordTopic = await KeywordTopic.findById(id);

      if (!keywordTopic) {
        throw "ID không tồn tại";
      }

      await Promise.all([
        keywordTopic.updateOne({ isEnabled }),
        KeywordStatistic.findOneAndUpdate(
          { entityID: id, entityType: "topic" },
          { isEnabled },
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

      const keywordTopic = await KeywordTopic.findById(id);

      if (!keywordTopic) {
        throw "ID không tồn tại";
      }

      await KeywordTopic.findByIdAndDelete(id);

      // Delete keyword
      await Keyword.deleteMany({ topicCode: id });

      await CollectedKeyword.deleteMany({ entity: id });

      // Delete keyword statistics
      await KeywordStatistic.deleteOne({ entityID: id, entityType: "topic" });

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

  // Home page
  async getListByCustomer(req, res) {
    try {
      const page = parseInt(req.query.page);
      const pageSize = parseInt(req.query.pageSize);
      const { search } = req.query;
      let filter = { entityType: "topic", isEnabled: true };

      if (search)
        filter = Object.assign(filter, {
          entitySnapshot: { $regex: _.escapeRegExp(search), $options: "i" },
        });

      if (!page || !pageSize) {
        const keywordTopics = await KeywordStatistic.find(filter)
          .select("entitySnapshot entityID volumePoint -_id")
          .sort({ volumePoint: "desc" })
          .lean();

        return res.status(200).json({
          success: true,
          data: { keywordTopics },
        });
      }

      const skip = (page - 1) * pageSize;
      const total = await KeywordStatistic.countDocuments(filter);
      const totalPages = Math.ceil(total / pageSize);
      const keywordTopics = await KeywordStatistic.find(filter)
        .select("entitySnapshot entityID volumePoint -_id")
        .sort({ volumePoint: "desc" })
        .skip(skip)
        .limit(pageSize)
        .lean();
      
      const pagination = {
        total,
        page,
        pageSize,
        totalPage: totalPages,
      };

      res.status(200).json({
        success: true,
        data: { pagination, keywordTopics },
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

      const keywordTopic = await KeywordStatistic.findOne({
        entityID: id,
        entityType: "topic",
        isEnabled: true,
      })
        .select(
          "entityID entitySnapshot volumePoint platformDetails -_id entityType"
        )
        .lean();

      if (!keywordTopic) throw "Chủ đề không tồn tại";

      const customer = await Customer.findOne({
        _id: user._id,
        kwTopics: id,
      })
        .select("kwTopics")
        .lean();

      if (!customer) {
        followed = false;
      }

      const newPlatform = keywordTopic.platformDetails.map((platform) => {
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
        _id: keywordTopic.entityID,
        entitySnapshot: keywordTopic.entitySnapshot,
        volumePoint: keywordTopic.volumePoint,
        followed,
        statistic: newPlatform,
      };

      res.status(200).send({
        success: true,
        data: { keywordTopic: newResponse },
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
      const { topicID } = req.body;
      const user = req.user;

      const keywordTopic = await KeywordStatistic.findOne({
        entityID: topicID,
        entityType: "topic",
        isEnabled: true,
      }).lean();

      if (!keywordTopic) throw "Chủ đề không tồn tại";

      const customer = await Customer.findById({ _id: user._id });
      if (!customer.kwTopics.includes(keywordTopic.entityID)) {
        await customer.updateOne({
          $push: { kwTopics: keywordTopic.entityID },
        });

        return res.status(200).send({
          success: true,
          message: "Theo dõi chủ đề thành công",
        });
      }
      await customer.updateOne({
        $pull: { kwTopics: keywordTopic.entityID },
      });

      return res.status(200).send({
        success: true,
        message: "Bỏ theo dõi chủ đề thành công",
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

      const customer = await Customer.findOne({ _id: user._id })
        .select("kwTopics")
        .lean();

      const keywordTopics = await KeywordStatistic.find({
        entityID: { $in: customer.kwTopics },
        entityType: "topic",
        isEnabled: true,
      })
        .select("entityID entitySnapshot volumePoint -_id")
        .sort({ volumePoint: -1 })
        .lean();

      const keywordTopicsRes = await Promise.all(
        keywordTopics.map(async (keywordTopic) => {
          const totalKeywords = await Keyword.countDocuments({
            topicCode: keywordTopic.entityID,
            isEnabled: true,
          });
          return {
            ...keywordTopic,
            totalKeywords: totalKeywords,
          };
        })
      );

      res.status(200).json({
        success: true,
        data: { keywordTopics: keywordTopicsRes },
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

export default KeywordTopicService;
