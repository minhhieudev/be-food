import { Router } from "express";
import ValidateMiddleware from "../../../middleware/validate.middleware.js";
import AdminAuthMiddleware from "../../../routes/middlewares/admin-auth.middleware.js";
import KeywordTopicService from "../../services/keyword-topic.service.js";
import {
  CreateKeywordTopicValidate,
  UpdateKeywordTopicValidate,
  ValidateMongoID,
} from "../../validates/keyword-topic.validate.js";

const KeywordTopicRoutes = Router();

KeywordTopicRoutes.post(
  "/",
  AdminAuthMiddleware,
  CreateKeywordTopicValidate,
  ValidateMiddleware,
  new KeywordTopicService().create
);

KeywordTopicRoutes.get(
  "/",
  AdminAuthMiddleware,
  new KeywordTopicService().gets
);

KeywordTopicRoutes.get(
  "/:id",
  AdminAuthMiddleware,
  ValidateMongoID,
  ValidateMiddleware,
  new KeywordTopicService().getOne
);

KeywordTopicRoutes.put(
  "/:id",
  AdminAuthMiddleware,
  UpdateKeywordTopicValidate,
  ValidateMiddleware,
  new KeywordTopicService().update
);

KeywordTopicRoutes.delete(
  "/:id",
  AdminAuthMiddleware,
  ValidateMongoID,
  ValidateMiddleware,
  new KeywordTopicService().delete
);

export default KeywordTopicRoutes;
