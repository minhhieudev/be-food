import crypto from "crypto";
import { convertUSDToVND } from "../utils/function.js";
import PaymentActivity from "../models/payment-activity.model.js";
import Wallet from "../models/wallet.model.js";
import moment from "moment";
import Setting from "../models/setting.model.js";
import RechargeStatus from "../models/recharge-status.model.js";
import PaymentService from "./payment.service.js";
import translations from "../common/translate-mess-response.json" assert { type: "json" };

class PerfectMoneyService {
  constructor() {
    this.check = this.check.bind(this);
  }

  async getForm(req, res) {
    const lang = req.header.lang;
    try {
      const { amount } = req.body;
      const user = req.user;
      const statusURL =
        "https://scadmin-api.mstapp.shop/public-api/perfect-money/check";
      const successUrl = "https://tool.mstapp.shop/statistic";
      const failUrl = "https://tool.mstapp.shop/payment";
      const redirectMethod = "GET";
      const baggageFields = "";
      const memo = "";

      // Get perfect money account, name
      const settings = await Setting.find({
        key: {
          $in: ["perfectMoneyAccount", "perfectMoneyName", "isUsePerfectMoney"],
        },
      });

      const { pmAccount, pmName, isUsePerfectMoney } = settings.reduce(
        (acc, setting) => {
          if (setting.key === "perfectMoneyAccount")
            acc.pmAccount = setting.value;
          if (setting.key === "perfectMoneyName") acc.pmName = setting.value;
          if (setting.key === "isUsePerfectMoney")
            acc.isUsePerfectMoney = setting.value;
          return acc;
        },
        {}
      );

      if (!pmAccount || !pmName || !isUsePerfectMoney)
        throw translations.paypalNotSetup[lang]

      // Create data include paymentID, amount, customerID, memo, status   TODO
      const rechareStatus = await RechargeStatus.create({
        type: "perfectMoney",
        user: user._id,
        status: "pendding",
        unit: "USD",
        customer: user._id,
        expectMoney: amount,
        description: "",
      });

      const paymentID = rechareStatus._id;

      // Response form to frontend
      const form = `
      <form action="https://perfectmoney.com/api/step1.asp" method="POST">
          <input type="hidden" name="PAYEE_ACCOUNT" value="${pmAccount}" />
          <input type="hidden" name="PAYEE_NAME" value="${pmName}" />
          <input type="hidden" name="PAYMENT_ID" value="${paymentID}" />
          <input type="hidden" name="PAYMENT_AMOUNT" value="${amount}" />
          <input type="hidden" name="PAYMENT_UNITS" value="USD" />
          <input
            type="hidden"
            name="STATUS_URL"
            value="${statusURL}"
          />
          <input
            type="hidden"
            name="PAYMENT_URL"
            value="${successUrl}"
          />
          <input type="hidden" name="PAYMENT_URL_METHOD" value="${redirectMethod}" />
          <input
            type="hidden"
            name="NOPAYMENT_URL"
            value="${failUrl}"
          />
          <input type="hidden" name="NOPAYMENT_URL_METHOD" value="${redirectMethod}" />
          <input type="hidden" name="SUGGESTED_MEMO" value="${memo}" />
          <input type="hidden" name="BAGGAGE_FIELDS" value="${baggageFields}" />
          <input type="submit" name="PAYMENT_METHOD" value="Nạp ngay" />
       </form>
      `;

      return res.status(200).send(form);
    } catch (error) {
      console.log({ error });
      res.status(200).send({
        success: false,
        message: error?.message || translations.depositFailed[lang],
        error,
      });
    }
  }

  // Check Status
  async check(req, res) {
    const lang = req.header.lang;
    try {
      const paymentService = new PaymentService();
      const logs = req.body;
      const setting = await Setting.findOne({ key: "isUsePerfectMoney" })
        .select("value")
        .lean();

      if (!setting) {
        throw translations.paypalNotSetup[lang];
      }

      if (logs?.ERROR) return res.status(200).success({ success: true });

      const paymentID = logs.PAYMENT_ID;
      const rechargeStatus = await RechargeStatus.findOne({
        _id: paymentID,
        status: "pendding",
      });

      if (!rechargeStatus) throw translations.transactionHistoryNotFound[lang]
      
      const verifyData = await this.verifyData(logs, rechargeStatus);

      if (verifyData) {
        const amount = logs.PAYMENT_AMOUNT;
        const vndAmountFromPM = await convertUSDToVND(amount);
        const detailDiscount =
          await paymentService.calculateAmountAfterDiscount(vndAmountFromPM);
        const amountAfterDiscount = detailDiscount.newAmount;
        // Update timestamp from perfect money
        const timestampInMilliseconds =
          logs?.TIMESTAMPGMT < 1e12
            ? logs?.TIMESTAMPGMT * 1000
            : logs?.TIMESTAMPGMT;

        const time = moment(timestampInMilliseconds)
          .utcOffset(420)
          .format("HH:mm DD/MM/YYYY");

        let message = `Nạp thành công $${amount} lúc ${time} qua Perfect Money`;
        if (amountAfterDiscount > vndAmountFromPM) {
          message += `\nTặng thêm: ${detailDiscount.discountPercent}% giá trị nạp`;
        }

        const wallet = await Wallet.findOne({
          customer: rechargeStatus.customer,
        }).select("balance totalRecharged");

        const newBalance = wallet?.balance + amountAfterDiscount;

        // update payment activity, wallet, rechargeStatus
        await Promise.all([
          rechargeStatus.updateOne({ status: "success" }),
          PaymentActivity.create({
            transaction: `PM${paymentID}`,
            customer: rechargeStatus.customer,
            type: "perfectMoney",
            amount: vndAmountFromPM,
            oldBalance: wallet.balance,
            newBalance,
            wallet: wallet._id,
            status: "success",
            description: message,
            depositDiscountPercent: detailDiscount.discountPercent,
          }),
          wallet.updateOne({
            $inc: {
              balance: +amountAfterDiscount,
              totalRecharged: +vndAmountFromPM,
            },
          }),
        ]);

        // Create logs from perfect money TODO
      }

      res.status(200).json({
        success: true,
      });
    } catch (error) {
      console.log("error: ", error);
      return res.status(200).json({
        success: false,
        message: "error",
      });
    }
  }

  async verifyData(logs, rechargeStatus) {
    const { unit, _id } = rechargeStatus;
    const paymentID = _id.toString();

    const settings = await Setting.find({
      key: { $in: ["perfectMoneyAccount", "perfectMoneyAlternatePassphrase"] },
    });

    const { pmAccount, pmAlternatePassphrase } = settings.reduce(
      (acc, setting) => {
        if (setting.key === "perfectMoneyAccount")
          acc.pmAccount = setting.value;
        if (setting.key === "perfectMoneyAlternatePassphrase")
          acc.pmAlternatePassphrase = setting.value;
        return acc;
      },
      {}
    );

    const hashAlternatePassphrase = crypto
      .createHash("MD5")
      .update(pmAlternatePassphrase)
      .digest("hex")
      .toUpperCase();

    const data = `${paymentID}:${pmAccount}:${logs.PAYMENT_AMOUNT}:${unit}:${logs?.PAYMENT_BATCH_NUM}:${logs?.PAYER_ACCOUNT}:${hashAlternatePassphrase}:${logs?.TIMESTAMPGMT}`;

    const hashedData = crypto
      .createHash("MD5")
      .update(data)
      .digest("hex")
      .toUpperCase();

    if (hashedData === logs.V2_HASH) return true;
    return false;
  }
}

export default PerfectMoneyService;
