import { Router } from "express";
import ValidateMiddleware from "../../../middleware/validate.middleware.js";
import KeywordService from "../../services/keyword.service.js";
import {
  CreateKeywordValidate,
  UpdateKeywordValidate,
  ValidateMongoID,
} from "../../validates/keyword.validate.js";

const KeywordRoutes = Router();
const keywordService = new KeywordService();

KeywordRoutes.post(
  "/",
  CreateKeywordValidate,
  ValidateMiddleware,
  keywordService.create
);

KeywordRoutes.get("/", keywordService.gets);

KeywordRoutes.get("/topic-code/:topicID", keywordService.getByTopicCode);

KeywordRoutes.get(
  "/:id",
  ValidateMongoID,
  ValidateMiddleware,
  keywordService.getOne
);

KeywordRoutes.put(
  "/:id",
  UpdateKeywordValidate,
  ValidateMiddleware,
  keywordService.update
);

KeywordRoutes.delete(
  "/:id",
  ValidateMongoID,
  ValidateMiddleware,
  keywordService.delete
);

export default KeywordRoutes;
