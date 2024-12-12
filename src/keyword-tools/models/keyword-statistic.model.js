import mongoose from "mongoose";
import { mediaType } from "../common/keyword.enum.js";

const KeywordStatisticSchema = new mongoose.Schema({
  entityID: {
    type: String,
  },
  entitySnapshot: {
    type: String,
  },
  entityType: {
    type: String,
  },
  volumePoint: {
    type: Number,
  },
  isEnabled: {
    type: Boolean,
    default: true,
  },
  platformDetails: {
    type: [
      {
        platform: {
          type: String,
        },
        viewGrowthRate: {
          yesterday: Number,
          lastWeek: Number,
          lastMonth: Number,
        },
        likeGrowthRate: {
          yesterday: Number,
          lastWeek: Number,
          lastMonth: Number,
        },
        commentGrowthRate: {
          yesterday: Number,
          lastWeek: Number,
          lastMonth: Number,
        },
        volumePoint: {
          type: Number,
        },
        suggestedKeywords: [String],
        mediaList: [
          {
            mediaID: {
              type: String,
            },
            type: {
              type: String,
              enum: mediaType,
            },
            title: {
              type: String,
            },
            thumbnail: {
              type: String,
            },
            author: {
              type: {
                id: String,
              },
              _id: false,
            },
            _id: false,
          },
        ],
        dailyStatisticsLogs: {
          type: [
            {
              date: Number,
              month: Number,
              year: Number,
              volumeLog: Number,
              totalViews: Number,
              totalLikes: Number,
              totalComments: Number,
              totalVideos: Number,
            },
          ],
          _id: false,
        },
        weeklyStatisticsLogs: {
          type: [
            {
              date: Number,
              month: Number,
              year: Number,
              volumeLog: Number,
              totalViews: Number,
              totalLikes: Number,
              totalComments: Number,
              totalVideos: Number,
            },
          ],
          _id: false,
        },
        monthlyStatisticsLogs: {
          type: [
            {
              date: Number,
              month: Number,
              year: Number,
              volumeLog: Number,
              totalViews: Number,
              totalLikes: Number,
              totalComments: Number,
              totalVideos: Number,
            },
          ],
          _id: false,
        },
      },
    ],
    _id: false,
  },
});

const KeywordStatistic = mongoose.model(
  "keyword-statistic",
  KeywordStatisticSchema
);

export default KeywordStatistic;
