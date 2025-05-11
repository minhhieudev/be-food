import Order from "../models/order.model.js";
import MealModel from "../models/meal.model.js";
import ServicePackage from "../models/service-package.model.js";
import {
  generateCode,
  mapStatus1Dgme,
  mapStatusServerTool,
  mapStatusOngtrum,
} from "../utils/function.js";
import _ from "lodash";
import Wallet from "../models/wallet.model.js";
import PaymentActivity from "../models/payment-activity.model.js";
import _1DgmeService from "./_1dgme.service.js";
import ToolServerAdapter from "../lib/tool-server-api.js";
import moment from "moment";
import OngtrumService from "./ongtrum.service.js";
import ServicePackageService from "./service-package.service.js";
import PartnerOrderQueue from "../models/partner-order-queue.model.js";
import PartnerPaymentActivity from "../models/partner-payment-activity.model.js";
import translations from "../common/translate-mess-response.json" assert { type: "json" };
import Customer from "../models/customer.model.js";

class OrderService {
  constructor() {
    this.getStatusOrders = this.getStatusOrders.bind(this);
    this.checkPartnerOrderQueue = this.checkPartnerOrderQueue.bind(this);
  }

  async getSummary(req, res) {
    const { servicePackageID } = req.body;
    const servicePackageData = await ServicePackage.findOne({
      _id: servicePackageID,
    }, 'price').lean()

    res.status(200).send({
      success: true,
      summary: {
        subtotal: servicePackageData?.price || 0, 
        discount: 0,
        shippingAmount: 0,
        grandTotal: servicePackageData?.price || 0,
      }
    });
  }

  async create(req, res) {
    try {
      const data = req.body;
      const lang = req.header.lang;
      const orderService = new OrderService();

      const order = await orderService.createOrderMethod(data, req.user, lang);


      res.status(200).send({
        success: true,
        message: translations.orderSuccess[lang],
        orderID: order._id,
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

  async createManyOrder(req, res) {
    try {
      const { list } = req.body;
      const user = req.user;
      const lang = req.header.lang;
      await Promise.all(
        list.map(async (data) => {
          const orderService = new OrderService();
          await orderService.createOrderMethod(data, user, lang);
        })
      );

      res.status(200).send({
        success: true,
        message: translations.orderSuccess[lang],
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

  async getOneByCustomer(req, res) {
    try {
      const { id } = req.params;
      const user = req.user;
      const lang = req.header.lang;
      const order = await Order.findOne({ _id: id, customer: user._id })
        .select(
          "-updatedAt -__v -servicePackage.customerEnteredValues -servicePackage._id -code -servicePackage.intervalTime -servicePackage.cost"
        )
        .populate({ path: "customer", select: "info" })
        .lean();

      if (!order) throw translations.orderNotExist[lang];

      res.status(200).send({
        success: true,
        data: { order },
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
  async getOrderCustomer(req, res) { 
    console.log('Fetching customer orders...');

    try {
        const user = req.user; // Người dùng hiện tại
        const lang = req.header.lang;
        // Lấy ngôn ngữ từ header

        // Tìm tất cả đơn hàng của khách hàng, sắp xếp từ mới nhất đến cũ nhất
        const orders = await Order.find({ customer: user._id })
            .sort({ createdAt: -1 })
            .select("code servicePackage.name servicePackage.mainImage servicePackage._id totalPrice createdAt")
            .lean(); // Chuyển sang object thuần

        // Nếu không có đơn hàng, ném lỗi
        if (!orders || orders.length === 0) throw translations.orderNotExist[lang];

        console.log('Orders:', orders);

        // Trả về danh sách đơn hàng
        res.status(200).send({
            success: true,
            data: orders,
        });
    } catch (error) {
        console.log("Error: ", error);
        return res.status(200).send({
            success: false,
            alert: "error",
            message: `${error}`,
            error,
        });
    }
}


  async getsByCustomer(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 20;
      const user = req.user;
      const skip = (page - 1) * pageSize;
      const { search, status, scriptGroupCode, startDay, endDay } = req.query;
      let filter = { customer: user._id };

      if (search) {
        const searchFields = ["code", "name", "scriptCode"];

        const cond = await Promise.all(
          searchFields.map((field) => {
            return {
              [`servicePackage.${field}`]: {
                $regex: _.escapeRegExp(search),
                $options: "i",
              },
            };
          })
        );

        if (cond.length > 0) filter = Object.assign(filter, { $or: cond });
      }

      if (status) {
        Object.assign(filter, { status });
      }

      if (scriptGroupCode) {
        const parseScriptGroupCode = JSON.parse(scriptGroupCode);
        if (
          parseScriptGroupCode &&
          _.isArray(parseScriptGroupCode) &&
          parseScriptGroupCode.length
        )
          Object.assign(filter, {
            ["servicePackage.scriptGroupCode"]: { $in: parseScriptGroupCode },
          });
      }

      if (startDay && endDay) {
        Object.assign(filter, {
          createdAt: {
            $gte: moment(startDay).startOf("day").toDate(),
            $lte: moment(endDay).endOf("day").toDate(),
          },
        });
      }

      const total = await Order.countDocuments(filter);
      const totalPages = Math.ceil(total / pageSize);

      const orders = await Order.find(filter)
        .lean()
        .sort({ createdAt: -1 })
        .skip(skip)
        .select("-customer -servicePackage.cost")
        .limit(pageSize);

      const mapOrders = await Promise.all(
        orders.map(async (order) => {
          if (!order.servicePackage.customerEnteredValues?.length) {
            return order;
          }
          const serviceCode = order.servicePackage.code;
          const service = await ServicePackage.findOne({
            code: serviceCode,
          }).lean();
          if (service) {
            const attributes = service.attributes || [];
            const newCustomerEnteredValues =
              order.servicePackage.customerEnteredValues.map((item) => {
                const attribute = attributes.find(
                  (attr) => attr.code === item.attributeCode
                );
                if (attribute) {
                  return {
                    ...item,
                    label: attribute.label,
                  };
                } else {
                  return item;
                }
              });
            order.servicePackage.customerEnteredValues =
              newCustomerEnteredValues;
          }
          return order;
        })
      );

      // search by ID, nen tang, ten dich vu
      const pagination = {
        total,
        page,
        pageSize,
        totalPage: totalPages,
      };

      res.status(200).json({
        success: true,
        data: { pagination, orders: mapOrders },
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

  async getStatusOrders(req, res) {
    try {
      const { orderIds } = req.body;
      const orders = await Order.find({ _id: { $in: orderIds } })
        .lean()
        .sort({ createdAt: -1 })
        .select("-servicePackage.cost");

      const bulkOps = [];

      const toolService = new ToolServerAdapter();

      const ordersResponse = await Promise.all(
        orders.map(async (order) => {
          let orderReturn = _.cloneDeep(order);
          const status = order.status;
          if (status === "running") {
            switch (order?.servicePackage?.partnerCode) {
              case "1dg.me": {
                if (!order?.servicePackage?.partnerOrderID) break;

                const orderResponse = await _1DgmeService.getOrder(
                  order.servicePackage.partnerOrderID
                );

                orderReturn.servicePackage.startAt = Number(
                  orderResponse?.start_count || 0
                );
                orderReturn.servicePackage.remaining = Number(
                  orderResponse?.remains || 0
                );
                orderReturn.status = mapStatus1Dgme(orderResponse?.status);
                if (orderReturn.status !== "running") {
                  bulkOps.push({
                    updateOne: {
                      filter: { _id: order._id },
                      update: { $set: { status: orderReturn.status } },
                    },
                  });

                  // Refund: TODO
                }
                break;
              }
              case "ongtrum": {
                if (!order?.servicePackage?.partnerOrderID) break;
                const ongtrumService = new OngtrumService();
                const orderResponse = await ongtrumService.getOrder(
                  order.servicePackage.partnerOrderID
                );

                orderReturn.servicePackage.startAt = Number(
                  orderResponse?.start_count || 0
                );
                orderReturn.servicePackage.remaining = Number(
                  orderResponse?.remains || 0
                );

                orderReturn.status = mapStatusOngtrum(orderResponse?.status);
                if (orderReturn.status !== "running") {
                  bulkOps.push({
                    updateOne: {
                      filter: { _id: order._id },
                      update: { $set: { status: orderReturn.status } },
                    },
                  });

                  // refund
                  if (orderReturn.status === "cancelled") {
                    const currentPartnerBalance =
                      (await ongtrumService.getBalance()) || 0;

                    const partnerPaymentActivityData = {
                      orderID: order._id,
                      orderCode: order.code, // Thêm field phục vụ cho filter trong admin
                      partnerServiceID: order.servicePackage.partnerOrderID,
                      partnerCode: order.servicePackage.partnerCode,
                      totalPrice: order.totalPrice,
                      currentPartnerBalance,
                      totalBalanceChanges: orderResponse.refund,
                      createdAt: new Date(),
                      type: "refund",
                      note: orderResponse.note,
                    };

                    await Promise.all([
                      this.refundOrder(order, orderResponse.note),
                      PartnerPaymentActivity.create(partnerPaymentActivityData),
                    ]);
                  }
                }

                break;
              }
              default: {
                const orderResponse = await toolService.getOrderStatus(
                  order.servicePackage.partnerOrderID
                );
                orderReturn.servicePackage.startAt = Number(
                  orderResponse?.data?.service?.start_count || 0
                );
                orderReturn.servicePackage.remaining = Number(
                  orderResponse?.data?.service?.remains || 0
                );
                orderReturn.status = mapStatusServerTool(
                  orderResponse?.data?.service
                );
                if (orderReturn.status !== "running") {
                  bulkOps.push({
                    updateOne: {
                      filter: { _id: order._id },
                      update: { $set: { status: orderReturn.status } },
                    },
                  });
                }
                break;
              }
            }
          }
          return orderReturn;
        })
      );

      if (bulkOps.length) {
        await Order.bulkWrite(bulkOps);
      }

      res.status(200).json({
        success: true,
        data: { orders: ordersResponse },
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

  async createOrderMethod(data, user, lang) {
    const { servicePackageID, iTags, favoriteIngredients, estimatedTime1, estimatedTime2, estimatedDate } = data
    const servicePackageService = new ServicePackageService();

    const  CustomerInfo = await Customer.findOne({ _id: user._id });

    console.log('iTagsiTagsiTagsiTagsiTagsiTagsiTagsiTagsiTagsiTagsiTags:',iTags);
    if (!CustomerInfo?.contact?.address || !CustomerInfo?.contact?.phoneNumber || !CustomerInfo?.info?.firstName || !CustomerInfo?.info?.lastName) {
      throw 'Vui lòng cập nhật thông tin trước !';
    }

    const addressDelivery = CustomerInfo.contact.address
    const phoneNumber = CustomerInfo.contact.phoneNumber
    const customerName = CustomerInfo.info.firstName + CustomerInfo.info.lastName

    const servicePackageData = await ServicePackage.findOne({
      _id: servicePackageID,
      status: true,
    })
      .populate({
        path: "serviceGroup",
        select: "name",
      })
      .populate({ path: "subscriptionID" })
      .select("-__v -createdAt -updatedAt")
      .lean();


    if (!servicePackageData) {
      throw translations.serviceNotExist[lang];
    }

    if (!servicePackageData.status) {
      throw translations.serviceDiscontinued[lang];
    }

    if (servicePackageData.minValue && servicePackageData.minValue > data.qty) {
      throw `${translations.quantityMustLarger[lang]} ${servicePackageData.minValue}`;
    }
    if (servicePackageData.maxValue && servicePackageData.maxValue < data.qty) {
      throw `${translations.quantityMustSmaller[lang]} ${servicePackageData.maxValue}`;
    }

    const attributesCode = _.map(data.customerEnteredValues || [], "attributeCode");

    (servicePackageData?.attributes || []).map((attribute) => {
      if (attribute.required && !attributesCode.includes(attribute.code)) {
        throw `${attribute.label} ${translations.notBlank[lang]}`;
      }

      if (attribute.required && attributesCode.includes(attribute.code)) {
        const newData = data.customerEnteredValues.find(
          (enteredValue) => enteredValue.attributeCode == attribute.code
        );
        if (!newData?.enteredValue) {
          throw `${attribute.label} ${translations.notBlank[lang]}`;
        }
      }
    });

    // Calculate price by quantity
    let price = servicePackageData.price;
    const qty = data.qty || 1;

    // validate qty?

    let partnerServiceID = servicePackageData.partnerServiceID;

    if (
      servicePackageData.customPrice?.length &&
      data.customerEnteredValues?.length
    ) {
      price = await servicePackageService.calculatePriceCustom(
        data.customerEnteredValues,
        servicePackageData
      );
    }

    // Check so du trong tai khoan
    const totalPrice = qty * price;
    const wallet = await Wallet.findOne({ customer: user._id });

    if (wallet.balance < totalPrice) {
      throw translations.balanceNotEnough[lang];
    }

    let intervalTime = 0;
    if (data.intervalTime) {
      intervalTime = data.intervalTime * 60 * 60 * 1000;
    }

    const newServicePackageOrder = {
      _id: servicePackageData._id,
      name: servicePackageData.name,
      code: servicePackageData.code,
      description: servicePackageData.description,
      orderSuccessDescription: servicePackageData.orderSuccessDescription,
      scriptCode: servicePackageData.scriptCode,
      scriptGroupCode: servicePackageData.scriptGroupCode,
      serviceValue: servicePackageData.serviceValue,
      unit: servicePackageData.unit,
      price,
      qty,
      intervalTime,
      mainImage: servicePackageData.mainImage,
      serviceGroup: {
        _id: servicePackageData?.serviceGroup?._id,
        name: servicePackageData?.serviceGroup?.name,
      },
      customerEnteredValues: data.customerEnteredValues,
      partnerOrderID: "",
      partnerCode: servicePackageData.partnerCode,
      partnerServiceID,
      comments: data.comments,
      serviceCode: servicePackageData.serviceCode,
      cost: qty * (servicePackageData.cost || 0),
      subscriptionID: servicePackageData.subscriptionID || null,
      iTags: iTags || [],
    };

    const newOrderCode = generateCode("OD");

    const newOrderData = {
      code: newOrderCode,
      servicePackage: newServicePackageOrder,
      customer: user._id,
      status: "running",
      totalPrice,
      addressDelivery,
      phoneNumber,
      iTags: iTags || [],
      customerName
    };

    const order = await Order.create(newOrderData)
    if (servicePackageData.subscriptionID) {
      // create meals
      let totalDate = Number(servicePackageData.subscriptionID.totalDate)
      if (totalDate) {
        let dates = []
        let mealDate = moment(estimatedDate).subtract(1, 'days')
        while (totalDate > 0) {
          mealDate = moment(mealDate).add(1, 'days')
          dates.push(mealDate)
          totalDate -= 1
        }
        async function createMealForDate (date) {
          const mealData = {
            orderID: order._id,
            customerID: user._id,
            estimatedDate: date,
            estimatedTime: '',
            image:'',
            status: 'pending',
            favoriteIngredients: favoriteIngredients || [],
          }
          if (estimatedTime2) {
            await MealModel.create({ ...mealData, estimatedTime: estimatedTime2 })
          }
          if (estimatedTime1) {
            await MealModel.create({ ...mealData, estimatedTime: estimatedTime1 })
          }
        }
  
        await Promise.all(dates.map(date => createMealForDate(date))) 
      }
    }
    
    let description = "";
    const newBalance = wallet.balance - totalPrice;
    const transactionCode = generateCode("");
    if (partnerServiceID) {
      description = `${translations.customerOrderService[lang]}:  "${servicePackageData.name}_${partnerServiceID}", ${translations.servicePackageCode[lang]}: ${servicePackageData.code}`;
    } else {
      description = `${translations.customerOrderService[lang]}:  "${servicePackageData.name}", ${translations.servicePackageCode[lang]}: ${servicePackageData.code}`;
    }

    // Update wallet
    const newPaymentActivityData = {
      transaction: transactionCode,
      customer: user._id,
      type: "order",
      amount: totalPrice,
      oldBalance: wallet.balance,
      newBalance,
      wallet: wallet._id,
      status: "success",
      description,
    };

    await Promise.all([
      wallet.updateOne({ balance: newBalance }), // Cập nhật ví với số dư mới
      PaymentActivity.create(newPaymentActivityData),
    ]);
    return order
  }

  // Admin
  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 20;
      const skip = (page - 1) * pageSize;
      const { code, customerID } = req.query;
      let filter = {};

      if (code) {
        // Filter by code of customer
        const searchFields = ["code"];
        const cond = searchFields.map((field) => {
          return { [field]: new RegExp(_.escapeRegExp(code), "i") };
        });

        filter = { $or: cond };
      }

      if (customerID) {
        filter["customer"] = customerID;
      }

      const total = await Order.countDocuments(filter);
      const totalPages = Math.ceil(total / pageSize);

      const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .select(
        "code servicePackage.name servicePackage.partnerCode customer status totalPrice addressDelivery phoneNumber createdAt"
      )
      .populate({ select: "info email", path: "customer" })
      .limit(pageSize)
      .lean();

      // search by ID, nen tang, ten dich vu
      const pagination = {
        total,
        page,
        pageSize,
        totalPage: totalPages,
      };
      console.log('HHHHHHHH:',orders)

      res.status(200).json({
        success: true,
        data: { pagination, orders },
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

  // Admin
  async getByID(req, res) {
    try {
      const { id } = req.params;
      const lang = req.header.lang;
      const order = await Order.findById(id)
        .select(
          "-servicePackage.description -servicePackage.orderSuccessDescription -updatedAt -__v"
        )
        .populate({ select: "info", path: "customer" })
        .lean();

      if (!order) throw translations.orderNotExist[lang];

      if (order.servicePackage.customerEnteredValues?.length) {
        const serviceCode = order.servicePackage.code;
        const service = await ServicePackage.findOne({
          code: serviceCode,
        }).lean();

        if (service) {
          const attributes = service.attributes || [];
          const newCustomerEnteredValues =
            order.servicePackage.customerEnteredValues.map((item) => {
              const attribute = attributes.find(
                (attr) => attr.code === item.attributeCode
              );
              if (attribute) {
                return {
                  ...item,
                  label: attribute.label,
                };
              } else {
                return item;
              }
            });
          order.servicePackage.customerEnteredValues = newCustomerEnteredValues;
        }
      }

      res.status(200).send({
        success: true,
        data: { order },
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

  // Thống kê tình trạng đơn hàng đã mua
  async statistic(req, res) {
    try {
      const user = req.user;
      const { status } = req.query;
      let filter = { customer: user._id };

      if (status) {
        // status:  running, completed, cancelled
        filter = Object.assign(filter, { status });
      }

      const orders = await Order.find(filter)
        .sort({ createdAt: -1 })
        .select("servicePackage.code customer status totalPrice createdAt")
        .lean();

      res.status(200).json({
        success: true,
        data: { orders },
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

  async getOrderStatus(req, res) {
    const { id } = req.params;
    const lang = req.header.lang;
    try {
      const order = await Order.findById(id).select("status").lean();

      if (!order) throw translations.orderNotExist[lang];
      res.status(200).send({
        success: true,
        data: { order },
      });
    } catch (error) {
      console.log("error: ", error);
      return res.status(200).send({
        success: false,
        alert: "error",
        message: translations.getOrderFailed[lang],
        error,
      });
    }
  }

  async refundOrder(order, note) {
    try {
      const customerID = order.customer;
      const lang = "vi";
      const wallet = await Wallet.findOne({
        customer: customerID,
      }).select("balance");

      const newBalance = wallet.balance + order.totalPrice;
      const transactionCode = generateCode("");
      const newPaymentActivityData = {
        transaction: transactionCode,
        customer: customerID,
        type: "order",
        amount: order.totalPrice,
        oldBalance: wallet.balance,
        newBalance,
        wallet: wallet._id,
        status: "cancelled",
        description: `${translations.refundOrder[lang]} ${order.code}, ${translations.note[lang]}: ${note}`,
      };

      await Promise.all([
        wallet.updateOne({
          balance: wallet.balance + order.totalPrice,
        }),
        PaymentActivity.create(newPaymentActivityData),
      ]);
    } catch (error) {
      console.log("error while refund: ", error);
    }
  }

  async checkPartnerOrderQueue() {
    try {
      const partnerCodes = ["1dg.me", "ongtrum"];
      const maxRetry = 5;

      await Promise.all(
        partnerCodes.map(async (partnerCode) => {
          const partnerOrderQueues = await PartnerOrderQueue.find({
            partnerCode,
            retry: { $lte: maxRetry },
          })
            .sort({ createdAt: 1 })
            .limit(10)
            .lean();
          // add sort
          if (partnerOrderQueues.length) {
            for (const partnerOrderQueue of partnerOrderQueues) {
              const {
                partnerServiceID,
                link,
                qty,
                orderID,
                partnerCode,
                _id,
                totalPrice,
              } = partnerOrderQueue;
              const order = await Order.findById(orderID);
              if (!order) continue;

              const deletePartnerOrderQueue = async () => {
                await PartnerOrderQueue.findByIdAndDelete(_id);
              };
              const handleErrorCreatePartnerOrder = async (messageError) => {
                if (partnerOrderQueue.retry >= maxRetry) {
                  // cancel order, refund
                  await Promise.all([
                    this.cancelOrder(orderID),
                    this.refundOrder(
                      order,
                      typeof messageError === "string"
                        ? messageError
                        : translations.createPartnerOrderFailed[lang]
                    ),
                    deletePartnerOrderQueue(),
                  ]);
                } else {
                  await PartnerOrderQueue.findByIdAndUpdate(_id, {
                    $inc: { retry: 1 },
                  });
                }
              };

              switch (partnerCode) {
                case "1dg.me": {
                  try {
                    const allService = await _1DgmeService.getAllServices();

                    const partnerService = allService.find(
                      (service) => service.partnerServiceID == partnerServiceID
                    );

                    const prePartnerBalance = await _1DgmeService.getBalance();
                    // create order
                    const order1DgmeResponse = await _1DgmeService.createOrder(
                      partnerServiceID,
                      link,
                      qty
                    );
                  
                    if (order1DgmeResponse.error) {
                      await handleErrorCreatePartnerOrder(
                        order1DgmeResponse.error
                      );
                    } else {
                      const currentPartnerBalance =
                        await _1DgmeService.getBalance();

                      const cost = qty * (partnerService?.price || 0);
                      // Update order
                      order.servicePackage = {
                        ...order.servicePackage,
                        partnerOrderID: order1DgmeResponse.order,
                        cost,
                      };
                      await order.save();

                      // create partner payment activity
                      await PartnerPaymentActivity.create({
                        orderID,
                        orderCode: order.code, // Thêm field phục vụ cho filter trong admin
                        partnerServiceID,
                        partnerCode,
                        totalPrice,
                        prePartnerBalance,
                        currentPartnerBalance,
                        totalBalanceChanges:
                          prePartnerBalance - currentPartnerBalance,
                        type: "pay",
                        note: "Tạo đơn hàng đối tác",
                      });

                      // delete queue
                      await deletePartnerOrderQueue();
                    }
                  } catch (error) {
                    console.log("error create partner order 1dg.me: ", error);
                    await handleErrorCreatePartnerOrder(error.message || error);
                  }
                  break;
                }

                case "ongtrum": {
                  const ongtrumService = new OngtrumService();
                  try {
                    const allService = await ongtrumService.getAllServices();
                    const partnerService = allService.find(
                      (service) => service.partnerServiceID == partnerServiceID
                    );
                    const prePartnerBalance = await ongtrumService.getBalance();
                    // create order
                    const orderOngtrumResponse =
                      await ongtrumService.createOrder(
                        partnerServiceID,
                        link,
                        qty
                      );

                    // check error
                    if (orderOngtrumResponse?.code !== 200) {
                      await handleErrorCreatePartnerOrder(
                        orderOngtrumResponse.error ||
                          orderOngtrumResponse.message
                      );
                    } else {
                      const currentPartnerBalance =
                        await ongtrumService.getBalance();
                      const cost = qty * (partnerService?.price || 0);

                      // Update order
                      order.servicePackage = {
                        ...order.servicePackage,
                        partnerOrderID: orderOngtrumResponse.order,
                        cost,
                      };
                      await order.save();

                      // create partner payment activity
                      await PartnerPaymentActivity.create({
                        orderID,
                        orderCode: order.code, // Thêm field phục vụ cho filter trong admin
                        partnerServiceID,
                        partnerCode,
                        totalPrice,
                        prePartnerBalance,
                        currentPartnerBalance,
                        totalBalanceChanges:
                          prePartnerBalance - currentPartnerBalance,
                        type: "pay",
                        note: "Tạo đơn hàng đối tác",
                      });

                      // delete queue
                      await deletePartnerOrderQueue();
                    }
                  } catch (error) {
                    console.log("error create partner order ongtrum: ", error);
                    await handleErrorCreatePartnerOrder(error.message || error);
                  }
                  break;
                }

                default:
                  break;
              }
            }
          }
        })
      );
    } catch (error) {
      console.log("error check partner order: ", error);
    }
  }

  async cancelOrder(orderId) {
    await Order.findByIdAndUpdate(orderId, { status: "cancelled" });
  }
}

export default OrderService;
