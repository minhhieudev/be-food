import { Router } from "express";

import CustomerService from "../../services/customer.service.js";

const CustomerNotAuthRoutes = Router();

CustomerNotAuthRoutes.get("/menu-services", new CustomerService().getMenuService);

export default CustomerNotAuthRoutes;
