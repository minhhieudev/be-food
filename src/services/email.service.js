import nodeMailer from "nodemailer";
import config from "../configs/config.js";

class SendEmailService {
  constructor() {
    this.sendEmailRegister = this.sendEmailRegister.bind(this);
  }

  async sendEmailRegister(email, token) {

    const content = `
        Chào bạn,

        Cảm ơn bạn đã đăng ký tài khoản với chúng tôi. Vui lòng nhấp vào liên kết dưới đây để xác thực:
        
        ${config.domain.fe}/register/${token}
        
        Vui lòng sử dụng mã này để hoàn tất quá trình đăng ký. Xin lưu ý rằng liên kết này chỉ có hiệu lực trong vòng 7 ngày kể từ khi nhận được email này.
        
        Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.
        
        Trân trọng,
        MST Entertainment
      `;

    await this.sendEmail(email, "Bio - Verify email", content);
  }
  

  async sendEmailForgotPassword(email, token) {
    const content = `
        Xin chào,

        Có phải bạn đang gặp chút khó khăn khi nhớ mật khẩu cho tài khoản Bio của mình không? Đừng lo lắng, chuyện đó xảy ra với tất cả chúng ta mà! 😊

        Chỉ cần nhấp vào nút bên dưới để đặt lại mật khẩu của bạn:

        ${config.domain.fe}/change-password/${token}

        Liên kết này chỉ có hiệu lực trong 5 phút, vì vậy hãy nhanh lên nhé!

        Nếu bạn cần thêm hỗ trợ, đừng ngần ngại liên hệ với chúng tôi.

        Chúc bạn một ngày tốt lành!
        MST Entertainment
  `;

    await this.sendEmail(
      email,
      "Bio - Verify email cập nhật mật khẩu",
      content
    );
  }
  
  async sendEmail(email, subject, content) {
    var transporter = nodeMailer.createTransport({
      service: "Gmail",
      auth: {
        user: "ntlanphpy00@gmail.com",
        pass: "bujo dxxn blwo soha",
      },
    });
  
    var mainOptions = {
      from: "MST Entertainment",
      to: email,
      subject: subject,
      template: "verify-email",
      text: content,
    };
  
    transporter.sendMail(mainOptions, function (err, info) {
      if (err) {
        console.log("Error while sending email: ", err);
      } else {
        console.log("Email sent successfully: ", info);
      }
    });
  }
  
}

export const sendEmailServiceIntance = new SendEmailService();
export default SendEmailService;
