import jwt from "jsonwebtoken";
import config from "../../configs/config.js";

async function FrontendAuthMiddleware(req, res, next) {
  console.log('Header:',req.headers);
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.replace("Bearer ", "").trim();

    if (!token) {
      return res.status(403).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    // Xác thực và giải mã token
    const payload = jwt.verify(token, config.api.customer.accessTokenKey);

    // Đính kèm thông tin user vào request
    req.user = payload;

    next();
  } catch (error) {
    // Xử lý lỗi xác thực
    let errorMessage = "Unauthorized access.";
    if (error.name === "TokenExpiredError") {
      errorMessage = "Phiên đăng nhập đã hết hạn. Xin vui lòng đăng nhập lại.";
    } else if (error.message === "jwt malformed") {
      errorMessage = "Token không hợp lệ.";
    }

    return res.status(401).json({
      success: false,
      message: errorMessage,
    });
  }
}

export default FrontendAuthMiddleware;
