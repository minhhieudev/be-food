import { Router } from "express";
import ValidateMiddleware from "../../middleware/validate.middleware.js";
import CommentsService from "../../services/comments.service.js";
import { GenerateCommentValidate } from "../../validates/comments.validate.js";

const CommentsRoutes = Router();

// recharge
CommentsRoutes.post(
  "/generate",
  GenerateCommentValidate,
  ValidateMiddleware,
  new CommentsService().generate
);

export default CommentsRoutes;
