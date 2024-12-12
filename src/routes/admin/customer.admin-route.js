import { Router } from "express";

import CustomerService from "../../services/customer.service.js";

const CustomerRoutes = Router();

CustomerRoutes.get("/", new CustomerService().getAll);

CustomerRoutes.get("/:id", new CustomerService().getById);

CustomerRoutes.post("/", new CustomerService().create);

CustomerRoutes.put("/:id", new CustomerService().update);

CustomerRoutes.delete("/:id", new CustomerService().delete);

CustomerRoutes.post("/:id/block", new CustomerService().block);

CustomerRoutes.post("/:id/restore", new CustomerService().restore);

export default CustomerRoutes;
