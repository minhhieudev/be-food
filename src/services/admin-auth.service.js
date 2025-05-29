import jwt from "jsonwebtoken";
import config from "../configs/config.js";
import { isValidUsername } from "../utils/function.js";
import Admin from "../models/admin.model.js";
import SendEmailService from './email.service.js';

const sendEmailServiceInstance = new SendEmailService();
class AdminAuthService {
  constructor() {
    this.autoCreateAdmin();
    this.sendEmailService = sendEmailServiceInstance;
  }

  async autoCreateAdmin() {
    const username = "demo01";
    const password = "123456";

    //Lấy thông tin tài khoản
    const checkAdmin = await Admin.findOne({
      username,
    });

    //Nếu tồn tại
    if (!checkAdmin) {
      const admin = new Admin({
        username,
        password,
      });

      await admin.save();

      console.log("create admin success!");
    }
  }

  async register(req, res) {
    try {
      const { email, password, username } = req.body;

      const [hasEmail, isVerified] = await Promise.all([
        Admin.findOne({ email }),
        Admin.findOne({ email }).select("isVerified"),
      ]);

      if (hasEmail) throw "Email đã tồn tại";
      if (!isVerified?.isVerified && hasEmail)
        throw "Bạn vui lòng kiểm tra hộp thư email để xác thực";
  
      const newAdmin = new Admin({
        username,
        password,
        email,
        isVerified: false 
      });
  
      const secret = config.api.admin.registerEmailKey;
      const token = jwt.sign(
        { adminID: newAdmin._id, email, username },
        secret,
        { expiresIn: "7d" }
      );
  
      await newAdmin.save();
  
      sendEmailServiceInstance.sendEmailRegister(email, token);
  
      return res.status(200).json({
        success: true,
        message: "Vui lòng kiểm tra hộp thư email để xác thực",
      });
    } catch (error) {
      console.error("Error in register:", error); 
      return res.status(200).send({
        success: false,
        alert: "error",
        message: `${error}`,
        error,
      });
    }
  }
  
  async verifyEmailRegister(req, res) {
    try {
      const { token } = req.body;

      const secret = config.api.admin.registerEmailKey;
      const payload = jwt.verify(token, secret, (err, result) => {
        if (err) throw "Xác thực email thất bại";
        else return result;
      });

      const adminID = payload.adminID;

      const [admin] = await Promise.all([
        Admin.findOne({
          _id: adminID,
        }).select("isVerified"),
      ]);

      if (!admin) throw "Xác thực thất bại";

      await Promise.all([
        admin.updateOne({ isVerified: true }),
      ]);

      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(200).send({
        success: false,
        alert: "error",
        message: `${error}`,
        error,
      });
    }
  }

  async login(req, res) {
    try {
      const { password, login30Days } = req.body;

      // if (email.length < 6) {
      //   throw "Tài khoản hoặc mật khẩu không đúng";
      // }

      if (password.length == 0) {
        throw "Tài khoản hoặc mật khẩu không đúng";
      }
      // xử lý login

      // xử lý login
      const admin = await Admin.findOne({  });

      if (!admin || !(await admin.comparePassword(password))) {

        throw "Tài khoản hoặc mật khẩu không đúng";
      }

      if (!admin.isVerified)
      throw "Tài khoản này chưa được xác thực. Vui lòng kiểm tra hộp thư email để xác thực";

      let expiresAccessToken = "1d",
        expiresRefreshToken = "2d";

      if (login30Days) {
        expiresAccessToken = "30d";
        expiresRefreshToken = "60d";
      }

      const accessToken = jwt.sign(
        {
          _id: admin._id,
          email: admin.email,
        },
        config.api.admin.accessTokenKey,
        {
          expiresIn: expiresAccessToken,
        }
      );

      const refreshToken = jwt.sign(
        { _id: admin._id, email: admin.email },
        config.api.admin.refreshTokenKey,
        {
          expiresIn: expiresRefreshToken,
        }
      );

      res.status(200).send({
        success: true,
        message: `Đăng nhập thành công`,
        data: {
          accessToken,
          refreshToken,
          admin: {
            id: admin._id,
            username: admin.username,
          },
        },
      });
    } catch (error) {
      res.status(200).send({
        success: false,
        alert: "error",
        message: `${error}`,
        error,
      });
    }
  }

  async changePassword(req, res) {
    try {
      const { oldPassword, newPassword } = req.body;
      const user = req.user;
      const admin = await Admin.findOne({ _id: user._id });

      const hasOldPassword = await admin.comparePassword(oldPassword);

      if (!hasOldPassword) {
        throw "Mật khẩu không chính xác";
      }

      // update password
      admin.password = newPassword;
      await admin.save();

      res.status(200).send({
        success: true,
        message: "Đổi mật khẩu thành công",
      });
    } catch (error) {
      res.status(200).send({
        success: false,
        alert: "error",
        message: `${error}`,
        error,
      });
    }
  }

  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      const payload = jwt.verify(
        refreshToken,
        config.api.admin.refreshTokenKey
      );

      let expiresAccessToken = "1d",
        expiresRefreshToken = "2d";

      const accessToken = jwt.sign(
        {
          _id: payload._id,
          email: payload.email,
        },
        config.api.admin.accessTokenKey,
        {
          expiresIn: expiresAccessToken,
        }
      );

      const newRefreshToken = jwt.sign(
        { _id: payload._id, email: payload.email },
        config.api.admin.refreshTokenKey,
        {
          expiresIn: expiresRefreshToken,
        }
      );
      res.status(200).send({
        success: true,
        data: {
          accessToken,
          refreshToken: newRefreshToken,
        },
      });
    } catch (error) {
      res.status(200).send({
        success: false,
        alert: "error",
        message: `${error}`,
        error,
      });
    }
  }
}

export default AdminAuthService;
