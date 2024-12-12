import _ from "lodash";
import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import PaymentActivity from "../models/payment-activity.model.js";
import ServicePackage from "../models/service-package.model.js";
import Wallet from "../models/wallet.model.js";
import { getPartnerConditions } from "./service-package.service.js";
import redisServiceIntance from "./redis.service.js";
import translations from "../common/translate-mess-response.json" assert { type: "json" };

class CustomerService {
  async clear(req, res) {
    try {
      mongoose.connection.dropCollection("customers");
      mongoose.connection.dropCollection("service-packages");
    } catch (error) {}
  }

  async restore(req, res) {
    try {
      const { id } = req.params;
      const lang = req.header.lang;
      const updateData = {
        reasonBlock: "",
        status: "active",
      };

      const customer = await Customer.findByIdAndUpdate(id, updateData);
      if (!customer) {
        throw translations.idNotExist[lang];
      }

      // Update redis
      const redisData = redisServiceIntance.get(`cus-${customer._id.toString()}`);
      if (redisData){
        await redisServiceIntance.set(`cus-${customer._id.toString()}`, {
          _id: customer.id,
          ...redisData,
          status: "active",
        });
      }

      res.status(200).send({
        success: true,
        message: translations.recoveryUserSuccess[lang],
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

  async block(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const lang = req.header.lang;

      const updateData = {
        reasonBlock: data.reasonBlock,
        status: "blocked",
      };

      const customer = await Customer.findById(id);

      if (!customer) {
        throw translations.idNotExist[lang];
      }
      await customer.updateOne(updateData);

      // Update redis
      const redisData = redisServiceIntance.get(`cus-${customer._id.toString()}`);
      if (redisData) {
        await redisService.set(`cus-${customer._id.toString()}`, {
          _id: customer.id,
          ...redisData,
          status: "blocked",
        });
      }

      res.status(200).send({
        success: true,
        message: translations.blockUserSuccess[lang],
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

  async create(req, res) {
    try {
      throw "_";
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

  async update(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const lang = req.header.lang;

      const updateData = {
        info: data.info,
        contact: data.contact,
        status: data.status,
        currency: data.currency,
      };

      const customer = await Customer.findByIdAndUpdate(id, updateData);
      if (!customer) {
        throw translations.idNotExist[lang];
      }

      res.status(200).send({
        success: true,
        message: translations.updateSuccess[lang],
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

  async getById(req, res) {
    try {
      const { id } = req.params;
      const lang = req.header.lang;
      const select = "-password -__v -createdAt -updatedAt";
      const customer = await Customer.findById(id).select(select).lean();
      if (!customer) throw translations.idNotExist[lang];
      const wallet = await Wallet.findOne({
        customer: customer._id,
      });
      const paymentActivities = await PaymentActivity.find({
        customer: id,
        wallet: wallet._id,
      });
      res.status(200).send({
        success: true,
        data: {
          ...customer,
          balance: wallet.balance,
          paymentActivities,
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

  async delete(req, res) {
    try {
      const { id } = req.params;
      const lang = req.header.lang;
      const customer = Customer.findById(id).lean();
      if (!customer) throw translations.idNotExist[lang];

      await Customer.findByIdAndUpdate(id, {
        status: "delete",
      });

      res.status(200).send({
        success: true,
        message: translations.deleteSuccess[lang],
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

  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 10;
      const skip = (page - 1) * pageSize;
      const { email = "" } = req.query;

      const filter = {
        email: { $regex: _.escapeRegExp(email), $options: "i" },
      };

      const total = await Customer.countDocuments(filter);

      const totalPages = Math.ceil(total / pageSize);

      const select = "-password -__v -createdAt -updatedAt";

      const tempCustomers = await Customer.find(filter)
        .select(select)
        .lean()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize);

      const pagination = {
        total,
        page,
        pageSize,
        totalPage: totalPages,
      };

      const customers = await Promise.all(
        tempCustomers.map(async (customer) => {
          const wallet = await Wallet.findOne({
            customer: customer._id,
          });
          return {
            ...customer,
            balance: wallet?.balance,
          };
        })
      );

      res.status(200).json({
        success: true,
        data: {
          pagination,
          customers,
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

  async updateByCustomer(req, res) {
    try {
      const user = req.user;
      const lang = req.header.lang;
      const data = req.body;

      const updateData = {
        info: data.info,
        contact: data.contact,
        currency: data.currency,
      };

      const customer = await Customer.findByIdAndUpdate(user._id, updateData, {
        runValidators: true,
        new: true,
      });

      if (!customer) {
        throw translations.idNotExist[lang];
      }

      res.status(200).send({
        success: true,
        message: translations.updateSuccess[lang],
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

  async getMenuService(req, res) {
    try {
      const platform = [];
      const partnerCodeArr = await getPartnerConditions();
      // điều kiện filter
      const conditions = {
        status: true,
        partnerCode: { $nin: partnerCodeArr },
      };

      const servicePackage = await ServicePackage.find(conditions)
        .populate({ path: "serviceGroup", select: "name serviceCode" })
        .lean();

      servicePackage.map((oneSP) => {
        if (platform.indexOf(oneSP.scriptGroupCode) < 0) {
          platform.push(oneSP.scriptGroupCode);
        }
      });

      const menuServices = platform.map((onePlatform) => {
        let tempServiceGroup = _.map(
          _.groupBy(
            servicePackage
              .filter((x) => {
                return x.scriptGroupCode === onePlatform;
              })
              .map((x) => {
                return {
                  name: x?.serviceGroup?.name,
                  _id: x?.serviceGroup?._id.toString(),
                };
              }),
            "_id"
          ),
          (group) => _.merge({}, ...group)
        );

        const serviceGroups = tempServiceGroup.map((x) => {
          const temp = servicePackage.filter((y) => {
            return (
              y?.scriptGroupCode === onePlatform &&
              y?.serviceGroup?._id.toString() === x?._id
            );
          });

          return {
            ...x,
            services: temp.map((z) => {
              return {
                _id: z._id,
                name: z.name,
                serviceCode: z.serviceCode,
              };
            }),
          };
        });

        return {
          platform: onePlatform,
          name: onePlatform.charAt(0).toUpperCase() + onePlatform.slice(1),
          serviceGroups,
        };
      });

      res.status(200).send({
        success: true,
        data: {
          menuServices,
        },
      });
    } catch (error) {
      console.error("error: ", error);
      return res.status(200).send({
        success: false,
        alert: "error",
        message: `${error}`,
        error,
      });
    }
  }

  async getBalance(req, res) {
    try {
      const { _id } = req.user;

      const wallet = await Wallet.findOne({ customer: _id })
        .select("balance")
        .lean();

      res.status(200).send({
        success: true,
        data: { wallet },
      });
    } catch (error) {
      console.error("error: ", error);
      return res.status(200).send({
        success: false,
        alert: "error",
        message: `${error}`,
        error,
      });
    }
  }
}
export default CustomerService;
