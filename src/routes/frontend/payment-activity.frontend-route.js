import { Router } from "express";
import PaymentActivityService from "../../services/payment-activity.service.js";
const PaymentActivityRoutes = Router();

PaymentActivityRoutes.get("/", new PaymentActivityService().getByCustomer);

export default PaymentActivityRoutes;
