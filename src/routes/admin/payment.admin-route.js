import { Router } from "express";
import ValidateMiddleware from "../../middleware/validate.middleware.js";
import PaymentService from "../../services/payment.service.js";
import { RechargeByValidate } from "../../validates/payment.validate.js";

const PaymentRoutes = Router();
const paymentService = new PaymentService();

PaymentRoutes.post(
  "/recharge-by-admin",
  RechargeByValidate,
  ValidateMiddleware,
  paymentService.rechargeByAdmin
);

export default PaymentRoutes;
