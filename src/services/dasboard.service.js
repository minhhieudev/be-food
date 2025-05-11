import Customer from "../models/customer.model.js";
import ServicePackage from "../models/service-package.model.js";
import instance1DgmeService from "./_1dgme.service.js";
import OngtrumService from "./ongtrum.service.js";
import CalculateDashboardService from "./calculate-dashboard.service.js";
import Order from "../models/order.model.js";

const colors = [
  "#8E44AD",
  "#17A589",
  "#F1C40F",
  "#ECF0F1",
  "#34495E",
  "#F0ECE2",
  "#E74C3C",
  "#85C1E9",
  "#45B39D",
  "#DC7633",
  "#EC7063",
];

class DashboardService {
  constructor() {
    this.calculateDashboardService = new CalculateDashboardService();
    this.getPlatform = this.getPlatform.bind(this);
    this.getPartner = this.getPartner.bind(this);
    this.getOrder = this.getOrder.bind(this);
    this.getServiceList = this.getServiceList.bind(this);
    this.getRechargeList = this.getRechargeList.bind(this);
    this.getOrderList = this.getOrderList.bind(this);
    this.getSystem = this.getSystem.bind(this);
  }

  async getPlatform(req, res) {
    try {
      const { dataType = "order", type = 0 } = req.query;

      const data = await this.calculateDashboardService.calculateStatisticPlatform(
        type,
        dataType
      );

      res.status(200).json({
        success: true,
        data: {
          colors,
          chart: data,
        },
      });
    } catch (error) {
      console.error("error: ", error);
      res.status(500).send({
        success: false,
        alert: "error",
        message: `${error}`,
        error,
      });
    }
  }

  async getPartner(req, res) {
    try {
      const { type = 0, dataType = "order" } = req.query;

      const data = await this.calculateDashboardService.calculateGetPartner(
        type,
        dataType
      );

      res.status(200).json({
        success: true,
        data: {
          ...data,
          colors,
        },
      });
    } catch (error) {
      console.error("error: ", error);
      res.status(500).send({
        success: false,
        alert: "error",
        message: `${error}`,
        error,
      });
    }
  }

  async getSystem(req, res) {
    try {
      const ongtrumService = new OngtrumService();
      const [balanceOngtrum, balance1DG, totalCustomer, totalService] = await Promise.all([
        ongtrumService.getBalance(),
        instance1DgmeService.getBalance(),
        Customer.countDocuments(),
        ServicePackage.countDocuments(),
      ]);

      const customerWallet = await this.calculateDashboardService.calculateCustomerWallet();

      res.status(200).json({
        success: true,
        data: {
          totalCustomer,
          totalService,
          balance1DG,
          balanceOngtrum,
          customerWallet,
        },
      });
    } catch (error) {
      console.error("error: ", error);
      res.status(500).send({
        success: false,
        alert: "error",
        message: `${error}`,
        error,
      });
    }
  }

  async getOrder(req, res) {
    try {
      const { type = 0, dataType = "order,money,revenue" } = req.query;
      if (type > 2) {
        throw new Error("Invalid type");
      }

      const data = await this.calculateDashboardService.calculateStatisticOrder(
        type,
        dataType
      );

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      console.error("error: ", error);
      res.status(500).send({
        success: false,
        alert: "error",
        message: `${error}`,
        error,
      });
    }
  }

  async getServiceList(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 10;
      const { search, type = 0 } = req.query;

      const servicePackages = await this.calculateDashboardService.calculateServiceList(type);

      let filteredResults = servicePackages;
      if (search) {
        const lowerCaseQuery = search.toLowerCase();
        filteredResults = filteredResults.filter((item) =>
          item.name.toLowerCase().includes(lowerCaseQuery)
        );
      }

      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const servicePackageResponse = filteredResults.slice(startIndex, endIndex);
      const total = filteredResults.length;
      const totalPages = Math.ceil(total / pageSize);

      res.status(200).json({
        success: true,
        data: {
          pagination: {
            page,
            pageSize,
            total,
            totalPages,
          },
          servicePackages: servicePackageResponse,
        },
      });
    } catch (error) {
      console.error("error: ", error);
      res.status(500).send({
        success: false,
        alert: "error",
        message: `${error}`,
        error,
      });
    }
  }

  async getRechargeList(req, res) {
    try {
      const { type = 0 } = req.query;

      const rechargeList = await this.calculateDashboardService.calculateGetRechargeList(type);

      res.status(200).json({
        success: true,
        data: rechargeList,
      });
    } catch (error) {
      console.error("error: ", error);
      res.status(500).send({
        success: false,
        alert: "error",
        message: `${error}`,
        error,
      });
    }
  }

  async getOrderList(req, res) {
    try {
      const { type = 0 } = req.query;

      const data = await this.calculateDashboardService.calculateGetOrderList(type);

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      console.error("error: ", error);
      res.status(500).send({
        success: false,
        alert: "error",
        message: `${error}`,
        error,
      });
    }
  }
}

export default DashboardService;
