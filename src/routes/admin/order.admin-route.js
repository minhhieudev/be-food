import { Router } from "express";
import OrderService from "../../services/order.service.js";

const OrderRoutes = Router();
// Admin
OrderRoutes.get("/admin", new OrderService().getAll);

OrderRoutes.get("/admin/:id", new OrderService().getByID);

export default OrderRoutes;
