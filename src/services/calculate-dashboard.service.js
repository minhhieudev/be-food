import Order from "../models/order.model.js";
import Customer from "../models/customer.model.js";
import moment from "moment";
import PaymentActivity from "../models/payment-activity.model.js";
import Wallet from "../models/wallet.model.js";
import { rechageEnum } from "../common/recharge.enum.js";

const arrTypeLabel = ["24h", "7 Ngày", "12 Tháng"];
// điều kiện lọc
const cGetOrder24h = {
  createdAt: {
    $gte: new Date(new Date() - 24 * 60 * 60 * 1000),
  },
};

const cGetOrder7day = {
  createdAt: {
    $gte: new Date(new Date() - 7 * 24 * 60 * 60 * 1000),
  },
};

const cGetOrder12month = {
  createdAt: {
    $gte: new Date(new Date() - 12 * 30 * 24 * 60 * 60 * 1000),
  },
};

const condArr = [cGetOrder24h, cGetOrder7day, cGetOrder12month];

class CalculateDashboardService {
  constructor() {}
  // Cache service list
  async calculateServiceList(typeTime) {
    const tempSP = await Order.aggregate([
      {
        $match: { ...condArr[typeTime] },
      },
      {
        $group: {
          _id: "$servicePackage.code",
          name: { $first: "$servicePackage.name" },
          scriptGroupCode: { $first: "$servicePackage.scriptGroupCode" },
          totalCost: { $sum: "$servicePackage.cost" },
          totalPrice: { $sum: "$totalPrice" },
        },
      },
      {
        $addFields: {
          profit: { $subtract: ["$totalPrice", "$totalCost"] },
        },
      },
      { $sort: { profit: -1 } },
    ]);

    const servicePackages = await Promise.all(
      tempSP.map(async (x) => {
        const buy = async () => {
          try {
            return (
              await Order.aggregate([
                {
                  $match: {
                    "servicePackage.code": x?._id,
                    ...condArr[typeTime],
                  },
                },
                {
                  $group: {
                    _id: "$servicePackage.code",
                    totalOrders: { $sum: 1 },
                  },
                },
              ]).exec()
            )[0].totalOrders;
          } catch (error) {
            return 0;
          }
        };

        const cancel = async () => {
          try {
            return (
              await Order.aggregate([
                {
                  $match: {
                    status: "cancelled",
                    "servicePackage.code": x?._id,
                    ...condArr[typeTime],
                  },
                },
                {
                  $group: {
                    _id: "$servicePackage.code",

                    cancelledOrdersCount: { $sum: 1 },
                  },
                },
              ]).exec()
            )[0].cancelledOrdersCount;
          } catch (error) {
            return 0;
          }
        };

        return {
          name: x.name,
          scriptGroupCode: x.scriptGroupCode,
          revenue: x?.totalPrice - x?.totalCost,
          buy: await buy(),
          cancel: await cancel(),
        };
      })
    );

    return servicePackages;
  }

  // calculate statistic order
  async calculateStatisticOrder(type, dataType) {
    let data = {
      dataType,
      type,
      typeLabel: arrTypeLabel[type],
    };

    if (dataType === "order") {
      data.order = {
        value: await Order.find(condArr[type]).countDocuments(),
        completed: await Order.find({
          ...condArr[type],
          status: "completed",
        }).countDocuments(),
        cancelled: await Order.find({
          ...condArr[type],
          status: "cancelled",
        }).countDocuments(),
        running: await Order.find({
          ...condArr[type],
          status: "running",
        }).countDocuments(),
      };
    }

    if (dataType === "money") {
      data.money = {
        value: (
          await Order.aggregate([
            {
              $match: {
                ...condArr[type],
              },
            },
            {
              $group: {
                _id: null,
                totalValue: { $sum: "$totalPrice" },
              },
            },
          ]).exec()
        )[0].totalValue,
      };
    }

    if (dataType === "revenue") {
      const tempCost = (
        await Order.aggregate([
          {
            $match: {
              ...condArr[type],
            },
          },
          {
            $group: {
              _id: null,
              totalCost: { $sum: "$servicePackage.cost" },
            },
          },
        ])
      )[0].totalCost;

      const tempTotalPrice = (
        await Order.aggregate([
          {
            $match: {
              ...condArr[type],
            },
          },
          {
            $group: {
              _id: null,
              totalPrice: { $sum: "$totalPrice" },
            },
          },
        ])
      )[0].totalPrice;
      data.revenue = {
        value: tempTotalPrice - tempCost,
      };
    }
    return data;
  }

  // calculate get order list
  async calculateGetOrderList(typeTime) {
    const customerList = await Order.aggregate([
      {
        $match: {
          ...condArr[typeTime],
        },
      },
      {
        $group: {
          _id: "$customer",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      { $limit: 4 },
    ]);

    const data = await Promise.all(
      customerList.map(async (x) => {
        const [total, completed, cancelled, currentCustomer] =
          await Promise.all([
            Order.countDocuments({
              customer: x._id,
              ...condArr[typeTime],
            }),
            Order.countDocuments({
              customer: x._id,
              ...condArr[typeTime],
              status: "completed",
            }),
            Order.countDocuments({
              customer: x._id,
              ...condArr[typeTime],
              status: "cancelled",
            }),
            Customer.findById(x._id).select("email avatar").lean(),
          ]);

        return {
          name: currentCustomer.email,
          avatar: currentCustomer.avatar,
          total,
          cancelled,
          completed,
        };
      })
    );

    return data;
  }

  // calculate platform
  async calculateStatisticPlatform(type, dataType) {
    let data = {};
    if (dataType === "order") {
      data = await Order.aggregate([
        {
          $match: condArr[type],
        },
        {
          $group: {
            _id: "$servicePackage.scriptGroupCode",
            total: { $sum: 1 },
          },
        },
        { $sort: { total: -1 } },
      ]).exec();
    }

    if (dataType === "money") {
      data = await Order.aggregate([
        {
          $match: condArr[type],
        },
        {
          $group: {
            _id: "$servicePackage.scriptGroupCode",
            total: { $sum: "$totalPrice" },
          },
        },
        { $sort: { total: -1 } },
      ]).exec();
    }

    if (dataType === "revenue") {
      data = await Order.aggregate([
        {
          $match: condArr[type],
        },
        {
          $group: {
            _id: "$servicePackage.scriptGroupCode",
            total: { $sum: "$servicePackage.cost" },
          },
        },
        { $sort: { total: -1 } },
      ]).exec();
    }

    const sum = data.reduce((a, b) => a + b.total, 0);
    const chart = data.map((x) => {
      const total = x?.total || 0;
      return {
        x: x._id,
        y: Number(((total / sum) * 100).toFixed(2)),
      };
    });

    return chart;
  }

  // calculate get partner
  async calculateGetPartner(type, dataType) {
    const data = {
      dg: [],
      ongTrum: [],
    };
    if (type == 0) {
      if (dataType === "order") {
        let tempArray = [];

        for (let i = 11; i >= 0; i--) {
          tempArray.push(
            moment()
              .subtract(i * 2, "hours")
              .format("HH")
          );
        }

        const cal = async (partner) => {
          return await Promise.all(
            tempArray.map(async (x) => {
              const startTime = moment(
                `${moment().format("YYYY-MM-DD")}-${x}`,
                "YYYY-MM-DD-HH"
              ).toDate();
              const endTime = moment(startTime).add(2, "hours").toDate();

              return {
                x,
                y: await Order.find({
                  "servicePackage.partnerCode": partner,
                  createdAt: {
                    $gte: startTime,
                    $lt: endTime,
                  },
                }).countDocuments(),
              };
            })
          );
        };

        data.dg = await cal("1dg.me");
        data.ongTrum = await cal("ongtrum");
      }

      if (dataType === "money") {
        let tempArray = [];

        for (let i = 11; i >= 0; i--) {
          tempArray.push(
            moment()
              .subtract(i * 2, "hours")
              .format("HH")
          );
        }

        const cal = async (partner) => {
          return await Promise.all(
            tempArray.map(async (x) => {
              const startTime = moment(
                `${moment().format("YYYY-MM-DD")}-${x}`,
                "YYYY-MM-DD-HH"
              ).toDate();
              const endTime = moment(startTime).add(2, "hours").toDate();

              return {
                x,
                y: await (async () => {
                  try {
                    return (
                      await Order.aggregate([
                        {
                          $match: {
                            "servicePackage.partnerCode": partner,
                            createdAt: {
                              $gte: startTime,
                              $lte: endTime,
                            },
                          },
                        },
                        {
                          $group: {
                            _id: null,
                            total: { $sum: "$totalPrice" },
                          },
                        },
                      ]).exec()
                    )[0].total;
                  } catch (error) {
                    return 0;
                  }
                })(),
              };
            })
          );
        };

        data.dg = await cal("1dg.me");
        data.ongTrum = await cal("ongtrum");
      }

      if (dataType === "revenue") {
        let tempArray = [];

        for (let i = 11; i >= 0; i--) {
          tempArray.push(
            moment()
              .subtract(i * 2, "hours")
              .format("HH")
          );
        }
        const cal = async (partner) => {
          return await Promise.all(
            tempArray.map(async (x) => {
              const startTime = moment(
                `${moment().format("YYYY-MM-DD")}-${x}`,
                "YYYY-MM-DD-HH"
              ).toDate();
              const endTime = moment(startTime).add(2, "hours").toDate();

              return {
                x,
                y: await (async () => {
                  try {
                    const tempCost = (
                      await Order.aggregate([
                        {
                          $match: {
                            "servicePackage.partnerCode": partner,
                            createdAt: {
                              $gte: startTime,
                              $lte: endTime,
                            },
                          },
                        },
                        {
                          $group: {
                            _id: null,
                            total: { $sum: "$servicePackage.cost" },
                          },
                        },
                      ]).exec()
                    )[0].total;

                    const tempTotalPrice = (
                      await Order.aggregate([
                        {
                          $match: {
                            "servicePackage.partnerCode": partner,
                            createdAt: {
                              $gte: startTime,
                              $lte: endTime,
                            },
                          },
                        },
                        {
                          $group: {
                            _id: null,
                            total: { $sum: "$totalPrice" },
                          },
                        },
                      ]).exec()
                    )[0].total;

                    return tempTotalPrice - tempCost;
                  } catch (error) {
                    return 0;
                  }
                })(),
              };
            })
          );
        };

        data.dg = await cal("1dg.me");
        data.ongTrum = await cal("ongtrum");
      }
    }

    if (type == 1) {
      if (dataType === "order") {
        let tempArray = [];

        for (let i = 6; i >= 0; i--) {
          tempArray.push(moment().subtract(i, "days").format("DD/MM/YYYY"));
        }

        const cal = async (partner) => {
          return await Promise.all(
            tempArray.map(async (x) => {
              const startDate = moment(x, "DD/MM/YYYY").startOf("day").toDate();
              const endDate = moment(startDate).endOf("day").toDate();

              return {
                x,
                y: await Order.find({
                  "servicePackage.partnerCode": partner,
                  createdAt: {
                    $gte: startDate,
                    $lt: endDate,
                  },
                }).countDocuments(),
              };
            })
          );
        };

        data.dg = await cal("1dg.me");
        data.ongTrum = await cal("ongtrum");
      }
      if (dataType === "money") {
        let tempArray = [];

        for (let i = 6; i >= 0; i--) {
          tempArray.push(moment().subtract(i, "days").format("DD/MM/YYYY"));
        }

        const cal = async (partner) => {
          return await Promise.all(
            tempArray.map(async (x) => {
              const startDate = moment(x, "DD/MM/YYYY").startOf("day").toDate();
              const endDate = moment(startDate).endOf("day").toDate();

              return {
                x,
                y: await (async () => {
                  try {
                    return (
                      await Order.aggregate([
                        {
                          $match: {
                            "servicePackage.partnerCode": partner,
                            createdAt: {
                              $gte: startDate,
                              $lte: endDate,
                            },
                          },
                        },
                        {
                          $group: {
                            _id: null,
                            total: { $sum: "$totalPrice" },
                          },
                        },
                      ]).exec()
                    )[0].total;
                  } catch (error) {
                    return 0;
                  }
                })(),
              };
            })
          );
        };

        data.dg = await cal("1dg.me");
        data.ongTrum = await cal("ongtrum");
      }
      if (dataType === "revenue") {
        let tempArray = [];

        for (let i = 6; i >= 0; i--) {
          tempArray.push(moment().subtract(i, "days").format("DD/MM/YYYY"));
        }
        const cal = async (partner) => {
          return await Promise.all(
            tempArray.map(async (x) => {
              const startDate = moment(x, "DD/MM/YYYY").startOf("day").toDate();
              const endDate = moment(startDate).endOf("day").toDate();

              return {
                x,
                y: await (async () => {
                  try {
                    const tempCost = (
                      await Order.aggregate([
                        {
                          $match: {
                            "servicePackage.partnerCode": partner,
                            createdAt: {
                              $gte: startDate,
                              $lte: endDate,
                            },
                          },
                        },
                        {
                          $group: {
                            _id: null,
                            total: { $sum: "$servicePackage.cost" },
                          },
                        },
                      ]).exec()
                    )[0].total;

                    const tempTotalPrice = (
                      await Order.aggregate([
                        {
                          $match: {
                            "servicePackage.partnerCode": partner,
                            createdAt: {
                              $gte: startDate,
                              $lte: endDate,
                            },
                          },
                        },
                        {
                          $group: {
                            _id: null,
                            total: { $sum: "$totalPrice" },
                          },
                        },
                      ]).exec()
                    )[0].total;

                    return tempTotalPrice - tempCost;
                  } catch (error) {
                    return 0;
                  }
                })(),
              };
            })
          );
        };

        data.dg = await cal("1dg.me");
        data.ongTrum = await cal("ongtrum");
      }
    }

    if (type == 2) {
      if (dataType === "order") {
        let tempArray = [];

        for (let i = 11; i >= 0; i--) {
          tempArray.push(moment().subtract(i, "months").format("MM/YYYY"));
        }

        const cal = async (partner) => {
          return await Promise.all(
            tempArray.map(async (x) => {
              const startDate = moment(x, "MM/YYYY").startOf("month").toDate();
              const endDate = moment(startDate).endOf("month").toDate();

              return {
                x,
                y: await Order.find({
                  "servicePackage.partnerCode": partner,
                  createdAt: {
                    $gte: startDate,
                    $lt: endDate,
                  },
                }).countDocuments(),
              };
            })
          );
        };

        data.dg = await cal("1dg.me");
        data.ongTrum = await cal("ongtrum");
      }
      if (dataType === "money") {
        let tempArray = [];

        for (let i = 11; i >= 0; i--) {
          tempArray.push(moment().subtract(i, "months").format("MM/YYYY"));
        }

        const cal = async (partner) => {
          return await Promise.all(
            tempArray.map(async (x) => {
              const startDate = moment(x, "MM/YYYY").startOf("month").toDate();
              const endDate = moment(startDate).endOf("month").toDate();

              return {
                x,
                y: await (async () => {
                  try {
                    return (
                      await Order.aggregate([
                        {
                          $match: {
                            "servicePackage.partnerCode": partner,
                            createdAt: {
                              $gte: startDate,
                              $lte: endDate,
                            },
                          },
                        },
                        {
                          $group: {
                            _id: null,
                            total: { $sum: "$totalPrice" },
                          },
                        },
                      ]).exec()
                    )[0].total;
                  } catch (error) {
                    return 0;
                  }
                })(),
              };
            })
          );
        };

        data.dg = await cal("1dg.me");
        data.ongTrum = await cal("ongtrum");
      }

      if (dataType === "revenue") {
        let tempArray = [];

        for (let i = 11; i >= 0; i--) {
          tempArray.push(moment().subtract(i, "month").format("MM/YYYY"));
        }

        const cal = async (partner) => {
          return await Promise.all(
            tempArray.map(async (x) => {
              const startDate = moment(x, "MM/YYYY").startOf("month").toDate();
              const endDate = moment(startDate).endOf("month").toDate();

              return {
                x,
                y: await (async () => {
                  try {
                    const tempCost = (
                      await Order.aggregate([
                        {
                          $match: {
                            "servicePackage.partnerCode": partner,
                            createdAt: {
                              $gte: startDate,
                              $lte: endDate,
                            },
                          },
                        },
                        {
                          $group: {
                            _id: null,
                            total: { $sum: "$servicePackage.cost" },
                          },
                        },
                      ]).exec()
                    )[0].total;
                    const tempTotalPrice = (
                      await Order.aggregate([
                        {
                          $match: {
                            "servicePackage.partnerCode": partner,
                            createdAt: {
                              $gte: startDate,
                              $lte: endDate,
                            },
                          },
                        },
                        {
                          $group: {
                            _id: null,
                            total: { $sum: "$totalPrice" },
                          },
                        },
                      ]).exec()
                    )[0].total;
                    return tempTotalPrice - tempCost;
                  } catch (error) {
                    return 0;
                  }
                })(),
              };
            })
          );
        };

        data.dg = await cal("1dg.me");
        data.ongTrum = await cal("ongtrum");
      }
    }

    return data;
  }

  // calculate get recharge list
  async calculateGetRechargeList(type) {
    const data = await PaymentActivity.aggregate([
      {
        $match: {
          ...condArr[type],
          type: { $in: rechageEnum },
        },
      },
      {
        $group: {
          _id: "$customer", // Nhóm theo customer
          totalAmount: { $sum: "$amount" }, // Tính tổng số tiền nạp của mỗi customer
        },
      },
      {
        $sort: {
          totalAmount: -1,
        },
      },
      {
        $limit: 4,
      },
    ]);

    const dataTemp = await Promise.all(
      data.map(async (x) => {
        const [currentCustomer, currentWallet] = await Promise.all([
          Customer.findOne({
            _id: x._id,
          }).lean(),
          Wallet.findOne({
            customer: x._id,
          }).lean(),
        ]);

        return {
          balance: currentWallet?.balance,
          name: currentCustomer.email,
          avatar: currentCustomer.avatar,
          total: x.totalAmount,
        };
      })
    );

    return dataTemp;
  }

  // kiểm tra số tiền trong ví của những người dùng
  async calculateCustomerWallet() {
    const customerWallet = (
      await Wallet.aggregate([
        { $group: { _id: null, totalValue: { $sum: "$balance" } } },
      ]).exec()
    )[0].totalValue;
    return customerWallet;
  }
}

export default CalculateDashboardService;
