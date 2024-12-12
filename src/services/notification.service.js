import Notification from "../models/notification.model.js";
import translations from "../common/translate-mess-response.json" assert { type: "json" };

class NotificationService {
  async create(req, res) {
    try {
      const data = req.body;
      const lang = req.header.lang;
      const newData = {
        scriptCode: data.scriptCode,
        content: data.content,
      };

      const newNotification = await Notification.create(newData);

      res.status(200).send({
        success: true,
        message: translations.addSuccess[lang],
        data: {
          _id: newNotification._id,
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

  async update(req, res) {
    try {
      const { id } = req.params;
      const lang = req.header.lang;
      const data = req.body;

      const notification = await Notification.findById(id);
      if (!notification) {
        throw translations.notificationCodeNotExist[lang];
      }

      const newData = {
        scriptCode: data.scriptCode,
        content: data.content,
      };

      await notification.updateOne(newData, { new: true, runValidators: true });

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

  async getOne(req, res) {
    try {
      const { id } = req.params;
      const lang = req.header.lang;
      const notification = await Notification.findById(id).lean();
      if (!notification) throw translations.idNotExist[lang];

      res.status(200).send({
        success: true,
        data: { notification },
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
      const notification = await Notification.findById(id).lean();
      if (!notification) throw translations.notificationCodeNotExist[lang];

      await Notification.findByIdAndDelete(id);

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

  async gets(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 20;
      const skip = (page - 1) * pageSize;
      const filter = {};
      
      const total = await Notification.countDocuments(filter);
      const totalPages = Math.ceil(total / pageSize);

      const notifications = await Notification.find(filter)
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
        data: { pagination, notifications },
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

export default NotificationService;
