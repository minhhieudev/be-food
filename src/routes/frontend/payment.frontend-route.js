import { Router } from "express";
import PaymentService from "../../services/payment.service.js";

const PaymentRoutes = Router();
const paymentService = new PaymentService();

// recharge
PaymentRoutes.post("/recharge", paymentService.rechargeByPaypal);

export default PaymentRoutes;
