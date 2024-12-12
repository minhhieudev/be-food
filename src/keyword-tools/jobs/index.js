import cron from "node-cron";
import CollectedKeywordService from "../services/collected-keyword.service.js";
import KeywordStatisticService from "../services/keyword-statistic.service.js";

cron.schedule("59 23 * * *", new CollectedKeywordService().collectedKeyword, {
  scheduled: true,
  timezone: "Asia/Ho_Chi_Minh",
});

// 0 3 * * *
cron.schedule("0 3 * * *", new KeywordStatisticService().collectAndSaveData, {
  scheduled: true,
  timezone: "Asia/Ho_Chi_Minh",
});

export default {};
