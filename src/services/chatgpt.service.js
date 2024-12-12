import axios from "axios";
import config from "../configs/config.js";
import Setting from "../models/setting.model.js";

const DEFAULT_MAX_COUNT = 10;
const DEFAULT_MAX_COUNT_COMMENT_GENERATE = 50;
const DEFAULT_MAX_LENGTH_COMMENT = 10;
class ChatGPTService {
  constructor() {
    this.APIKey = config.chatGPT.APIKey;
  }

  async requestChatCompletion(prompt) {
    try {
      const defaultKey = this.APIKey;
      const chatGPTKey = await Setting.findOne({ key: "chatgpt" }).lean();
      const chatGPT_APIKey = chatGPTKey?.value || defaultKey || "";
      const response = await axios.request({
        method: "POST",
        url: "https://api.openai.com/v1/chat/completions",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${chatGPT_APIKey}`,
        },
        data: {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        },
      });

      return response.data;
    } catch (error) {
      if (error.response?.data?.error?.message) {
        throw error.response.data.error.message;
      }
      throw error;
    }
  }

  buildPromptForGetCommentArray(data) {
    let prompt = `tạo một bộ bình luận có ${data.count} phần tử liên quan đến từ khoá "${data.keyword}"`;
    if (data.maxLength) {
      prompt += `, chiều dài mỗi bình luận không được dài quá ${data.maxLength} từ`;
    }
    if (data.style) {
      prompt += `, phong cách ${data.style}`;
    }
    if (data.type) {
      prompt += `, loại bình luận ${data.type}`;
    }
    return prompt;
  }

  handleDataGetCommentArray(content) {
    const arrayComments = content.split("\n");
    const arrayCommentsFormat = arrayComments.map((comment) =>
      comment
        .replace(/^\d+\.\s/, "")
        .replace(/^"/, "")
        .replace(/"$/, "")
    );
    return arrayCommentsFormat;
  }

  async getCommentArrayFromKeyword(data) {
    let result = [];
    const maxCountCommentGenerateSetting = await Setting.findOne({ key: "max_count_comment_generate" }).lean();
    const MAX_COUNT_COMMENT_GENERATE = Number(maxCountCommentGenerateSetting?.value) || DEFAULT_MAX_COUNT_COMMENT_GENERATE
    const maxCount = data.maxCount || DEFAULT_MAX_COUNT;
      
    const buildPrompt = this.buildPromptForGetCommentArray({
      ...data,
      count: maxCount > MAX_COUNT_COMMENT_GENERATE ? MAX_COUNT_COMMENT_GENERATE : maxCount,
      maxLength: data.maxLength || DEFAULT_MAX_LENGTH_COMMENT,
    });
    const responseData = await this.requestChatCompletion(buildPrompt);
    if (responseData && responseData.id) {
      result = this.handleDataGetCommentArray(
        responseData.choices[0].message.content
      );
    }
    return result;
  }
}

const chatGPTServiceInstance = new ChatGPTService();

export default chatGPTServiceInstance;
