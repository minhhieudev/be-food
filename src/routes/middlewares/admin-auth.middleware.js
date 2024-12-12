import jwt from "jsonwebtoken";
import config from "../../configs/config.js";

async function AdminAuthMiddleware(req, res, next) {
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

    let payload;
    jwt.verify(token, config.api.admin.accessTokenKey, (err, result) => {
      if (err) throw "Token hết hạn. Xin vui lòng đăng nhập lại";
      else payload = result;
    });

    req.user = payload;
    next();
  } catch (error) {
    console.log({ error });
    return res.status(401).json({
      success: false,
      message: error,
    });
  }
}
export default AdminAuthMiddleware;
