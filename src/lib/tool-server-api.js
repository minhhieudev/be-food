import axios from "axios";
import config from "../configs/config.js";
class ToolServerAdapter {
  async request(options) {
    const BASE_URL = config.serverTool.url;
    let configs = {
      method: options.method || "GET",
      url: BASE_URL + options.url,
      params: options.params,
      data: options.data,
      headers: {
        Authorization: "Bearer tool-service-test-auth",
      },
    };
    return await axios(configs);
  }

  createOrder(order) {
    /*  res = { success: true, serviceID: 23456 } */
    return this.request({
      url: "tool-service-api/service",
      method: "POST",
      data: {
        scriptCode: order.servicePackage.scriptCode,
        customerEnteredValues: order.servicePackage.customerEnteredValues,
        qty: order.servicePackage.qty,
        order_id: order._id,
        comments: order.servicePackage.comments || []
      },
    });
  }
  getActiveScripts() {
    /*  res = { success: true, scripts: [ 
      { scriptCode: 'like_facebook', scriptGroupCode: 'facebook' },
      { scriptCode: 'view_youtube', scriptGroupCode: 'youtube' }
    ]} */
    return this.request({
      url: "tool-service-api/active-scripts",
      method: "GET",
    });
  }
  async getOrderStatus(serviceId) {
    try {
      const response = await this.request({
        url: `tool-service-api/service/${serviceId}`
      })
      return response
    } catch (error) {
      return null
    }
  }
}
export default ToolServerAdapter;
