import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import nodeMailer from "nodemailer";
import config from "../configs/config.js";
import Customer from "../models/customer.model.js";
import Otp from "../models/otp.model.js";
import Wallet from "../models/wallet.model.js";
import { encryptObjectId } from "../utils/function.js";
import translations from "../common/translate-mess-response.json" assert { type: "json" };

const otpSecret = "mstOtpSecret";
class CusAuthService {
  async loginByGoogle(req, res) {
    try {
      const lang = req.header.lang;
      const { token } = req.body;
      const client = new OAuth2Client(
        "458973661783-mtt3pldt4g152ng9cb2d07ge1srprrv8.apps.googleusercontent.com"
      );
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience:
          "458973661783-mtt3pldt4g152ng9cb2d07ge1srprrv8.apps.googleusercontent.com", // Replace with your client ID
      });

      const payload = ticket.getPayload();

      const { email, picture } = payload;

      // register if email doesn't exist
      let hasCustomer = await Customer.findOne({ email }).lean();

      if (!hasCustomer) {
        // Add user
        hasCustomer = await Customer.create({ email, avatar: picture });
        await Wallet.create({
          customer: hasCustomer._id,
        });
      } else {
        await Customer.findOneAndUpdate({ email }, { avatar: picture });
      }

      // login if email exist
      if (hasCustomer.status === "blocked") {
        throw `${translations.accountLocked[lang]}. ${translations.reason[lang]}: ${hasCustomer?.reasonBlock}`;
      }

      const accessToken = jwt.sign(
        {
          _id: hasCustomer._id,
          email: hasCustomer.email,
          currency: hasCustomer.currency,
        },
        config.api.customer.accessTokenKey,
        {
          expiresIn: "1d",
        }
      );

      const refreshToken = jwt.sign(
        {
          _id: hasCustomer._id,
          email: hasCustomer.email,
          currency: hasCustomer.currency,
        },
        config.api.customer.refreshTokenKey,
        {
          expiresIn: "2d",
        }
      );

      res.status(200).send({
        success: true,
        message: translations.loginSuccess[lang],
        data: {
          accessToken,
          refreshToken,
          customer: {
            id: hasCustomer._id,
            email: hasCustomer.email,
            avatar: picture,
            currency: hasCustomer.currency,
            apiKey: hasCustomer.apiKey,
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

  async login(req, res) {

    try {
      const lang = req.header.lang;
      const { email, password } = req.body;

      // xử lý login
      const customer = await Customer.findOne({ email });

      if (!customer) {
        throw translations.accountOrPasswordNotCorrect[lang];
      }

      if (!customer.password) {
        throw translations.passwordNotSetup[lang];
      }

      if (customer.status === "blocked") {
        throw `${translations.accountLocked[lang]}. ${translations.reason[lang]}: ${customer?.reasonBlock}`;
      }

      if (!customer || !(await customer.comparePassword(password))) {
        throw `${translations.accountOrPasswordNotCorrect[lang]}`;
      }

      const accessToken = jwt.sign(
        {
          _id: customer._id,
          email: customer.email,
          currency: customer.currency,
        },
        config.api.customer.accessTokenKey,
        {
          expiresIn: "1d",
        }
      );

      const refreshToken = jwt.sign(
        {
          _id: customer._id,
          email: customer.email,
          currency: customer.currency,
        },
        config.api.customer.refreshTokenKey,
        {
          expiresIn: "2d",
        }
      );

      res.status(200).send({
        success: true,
        message: translations.loginSuccess[lang],
        data: {
          accessToken,
          refreshToken,
          customer: {
            id: customer._id,
            email: customer.email,
            currency: customer.currency,
            apiKey: customer.apiKey,
            info: customer.info,
            contact: customer.contact,
          },
        },
      });
    } catch (error) {
      console.error(error);
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
      const lang = req.header.lang;
      const customer = await Customer.findOne({ _id: user._id });

      const hasOldPassword = await customer.comparePassword(oldPassword);

      if (!hasOldPassword) {
        throw translations.passwordNotCorrect[lang];
      }

      // update password
      customer.password = newPassword;
      await customer.save();

      res.status(200).send({
        success: true,
        message: translations.changePasswordSuccess[lang],
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

  async profile(req, res) {
    try {
      const { contact, info } = req.body;
   
      const user = req.user;
      const lang = req.header.lang;
      const customer = await Customer.findOne({ _id: user._id });

      if (customer) {
        // update password
        customer.info = info;
        customer.contact = contact;
        await customer.save();
      }

      res.status(200).send({
        success: true,
        message: 'HELO',
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

  // register
  async register(req, res) {

    try {
      const { email, password } = req.body;
      const lang = req.header.lang;

      const checkCustomer = await Customer.findOne({ email }).lean();
      if (checkCustomer) throw translations.accountAlreadyRegistered[lang];

      // Add user
      const customer = new Customer({
        email,
        password,
      });

      await customer.save();

      customer.apiKey = encryptObjectId(customer._id);
      await customer.save();

      const wallet = new Wallet({
        customer: customer._id,
      });

      await wallet.save();

      res.status(200).json({
        success: true,
        message: translations.accountRegistationSuccess[lang],
      });
    } catch (error) {
      console.error("error: ", error);
      res.status(200).send({
        success: false,
        alert: "error",
        message: `${error}`,
        error,
      });
    }
  }

  async sendOtpRegister(req, res) {
    try {
      const { email } = req.body;
      const checkCustomer = await Customer.findOne({ email: email }).lean();
      const lang = req.header.lang;

      if (checkCustomer) {
        throw translations.emailRegistered[lang];
      }

      // Tạo một mã OTP ngẫu nhiên (6 chữ số)
      const otp = Math.floor(100000 + Math.random() * 900000);

      // Thời gian hết hạn của mã OTP  sau 2 phút
      const exp = Date.now() + 5 * 60 * 1000;

      const newOtp = new Otp({
        email,
        otp,
        exp,
        type: "register",
      });

      await newOtp.save();
      const cusAuthService = new CusAuthService();
      await cusAuthService.sendEmail(
        email,
        `
        Chào bạn,

        Cảm ơn bạn đã đăng ký tài khoản với chúng tôi. Đây là mã OTP đăng ký của bạn:
        
        Mã OTP: ${otp}
        
        Vui lòng sử dụng mã này để hoàn tất quá trình đăng ký. Xin lưu ý rằng mã OTP này chỉ có hiệu lực trong vòng 10 phút kể từ khi nhận được email này.
        
        Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.
        
        Trân trọng,
        MST Entertainment
        `
      );
      res.status(200).json({ message: translations.sendOtpSuccess[lang] });
    } catch (error) {
      console.log(error);
      res.status(200).send({
        success: false,
        alert: "error",
        message: `${error}`,
        error,
      });
    }
  }

  // Send OTP forgot password
  async sendOtpForgotPassword(req, res) {
    try {
      const { email } = req.body;
      const checkCustomer = await Customer.findOne({ email: email }).lean();
      const lang = req.header.lang;

      if (!checkCustomer) {
        throw translations.emailRegistered[lang];
      }

      const currentOtp = await Otp.findOne({ email, exp: { $gt: Date.now() } });

      if (currentOtp) {
        throw translations.checkOtpByEmail[lang];
      }

      // Tạo một mã OTP ngẫu nhiên (6 chữ số)
      const otp = Math.floor(100000 + Math.random() * 900000);

      // Thời gian hết hạn của mã OTP  sau 5 phút
      const exp = Date.now() + 5 * 60 * 1000;

      const newOtp = new Otp({
        email,
        otp,
        exp,
      });

      await newOtp.save();

      const cusAuthService = new CusAuthService();
      await cusAuthService.sendEmail(
        email,
        `
        Chào bạn,

        Bạn nhận được email này vì chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Đây là mã OTP để hoàn tất quá trình đặt lại mật khẩu:
        
        Mã OTP: ${otp}
        
        Vui lòng sử dụng mã này để tiếp tục quá trình đặt lại mật khẩu của bạn. Xin lưu ý rằng mã OTP này chỉ có hiệu lực trong vòng 5 phút kể từ khi nhận được email này.
        
        Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này. Nếu bạn vẫn gặp bất kỳ vấn đề nào, vui lòng liên hệ với chúng tôi.
        
        Trân trọng,
        MST Entertainment      
        `
      );
      res.status(200).json({ message: translations.sendOtpSuccess[lang] });
    } catch (error) {
      console.log(error);
      res.status(200).send({
        success: false,
        alert: "error",
        message: `${error}`,
        error,
      });
    }
  }

  // Xác thực OTP
  async verifyOTP(req, res) {
    try {
      // validate TODO
      const { email, otp } = req.body;
      const otpRecord = await Otp.findOne({ email, otp });
      const lang = req.header.lang;

      if (otpRecord && otpRecord.exp > Date.now()) {
        // Tạo token OTP
        const token = jwt.sign({ email, otp }, otpSecret, {
          expiresIn: "5m",
        });

        res
          .status(200)
          .json({ message: translations.verifyOtpSuccess[lang], token });
      } else {
        throw translations.otpIncorrect[lang];
      }
    } catch (error) {
      console.error("error: ", error);
      res.status(200).send({
        success: false,
        alert: "error",
        message: `${error}`,
        error,
      });
    }
  }

  // Tạo mật khẩu
  async createPassword(req, res) {
    const { token, password } = req.body;
    const lang = req.header.lang;
    try {
      // Xác minh token
      const decodedToken = jwt.verify(token, otpSecret);

      if (!decodedToken) {
        throw translations.invalidToken[lang];
      }

      const otpRecord = await Otp.findOne({
        email: decodedToken.email,
        otp: decodedToken.otp,
      });

      if (!otpRecord || otpRecord.exp < Date.now()) {
        throw translations.tokenExpiredOrNotExist[lang];
      }

      // Xóa bản ghi OTP sau khi đã sử dụng token
      await Otp.deleteOne({
        email: decodedToken.email,
        otp: decodedToken.otp,
      });

      // Add user
      const customer = new Customer({
        email: decodedToken.email,
        password,
      });

      await customer.save();

      const wallet = new Wallet({
        customer: customer._id,
      });

      await wallet.save();

      res.status(200).send({
        success: true,
        data: {
          customer: {
            email: customer.email,
            _id: customer._id,
          },
          wallet: {
            balance: wallet.balance,
            totalRecharged: wallet.totalRecharged,
            status: wallet.status,
            _id: wallet._id,
          },
        },
        alert: "success",
        message: translations.accountRegistationSuccess[lang],
      });
    } catch (error) {
      console.error(error);
      res.status(200).send({
        success: false,
        alert: "error",
        message: `${error}`,
        error,
      });
    }
  }

  // Cập nhật khẩu bằng mã OTP
  async changePasswordByOTP(req, res) {
    try {
      const { token, password } = req.body;
      const lang = req.header.lang;
      // Xác minh token
      let decodedToken;
      jwt.verify(token, otpSecret, (err, result) => {
        console.log;
        if (err) throw translations.otpIncorrect[lang];
        else decodedToken = result;
      });

      if (!decodedToken) {
        throw translations.invalidToken[lang];
      }

      // Xóa bản ghi OTP
      await Otp.deleteOne({
        email: decodedToken.email,
        otp: decodedToken.otp,
      });

      // Update password
      const customer = await Customer.findOne({ email: decodedToken.email });

      if (!customer) throw translations.accountNotExist[lang];
      customer.password = password;
      await customer.save();

      res.status(200).send({
        success: true,
        alert: "success",
        message: translations.updatePasswordSuccess[lang],
      });
    } catch (error) {
      console.error(error);
      res.status(200).send({
        success: false,
        alert: "error",
        message: `${error}`,
        error,
      });
    }
  }

  async sendEmail(email, data) {
    var transporter = nodeMailer.createTransport({
      service: "Gmail",
      auth: {
        user: "ntlanphpy00@gmail.com",
        pass: "bujo dxxn blwo soha",
      },
    });

    var mainOptions = {
      from: "MST tool",
      to: email,
      subject: "Xác thực OTP",
      template: "verify-otp",
      text: data,
    };

    transporter.sendMail(mainOptions, function (err, info) {
      if (err) {
        console.log("error while sending email, error: ", err);
      }
    });
  }

  async refreshApiKey(req, res) {
    try {
      const user = req.user;
      const customer = await Customer.findByIdAndUpdate(
        user._id,
        {
          apiKey: encryptObjectId(user._id),
        },
        { runValidators: true, new: true }
      );

      const lang = req.header.lang;

      res.status(200).send({
        success: true,
        data: {
          apiKey: customer.apiKey,
        },
        alert: "success",
        message: translations.updateSuccess[lang],
      });
    } catch (error) {
      console.error(error);
      res.status(200).send({
        success: false,
        alert: "error",
        message: `${error}`,
        error,
      });
    }
  }

  async getCurrentApiKey(req, res) {
    try {
      const user = req.user;
      let customer = await Customer.findById(user._id).select("apiKey");
      const lang = req.header.lang;
      if (!customer) {
        throw translations.accountNotExist[lang];
      }

      if (!customer.apiKey) {
        customer.apiKey = encryptObjectId(customer._id);
        await customer.save();
      }

      res.status(200).json({
        success: true,
        data: {
          apiKey: customer.apiKey,
        },
        message: translations.getApiKeySuccess[lang],
      });
    } catch (error) {
      console.error(error);
      res.status(200).json({
        success: false,
        message: `${error.message}`,
      });
    }
  }
}

export default CusAuthService;
