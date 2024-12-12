import { Router } from "express";
import PublicAuthMiddleware from "./middlewares/public-auth.middleware.js";
import ServicePackageService from "../services/service-package.service.js";
import { CreateOrderValidate } from "../validates/order.validate.js";
import ValidateMiddleware from "../middleware/validate.middleware.js";
import OrderService from "../services/order.service.js";
import CustomerService from "../services/customer.service.js";

const UsersRoutes = Router();

// Lây danh sách service packages
UsersRoutes.get(
  "/service-packages",
  PublicAuthMiddleware,
  new ServicePackageService().getsByCustomer
);

// Lây số dư hiện có
UsersRoutes.get(
  "/get-balance",
  PublicAuthMiddleware,
  new CustomerService().getBalance
);

// Lây số dư hiện có
UsersRoutes.get(
  "/get-order-status/:id",
  PublicAuthMiddleware,
  new OrderService().getOrderStatus
);

// Tạo đơn hàng
UsersRoutes.post(
  "/create-order",
  PublicAuthMiddleware,
  CreateOrderValidate,
  ValidateMiddleware,
  new OrderService().create
);

export default UsersRoutes;
