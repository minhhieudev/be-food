import Customer from "../../models/customer.model.js";
import { decryptObjectId } from "../../utils/function.js";
import  redisServiceIntance from "../../services/redis.service.js";
import translations from "../../common/translate-mess-response.json" assert { type: "json" };

async function PublicAuthMiddleware(req, res, next) {
  try {
    const token = (req.header.authorization || "")
      .toString()
      .replace("Bearer ", "");

    if (!token) {
      return res.status(403).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const customerId = decryptObjectId(token);

    // Check redis
    let status;
    const value = await redisServiceIntance.get(`cus-${customerId}`);
    if (!value?.status) {
      const checkCustomer = await Customer.findById(customerId)
        .select("status apiKey")
        .lean();
      await redisServiceIntance.set(
        `cus-${checkCustomer._id.toString()}`,
        checkCustomer
      );
      status = checkCustomer?.status;
    } else {
      status = value?.status;
    }

    // Check api key
    const customer = await Customer.findOne({ _id: customerId, apiKey: token });
    const language = req?.header?.lang || "vi";

    if (!customer || status === "blocked") {
      return res.status(403).json({
        success: false,
        message: translations.customerBlockedMessage[language],
      });
    }

    req.user = {
      _id: customerId,
    };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Truy cập bị từ chối",
    });
  }
}
export default PublicAuthMiddleware;
