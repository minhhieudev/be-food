import mongoose from "mongoose";

export const YoutubeApiKeySchema = new mongoose.Schema({
  apiKey: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

const YoutubeApiKeys = mongoose.model("youtube-api-key", YoutubeApiKeySchema);

export default YoutubeApiKeys;


