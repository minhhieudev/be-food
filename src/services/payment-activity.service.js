import PaymentActivity from "../models/payment-activity.model.js";

class PaymentActivityService {
  async getByCustomerId(req, res) {
        try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 10;
      const skip = (page - 1) * pageSize;
      const { customerId } = req.params;

      const total = await PaymentActivity.countDocuments({
        customer: customerId,
      });

      const totalPages = Math.ceil(total / pageSize);

      const select = "-__v -updatedAt";

      const paymentActivities = await PaymentActivity.find({
        customer: customerId,
      })
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

      res.status(200).json({
        success: true,
        data: {
          pagination,
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

  async getByCustomer(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 10;
      const skip = (page - 1) * pageSize;
      const { toDate, fromDate } = req.query;

      let filter = {
        type: { $in: ["admin", "paypal", "bank", "perfectMoney"] },
        customer: req.user._id,
      };

      if (toDate && fromDate) {
        filter.createdAt = {
          $gte: fromDate,
          $lte: toDate
        };
      } else if (fromDate) {
        filter.createdAt = { $gte: fromDate };
      } else if (toDate) {
        filter.createdAt = { $lte: toDate };
      }
      
      const total = await PaymentActivity.countDocuments(filter);

      const totalPages = Math.ceil(total / pageSize);

      const select = "-__v -updatedAt";

      const paymentActivities = await PaymentActivity.find(filter)
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

      res.status(200).json({
        success: true,
        data: {
          pagination,
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
}
export default PaymentActivityService;
