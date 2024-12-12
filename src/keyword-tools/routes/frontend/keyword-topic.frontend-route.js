import { Router } from "express";
import KeywordTopicService from "../../services/keyword-topic.service.js";

const KeywordTopicRoutes = Router();

KeywordTopicRoutes.get(
  "/customer",
  new KeywordTopicService().getListByCustomer
);

KeywordTopicRoutes.get(
  "/customer/followed",
  new KeywordTopicService().getFollowedListByCustomer
);

KeywordTopicRoutes.get(
  "/customer/:id",
  new KeywordTopicService().getDetailByCustomer
);

KeywordTopicRoutes.put(
  "/customer/follow",
  new KeywordTopicService().follow
);

export default KeywordTopicRoutes;
