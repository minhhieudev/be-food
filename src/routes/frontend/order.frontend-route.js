import { Router } from "express";
import ValidateMiddleware from "../../middleware/validate.middleware.js";
import OrderService from "../../services/order.service.js";
import {
  CreateOrderValidate,
  OrderStatusValidate,
} from "../../validates/order.validate.js";

const OrderRoutes = Router();

// Customer
OrderRoutes.get("/", new OrderService().getsByCustomer);

OrderRoutes.get("/orderCustomer", new OrderService().getOrderCustomer);

OrderRoutes.post(
  "/status",
  OrderStatusValidate,
  ValidateMiddleware,
  new OrderService().getStatusOrders
);

OrderRoutes.get("/statistic", new OrderService().statistic);

OrderRoutes.get("/:id", new OrderService().getOneByCustomer);

OrderRoutes.post("/get-summary", new OrderService().getSummary);

OrderRoutes.post(
  "/",
  //CreateOrderValidate,
  ValidateMiddleware,
  new OrderService().create
);

OrderRoutes.post("/many", new OrderService().createManyOrder);

export default OrderRoutes;
