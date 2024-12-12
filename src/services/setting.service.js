import axios from "axios";
import * as settingData from "../common/setting.json" assert { type: "json" };
import * as translateData from "../common/translate-data.json" assert { type: "json" };
import Customer from "../models/customer.model.js";
import Setting from "../models/setting.model.js";
import OngtrumService from "./ongtrum.service.js";
import PartnerPaymentActivity from "../models/partner-payment-activity.model.js";
import ServicePackage from "../models/service-package.model.js";
import _ from "lodash";
class SettingService {
  constructor() {
    this.initSetting();
    this.getQRBank = this.getQRBank.bind(this);
  }

  async getImportServiceList(req, res) {
    try {
      const otSerivce = new OngtrumService();
      const listService = await otSerivce.getAllServices();
      const response = listService.map((service) => {
        return {
          status: true,
          isBestSellers: false,
          name: service.name,
          code: "",
          description: service.description,
          orderSuccessDescription: "<p></p>",
          name: service.name,
          scriptGroupCode: service.scriptGroupCode,
          scriptCode: service.scriptCode,
          serviceCode: service.serviceCode,
          serviceGroupID: "",
          serviceTags: [],
          partnerCode: "ongtrum",
          partnerServiceID: service.partnerServiceID,
          unit: "",
          price: service.price,
          vipPrice: "",
          originPrice: "",
          type: "runService",
          attributes: [
            {
              label: "UID/link",
              code: "link",
              dataType: "text",
              description: "Nhập UID/link",
              required: true,
              commentType: false,
            },
          ],
          minValue: service.minValue,
          maxValue: service.maxValue,
        };
      });

      res.status(200).json({
        success: true,
        data: response,
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

  async getQRBank(req, res) {
    try {
      const {
        params: { amount },
        user: { _id },
      } = req;

      const keyArr = [
        "bankSuffix",
        "bankPrefix",
        "isUseBank",
        "bankAccountName",
        "bankAccountNumber",
        "bankQRTemplate",
        "bankId",
      ];

      const [settings, user] = await Promise.all([
        Setting.find({ key: { $in: keyArr } })
          .select("key value -_id")
          .lean(),
        Customer.findById(_id).select("paymentCode").lean(),
      ]);

      const getValue = (key) => {
        try {
          return settings.filter((x) => x.key === key)[0]?.value;
        } catch (error) {
          console.log(error);
          return "";
        }
      };

      if (getValue("isUseBank") === "false") {
        throw "Chức năng này không khả dụng";
      }

      const baseUrlQR = "https://api.vietqr.io/image/";
      const syntax = `${getValue("bankPrefix")}${user?.paymentCode}${getValue(
        "bankSuffix"
      )}`;
      const qrUrl = `${baseUrlQR}${getValue("bankId")}-${getValue(
        "bankAccountNumber"
      )}-${getValue("bankQRTemplate")}.jpg?accountName=${encodeURIComponent(
        getValue("bankAccountName")
      ).toString()}&amount=${amount}&addInfo=${syntax}`;

      const bankList = await this.requestGetBank();

      const bankFilter = bankList?.data.filter(
        (bank) => bank.bin == getValue("bankId")
      );

      const bankInfo = {
        bankAccountName: getValue("bankAccountName"),
        bankAccountNumber: getValue("bankAccountNumber"),
        bankName: bankFilter[0]?.name || "",
      };

      res.status(200).json({
        success: true,
        data: {
          qrUrl,
          amount: Number(amount),
          syntax,
          bankInfo,
        },
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

  async requestGetBank() {
    try {
      const response = await axios.get("https://api.vietqr.io/v2/banks");
      return response.data;
    } catch (error) {
      console.error("Error fetching banks:", error);
    }
  }

  async update(req, res) {
    try {
      const dataUpdate = req.body;

      dataUpdate.updateData.forEach(async (item) => {
        if (item.value !== "secret") {
          await Setting.updateOne(
            { key: item.key },
            { key: item.key, value: item.value },
            { upsert: true, runValidators: true }
          );
        }
      });

      res.status(200).json({
        success: true,
        message: "Cập nhật thành công",
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

  async get(req, res) {
    try {
      const { keys } = req.query;

      if (!keys) {
        throw "Từ khoá không được để trống";
      }
      const keyArr = keys.replace(/\s/g, "").split(",");

      const settings = await Setting.find({ key: { $in: keyArr } })
        .select("key value -_id")
        .lean();

      const hidenKeys = [
        "chatgpt",
        "paypalClientID",
        "paypalClientSecret",
        "PARTNER_1dg.me_API_KEY",
        "PARTNER_ongtrum_API_KEY",
        "perfectMoneyAlternatePassphrase",
        "perfectMoneyAccount",
        "apiBankKey",
      ];

      res.status(200).json({
        success: true,
        data: {
          settings: settings.map((x) => {
            if (hidenKeys.indexOf(x.key) > -1) {
              return {
                ...x,
                value: "secret",
              };
            } else {
              return x;
            }
          }),
        },
      });
    } catch (error) {
      console.log("error: ", error);
      res.status(200).send({
        success: false,
        alert: "error",
        message: `${error}`,
        error,
      });
    }
  }

  async initSetting() {
    try {
      const listDataCreate = [];

      await Promise.all(
        settingData.default.map(async (setting) => {
          const hasSetting = await Setting.findOne({ key: setting.key });
          if (!hasSetting) {
            listDataCreate.push(setting);
          }
        })
      );

      await Setting.insertMany(listDataCreate);
    } catch (error) {
      console.error("Error initializing server:", error);
    }
  }

  async getByCustomer(req, res) {
    try {
      const keyArr = [
        "facebook",
        "zalo",
        "telegram",
        "phoneNumber",
        "systemDescription",
        "systemName",
        "isUsePaypal",
        "depositDiscount",
        "isUseBank",
        "isUsePerfectMoney",
      ];

      const settings = await Setting.find({ key: { $in: keyArr } })
        .select("key value -_id")
        .lean();

      res.status(200).json({
        success: true,
        data: { settings },
      });
    } catch (error) {
      console.log("error: ", error);
      res.status(200).send({
        success: false,
        alert: "error",
        message: `${error}`,
        error,
      });
    }
  }

  async getTranslateData(req, res) {
    try {
      res.status(200).json({
        success: true,
        data: { translateData: translateData?.default || {} },
      });
    } catch (error) {
      console.log("error: ", error);
      res.status(200).send({
        success: false,
        alert: "error",
        message: `${error}`,
        error,
      });
    }
  }

  async getPaymentActivity(req, res) {
    try {
      const {
        params: { partner },
      } = req;
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 10;
      const skip = (page - 1) * pageSize;
      const { search } = req.query;
      let filter = {};
      if (partner) {
        filter = Object.assign(filter, { partnerCode: partner });
      }
      if (search) {
        const searchFields = ["orderCode"];

        const cond = searchFields.map((field) => {
          return {
            [field]: { $regex: _.escapeRegExp(search), $options: "i" },
          };
        });
        filter = { $or: cond };
      }

      const total = await PartnerPaymentActivity.find(filter).countDocuments();
      const totalPages = Math.ceil(total / pageSize);
      const paList = await PartnerPaymentActivity.find(filter)
        .sort({ createdAt: -1 })
        .select(
          "orderCode totalPrice createdAt currentPartnerBalance totalBalanceChanges"
        )
        .skip(skip)
        .limit(pageSize)
        .lean();

      const pagination = {
        total,
        page,
        pageSize,
        totalPage: totalPages,
      };

      res.status(200).json({
        success: true,
        data: {
          paymentActivityList: paList,
          pagination,
        },
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

export default SettingService;
