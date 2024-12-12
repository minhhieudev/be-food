import cron from "node-cron";
import OrderService from "../services/order.service.js";
import PaymentService from "../services/payment.service.js";
import RateService from "../services/rate.service.js";
import ServiceGroupService from "../services/service-group.service.js";

// order
cron.schedule("*/30 * * * * *", new OrderService().checkPartnerOrderQueue, {
  scheduled: true,
  timezone: "Asia/Ho_Chi_Minh",
});

cron.schedule("*/30 * * * * *", new PaymentService().checkRechargeByBank, {
  scheduled: true,
  timezone: "Asia/Ho_Chi_Minh",
});

cron.schedule("00 09 * * *", new RateService().updateRate, {
  scheduled: true,
  timezone: "Asia/Ho_Chi_Minh",
});

cron.schedule("*/5 * * * *", new ServiceGroupService().setScriptGroupCode, {
  scheduled: true,
  timezone: "Asia/Ho_Chi_Minh",
});

export default {};
