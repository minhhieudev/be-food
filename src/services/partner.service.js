import instance1DgmeService from "./_1dgme.service.js";
import OngtrumService from "./ongtrum.service.js";
class PartnerService {
  async getBalance(req, res) {
    try {
      const { partnerCode } = req.params;
      const activePartners = ["1dg.me", "ongtrum"];
      if (!partnerCode || !activePartners.includes(partnerCode)) {
        throw "Mã đối tác không hợp lệ";
      }
      let balance = 0;
      switch (partnerCode) {
        case "1dg.me": {
          balance = await instance1DgmeService.getBalance();

          break;
        }
        case "ongtrum": { 
          const ongtrumService = new OngtrumService();
          balance = await ongtrumService.getBalance();
          break;
        }
        default:
          break;
      }

      res.status(200).send({
        success: true,
        data: { balance, partnerCode },
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
export default PartnerService;
