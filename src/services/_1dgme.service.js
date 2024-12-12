import axios from "axios";
import config from "../configs/config.js";
import Setting from "../models/setting.model.js";
import { getVNDRateFromUSD } from "../utils/function.js";

class _1DgmeService {
  constructor() {
    this.APIKey = config["1dgme"].APIKey;
  }

  async request(data) {
    const defaultKey = this.APIKey;
    const APIKeyStore = await Setting.findOne({
      key: "PARTNER_1dg.me_API_KEY",
    }).lean();
    const APIKey = APIKeyStore?.value || defaultKey || "";
    const requestConfig = {
      method: "POST",
      url: "https://1dg.me/api/v2",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: {
        key: APIKey,
        ...data,
      },
    };
    console.log(requestConfig);
    const response = await axios.request(requestConfig);
    if (response.data?.error) {
      throw `ERROR 1DG.ME: ${response.data.error}`;
    }

    return response.data;
  }

  /*
    {
        "balance": "68.6868",
        "currency": "USD"
    }
    */
  async getBalance() {
    try {
      const params = {
        action: "balance",
      };
      const balanceResponse = await this.request(params);
      const VNDRate = await getVNDRateFromUSD();

      return Math.floor(balanceResponse.balance * VNDRate);
    } catch (error) {
      console.error("error while get 1dg.me balance: ", error);
      return 0;
    }
  }

  async getAllServices(filter) {
    const params = {
      action: "services",
    };
    const allServices = await this.request(params);
    const VNDRate = await getVNDRateFromUSD();

    let mapServices = allServices
      .map((service) => {
        const scriptCode = `1dg.me_${service.service}`;
        let name = service.name;
        const scriptGroupCode = service.platform.toLowerCase();
        const partnerServiceID = service.service;
        const rate = service.rate;
        const rateVNDPerRequest = Math.ceil((rate * VNDRate) / 1000);

        if (rateVNDPerRequest) {
          name += ` - ${rateVNDPerRequest}đ`;
        }

        return {
          name,
          scriptCode,
          scriptGroupCode,
          partnerServiceID,
          minValue: service.min,
          maxValue: service.max,
          price: rateVNDPerRequest,
        };
      })
      .filter((service) => {
        const acceptScriptGroupCodes = [
          "facebook",
          "youtube",
          "google",
          "tiktok",
        ];
        return acceptScriptGroupCodes.includes(service.scriptGroupCode);
      });

    if (filter?.name) {
      const regex = new RegExp(filter.name, "i");
      mapServices = mapServices.filter((service) => regex.test(service.name));
    }
    if (filter?.scriptCode) {
      mapServices = mapServices.filter(
        (service) => service.scriptCode === filter.scriptCode
      );
    }
    if (filter?.scriptGroupCode) {
      mapServices = mapServices.filter(
        (service) => service.scriptGroupCode === filter.scriptGroupCode
      );
    }
    if (filter?.partnerServiceID) {
      mapServices = mapServices.filter(
        (service) => service.partnerServiceID === filter.partnerServiceID
      );
    }

    return mapServices;
  }

  /*
    {
        "order": 99999
    }

    error => {
        "error": "Min/Max order is: 1000/100000",
        "language": "Giới hạn đặt hàng: 1000/100000"
    }
  */
  async createOrder(serviceId, link, quantity) {
    const params = {
      action: "add",
      service: serviceId,
      link,
      quantity,
    };

    return await this.request(params);
  }

  /*
    {
        "charge": "2.5",
        "start_count": "168",
        "status": "Completed",
        "remains": "-2"
    }
  */
  async getOrder(orderId) {
    try {
      const params = {
        action: "status",
        order: orderId,
      };
  
      return await this.request(params);
    } catch (error) {
      return null;
    }
  }
}

const instance = new _1DgmeService();

export default instance;
