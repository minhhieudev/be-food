import Wallet from "../models/wallet.model.js";

class WalletService {
  async getOne(req, res) {
    try {
      const user = req.user;
      const customer = await Wallet.findOne({customer: user._id}).select("balance totalRecharged -_id").lean();

      res.status(200).send({
        success: true,
        data: { wallet: customer },
      });


    } catch (error) {
      console.log("error: ", error);
      return res.status(200).send({
        success: false,
        alert: "error",
        message: `${error}`,
        error,
      });
    }
  }
}
export default WalletService; 