import { Router } from "express";
import WalletService from "../../services/wallet.service.js";

const WalletRoutes = Router();

WalletRoutes.get("/", new WalletService().getOne);

export default WalletRoutes;
