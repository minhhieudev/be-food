import axios from "axios";
import Setting from "../models/setting.model.js";

class OngtrumService {
  constructor() {
    this.getAllServices = this.getAllServices.bind(this);
    this.createOrder = this.createOrder.bind(this);
    this.getBalance = this.getBalance.bind(this);
  }

  async request(data, url = undefined) {
    try {
      const APIKeyStore = await Setting.findOne({
        key: "PARTNER_ongtrum_API_KEY",
      }).lean();
  
      // kMe5L14TB9zy40KzdnazDkd9fOHaxqIeU3jjouljz3PzRfLEd0o9aXyHdxwLWkuYwF9EXFdvpebXvUWz
      const APIKey = APIKeyStore?.value || "";
      const requestConfig = {
        method: "POST",
        url: url || "https://ongtrum.pro/api/v2/server-smm.aspx",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: {
          key: APIKey,
          api_token: APIKey,
          ...data,
        },
      }
      console.log(requestConfig);
      const response = await axios.request(requestConfig);
   
      if (response.data?.error) {
        throw `ERROR ONGTRUM: ${response.data.error}`;
      }

      return response.data;
    } catch (error) {
      console.log('error call api ongtrum', error);
      throw error
    }
  }

  async getAllServices(filter) {
    const params = {
      action: "services",
    };
    const allServices = await this.request(params);

    if (!allServices?.length) throw "Lỗi kết nối ongtrum.org";

    let mapServices = allServices.map((service) => {
      const scriptCode = `ongtrum_${service.service}`;
      let name = service.name;
      const description = name.match(/- -([\s\S]+)/)?.[1] || '';
      const scriptGroupCode = service.category.split(".")[0];
      const partnerServiceID = service.service;
      const rate = service.rate;
      const rateVNDPerRequest = rate / 1000;
      const serviceCode = service.category.replaceAll(".", "_").trim();

      if (rateVNDPerRequest) {
        name += ` - ${rateVNDPerRequest}đ`;
      }

      return {
        description: description.trim(),
        name,
        scriptCode,
        scriptGroupCode,
        serviceCode,
        partnerServiceID,
        minValue: service.min,
        maxValue: service.max,
        price: rateVNDPerRequest,
      };
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

  async createOrder(serviceId, link, quantity) {
    const params = {
      action: "add",
      service: serviceId,
      link,
      quantity,
    };
    return await this.request(params);
  }

  async getOrder(orderId) {
    const params = {
      action: "status",
      order: orderId,
    };
    
    return await this.request(params);
  }

  async getBalance() {
    try {
      const params = {
        action: "balance",
      };
      const balanceResponse = await this.request(params); 
      return Math.floor(balanceResponse.balance);
    } catch (error) {
      console.error("error while get ongtrum balance: ", error);
      return 0;
    }
  
  }
}

export default OngtrumService;
