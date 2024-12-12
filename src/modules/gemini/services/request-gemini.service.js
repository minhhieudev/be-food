import { GoogleGenerativeAI } from "@google/generative-ai";
import Setting from "../../../models/setting.model.js";

class RequestGeminiService {
  constructor() {}

  async requestByText(prompt) {
    try {
      // Config and setup safety
      const generationConfig = {
        temperature: 0,
        top_p: 1,
        top_k: 1,
        // max_output_tokens: 400,  //  Độ dài tối đa của văn bản được tạo bằng token
      };

      const safetySettings = [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_NONE",
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_NONE",
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_NONE",
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_NONE",
        },
      ];

      // config model
      const setting = await Setting.findOne({ key: "geminiApiKey" })
        .select("value")
        .lean();

      const apiKey = setting.value || "";
      const genAI = new GoogleGenerativeAI(apiKey);

      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-pro",
        generationConfig,
        safetySettings: safetySettings,
      });

      const result = await model.generateContent(prompt);
   
      return result?.response.text() || "";
    } catch (error) {
      console.error("Error while gemini/requestByText:", error);
      return "";
    }
  }

  async requestByTextAndImage() {}
}

export default RequestGeminiService;
