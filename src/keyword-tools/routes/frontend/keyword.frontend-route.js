import { Router } from "express";
import KeywordService from "../../services/keyword.service.js";

const KeywordRoutes = Router();
const keywordService = new KeywordService();


KeywordRoutes.get(
  "/customer/search",
  keywordService.searchListByCustomer
);

KeywordRoutes.get(
  "/customer/followed",
  keywordService.getFollowedListByCustomer
);

KeywordRoutes.get(
  "/customer/feature",
  keywordService.getFeaturedKeywordByTopic
);

KeywordRoutes.get(
  "/customer/featured-content",
  keywordService.getFeaturedContent
);

KeywordRoutes.get(
  "/customer/suggested",
  keywordService.getKeywordSuggest
);

KeywordRoutes.get(
  "/customer/:id",
  keywordService.getDetailByCustomer
);


KeywordRoutes.put(
  "/customer/follow",
  keywordService.follow
);


export default KeywordRoutes;
