import { Router } from "express";
import ValidateMiddleware from "../../middleware/validate.middleware.js";
import CustomerService from "../../services/customer.service.js";
import OrderService from "../../services/order.service.js";
import ServicePackageService from "../../services/service-package.service.js";
import { CreateOrderValidate } from "../../validates/order.validate.js";

const PartnerRoutes = Router();

// Lây danh sách service packages
PartnerRoutes.get(
  "/service-packages",
  new ServicePackageService().getsByCustomer
);

// Lây số dư hiện có
PartnerRoutes.get(
  "/get-balance",
  new CustomerService().getBalance
);

// Lây số dư hiện có
PartnerRoutes.get(
  "/get-order-status/:id",
  new OrderService().getOrderStatus
);

// Tạo đơn hàng
PartnerRoutes.post(
  "/create-order",
  CreateOrderValidate,
  ValidateMiddleware,
  new OrderService().create
);

export default PartnerRoutes;
