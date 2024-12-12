import mongoose from "mongoose";
import { mediaType, platform } from "../common/keyword.enum.js";

export const CollectedKeywordSchema = new mongoose.Schema({
  date: {
    type: Date,
  },
  entity: {
    type: String,
  },
  entityType: {
    type: String,
  },
  interactions: {
    type: [
      {
        platform: {
          type: String,
          enum: platform,
          required: true,
        },
        totalViews: {
          type: Number,
        },
        totalLikes: {
          type: Number,
        },
        totalComments: {
          type: Number,
        },
        totalVideos: {
          type: Number,
        },
        suggestedKeywords: {
          type: [String],
        },
      },
    ],
    _id: false,
    required: true,
  },
  mediaList: {
    type: [
      {
        mediaID: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          required: true,
          enum: mediaType,
        },
        platform: {
          type: String,
          required: true,
          enum: platform,
        },
        totalViews: {
          type: Number,
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
      },
    ],
    _id: false,
  },
});

const CollectedKeyword = mongoose.model(
  "collected-keyword",
  CollectedKeywordSchema
);

export default CollectedKeyword;
