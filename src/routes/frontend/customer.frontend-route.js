import { Router } from "express";

import CustomerService from "../../services/customer.service.js";

const CustomerRoutes = Router();

CustomerRoutes.put("/", new CustomerService().updateByCustomer);

CustomerRoutes.get("/menu-services", new CustomerService().getMenuService);

export default CustomerRoutes;
