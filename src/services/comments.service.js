import chatGPTServiceInstance from "./chatgpt.service.js";

class CommentsService {
  async generate(req, res) {
    try {
      const { keyword, maxCount, style, type } = req.body;

      const comments = await chatGPTServiceInstance.getCommentArrayFromKeyword({
        keyword,
        maxCount,
        style,
        type,
      });

      res.status(200).send({
        success: true,
        data: { comments },
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
export default CommentsService;
