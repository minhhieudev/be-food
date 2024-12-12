import mongoose from "mongoose";

export const KeywordSchema = new mongoose.Schema(
  {
    keyword: {
      type: String,
    },
    topicCode: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "keyword-topic",
    },
    isEnabled: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Keyword = mongoose.model("keyword", KeywordSchema);

export default Keyword;
