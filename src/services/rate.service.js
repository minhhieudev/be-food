import axios from "axios";
import * as rateData from "../common/rate.json" assert { type: "json" };
import Customer from "../models/customer.model.js";
import Rate from "../models/rate.model.js";
class RateService {
  constructor() {
    this.initRate();
  }

  async initRate() {
    try {
      const data = rateData.default;
      const keys = Object.keys(data);

      const newRateData = await Promise.all(
        keys.map(async (key) => {
          const rateData = await Rate.findOne({ code: key }).lean();
          if (!rateData) {
            const newData = await Rate.create({
              code: key,
              exchangeRate: data[key],
            });
          }
        })
      );
    } catch (error) {
      console.error("Error initializing server:", error);
    }
  }

  async gets(req, res) {
    try {
      const rates = await Rate.find({}).select("-__v").lean();

      res.status(200).json({
        success: true,
        data: rates,
      });
    } catch (error) {
      console.error("Error initializing rate:", error);
    }
  }

  async getDetail(req, res) {
    try {
      const user = req.user;
      const checkCustomer = await Customer.findOne({ _id: user._id }).lean();
      const rate = await Rate.findOne({code: checkCustomer.currency}).select("code exchangeRate").lean();

      res.status(200).json({
        success: true,
        data: rate,
      });
    } catch (error) {
      console.error("Error initializing rate:", error);
    }
  }

  async updateRate() {
    try {
      const options = {
        method: "GET",
        url: "https://exchange-rate-api1.p.rapidapi.com/latest",
        params: { base: "VND" },
        headers: {
          "X-RapidAPI-Key":
            "d698a07880mshd241a2ac57d8639p1c6060jsn9f08f65f68a9",
          "X-RapidAPI-Host": "exchange-rate-api1.p.rapidapi.com",
        },
      };

      const response = await axios.request(options);
      const codes = Object.keys(response.data.rates);
      codes.map(async (key) => {
        await Rate.findOneAndUpdate(
          { code: key },
          { exchangeRate: response.data.rates[key] },
          { runValidators: true, upsert: true }
        );
      });
    } catch (error) {
      console.error(error);
    }
  }
}

export default RateService;
