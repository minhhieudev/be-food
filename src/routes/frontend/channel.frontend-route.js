import { Router } from "express";
import ChannelService from "../../services/channel.service.js";
const ChannelRoutes = Router();
const channelService = new ChannelService();

// GET channel name
ChannelRoutes.post("/get-name", channelService.getVideoInfo);

export default ChannelRoutes;
