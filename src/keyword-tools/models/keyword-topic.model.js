import mongoose from "mongoose";

export const KeywordTopicSchema = new mongoose.Schema(
  {
    topicName: {
      type: String,
    },
    isEnabled: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const KeywordTopic = mongoose.model("keyword-topic", KeywordTopicSchema);

export default KeywordTopic;
