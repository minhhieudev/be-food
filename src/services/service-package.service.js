import ServicePackage from "../models/service-package.model.js";
import ServiceGroup from "../models/service-group.model.js";
import { capitalizeFirstLetter, generateCode } from "../utils/function.js";
import _ from "lodash";
import { checkSimilarEleInArr } from "../validates/commont.validate.js";
import Setting from "../models/setting.model.js";
class ServicePackageService {

  async getAll(req, res) {
    console.log("getAll");
    try {
      const servicePackages = await ServicePackage.find({})
        .lean()
        .select("_id name price description mainImage status serviceTags")
        .populate({
          path: 'subscriptionID',
          select: '-createdAt -updatedAt -__v',
        })
      if (servicePackages.length === 0) {
        throw "No service packages found";
      }


      res.status(200).json({
        success: true,
        data: { servicePackages },
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

  async getServicePackagePublic(req, res) {
    try {
      const platforms = [
        "youtube",
        "facebook",
        "tiktok",
        "twitter",
        "shopee",
        "google",
        "instagram",
      ];

      const descriptions = [
        {
          platform: "youtube",
          name: "Youtube",
          description: "Tăng lượt xem, lượt thích, bình luận, và đăng ký kênh.",
        },
        {
          platform: "facebook",
          name: "Facebook",
          description:
            "Nâng cao sự hiện diện và tương tác trên mạng xã hội này",
        },
        {
          platform: "tiktok",
          name: "Tiktok",
          description: "Tăng lượt theo dõi, lượt thích, bình luận và chia sẻ",
        },
        {
          platform: "twitter",
          name: "Twiter",
          description: "Tăng lượt theo dõi, lượt thích, bình luận, và chia sẻ.",
        },
        {
          platform: "shopee",
          name: "Shopee",
          description:
            "Tăng tương tác trên nền tảng Shopee giúp các nhà bán hàng.",
        },
        {
          platform: "google",
          name: "Google",
          description:
            "Tăng lượt tìm kiếm, lượt xem và sự tin tưởng của khách hàng.",
        },
        {
          platform: "instagram",
          name: "Instagram",
          description:
            "Tăng lượt theo dõi, lượt thích, bình luận, và chia sẻ, giúp tạo dựng thương hiệu.",
        },
      ];

      const servicePackageCount = await ServicePackage.countDocuments({});

      const servicePackage = await ServicePackage.aggregate([
        {
          $match: {
            scriptGroupCode: { $in: platforms },
            status: true,
          },
        },
        {
          $group: {
            _id: "$scriptGroupCode",
            services: {
              $push: {
                name: "$name",
              },
            },
          },
        },
        {
          $project: {
            platform: "$_id",
            services: 1, // Giữ nguyên mảng services
          },
        },
        {
          $unwind: "$services",
        },
        {
          $sample: { size: servicePackageCount },
        },
        {
          $group: {
            _id: "$platform",
            services: {
              $push: "$services",
            },
          },
        },
        {
          $project: {
            _id: 0,
            platform: "$_id",
            services: {
              $slice: ["$services", 4],
            },
          },
        },
      ]);

      res.status(200).json({
        success: true,
        data: { platforms, services: servicePackage, descriptions },
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

  async getServicePackagePublicByPlatform(req, res) {
    try {
      const { platform = "youtube" } = req.params;

      const services = await ServicePackage.aggregate([
        {
          $match: {
            scriptGroupCode: platform,
          },
        },
        {
          $group: {
            _id: "$scriptGroupCode",
            services: {
              $push: {
                name: "$name",
                tags: "$serviceTags",
              },
            },
          },
        },
      ]);

      res.status(200).json({
        success: true,
        data: { platform, services },
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

  async getsByCustomer(req, res) {
    try {
      const { search, scriptGroupCode, serviceGroupID } = req.query;
      let filter = {
        status: true,
        partnerCode: { $nin: await getPartnerConditions() },
      };

      if (search) {
        const searchFields = ["name", "code"];
        const cond = searchFields.map((field) => {
          return {
            [field]: { $regex: _.escapeRegExp(search), $options: "i" },
          };
        });

        filter = Object.assign(filter, { $or: cond });
      }

      if (serviceGroupID && scriptGroupCode) {
        filter = Object.assign(filter, {
          serviceGroup: serviceGroupID,
          scriptGroupCode: scriptGroupCode,
        });
      }

      const servicePackages = await ServicePackage.find(filter)
        .select("-__v -createdAt -updatedAt -cost")
        .populate({ path: "serviceGroup", select: "name" })
        .lean()
        .sort({ createdAt: -1 });

      if (servicePackages.length === 0) throw "Không tìm thấy dịch vụ";

      res.status(200).json({
        success: true,
        data: { servicePackages },
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
      const data = req.body;
      const hasServiceGroup = await ServiceGroup.findOne({
        _id: data?.serviceGroupID,
      })
        .select("name")
        .lean();

      if (!hasServiceGroup) {
        throw "Nhóm dịch vụ không tồn tại";
      }

      // Validate attributes
      if (data.attributes) {
        if (!_.isArray(data.attributes)) {
          throw "Danh sách thuộc tính không hợp lệ";
        }
        const isValid = _.every(data.attributes, (item) => {
          return !_.isEmpty(item.label) && !_.isEmpty(item.code);
        });

        if (!isValid) {
          throw "Tên thuộc tính và mã thuộc tính là bắt buộc";
        }

        // Validate trùng mã thuộc tính
        const attributeCodes = _.map(data.attributes, "code");
        const attributeNames = _.map(data.attributes, "label");

        if (checkSimilarEleInArr(attributeNames))
          throw "Tên thuộc tính không được trùng nhau";
        else if (checkSimilarEleInArr(attributeCodes))
          throw "Mã thuộc tính không được trùng nhau";

        const commentTypes = data.attributes
          .map((attribute) => attribute.commentType)
          .filter((value) => value === true);
        if (commentTypes.length > 1) {
          throw "Tạo comment tự động chỉ được áp dùng cho 1 thuộc tính";
        }
      }

      const code = generateCode("");

      const newData = {
        name: data.name,
        code: code,
        description: data?.description,
        orderSuccessDescription: data?.orderSuccessDescription,
        scriptCode: data.scriptCode,
        scriptGroupCode: data?.scriptGroupCode,
        serviceGroup: data?.serviceGroupID,
        serviceValue: data?.serviceValue,
        serviceTags: data?.serviceTags,
        unit: data?.unit,
        cost: data?.cost,
        price: data?.price,
        vipPrice: data?.vipPrice,
        originPrice: data?.originPrice,
        status: data?.status,
        type: data?.type,
        attributes: data?.attributes,
        isBestSellers: data?.isBestSellers,
        partnerCode: data?.partnerCode,
        partnerServiceID:
          data?.partnerCode !== "local" ? data?.partnerServiceID : "",
        minValue: data?.minValue,
        maxValue: data?.maxValue,
        serviceCode: data?.serviceCode,
        customPrice: data?.customPrice,
        /////////
        subscriptionID: data?.subscriptionID,
        mainImage: data?.mainImage,
        images: data?.images,
        ingredientList: data?.ingredientList

      };

      const newSP = await ServicePackage.create(newData);

      res.status(200).send({
        success: true,
        message: "Thêm mới thành công",
        data: {
          _id: newSP._id,
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

  // import service code for ongtrum
  async createMany(req, res) {
    try {
      const { data } = req.body;
      if (!_.isArray(data) || !data.length) {
        throw "Dữ liệu không hợp lệ";
      }

      // Validate attributes
      const validateAttributes = (eachData) => {
        if (eachData.attributes) {
          if (!_.isArray(eachData.attributes)) {
            throw "Danh sách thuộc tính không hợp lệ";
          }
          const isValid = _.every(eachData.attributes, (item) => {
            return !_.isEmpty(item.label) && !_.isEmpty(item.code);
          });

          if (!isValid) {
            throw "Tên thuộc tính và mã thuộc tính là bắt buộc";
          }

          // Validate trùng mã thuộc tính
          const attributeCodes = _.map(eachData.attributes, "code");
          const attributeNames = _.map(eachData.attributes, "label");

          if (checkSimilarEleInArr(attributeNames))
            throw "Tên thuộc tính không được trùng nhau";
          else if (checkSimilarEleInArr(attributeCodes))
            throw "Mã thuộc tính không được trùng nhau";

          const commentTypes = eachData.attributes
            .map((attribute) => attribute.commentType)
            .filter((value) => value === true);
          if (commentTypes.length > 1) {
            throw "Tạo comment tự động chỉ được áp dùng cho 1 thuộc tính";
          }
        }
      };

      // validate data
      for (const eachData of data) {
        if (eachData.partnerCode === "ongtrum" && !eachData.serviceCode) {
          // create service group from serviceCode ongtrum
          throw "Mã dịch vụ không hợp lệ";
        }
        validateAttributes(eachData);
      }

      const getServiceGroupName = (serviceCode) => {
        const serviceCodeSplitArray = serviceCode.split("_");
        if (serviceCodeSplitArray.length > 1) {
          return `${capitalizeFirstLetter(
            serviceCodeSplitArray[1]
          )} ${capitalizeFirstLetter(serviceCodeSplitArray[0])}`;
        } else {
          return serviceCode;
        }
      };

      const groupByServiceCode = _.groupBy(data, "serviceCode");
      const dataGrouped = [];
      Object.values(groupByServiceCode).map((groupedByServiceCode) => {
        if (groupedByServiceCode.length > 1) {
          const options = groupedByServiceCode
            .map((eachData) => {
              let channelName =
                eachData.name.match(/Channel\(\d+\)/i)?.[0] || "";
              const channelFormat =
                channelName.match(/\(([\s\S]+)\)/)?.[1] || "";
              channelName = channelFormat
                ? `Channel ${channelFormat}`
                : channelName;
              return {
                label: channelName,
                value: eachData.partnerServiceID,
                description: eachData.description,
              };
            })
            .filter((item) => !!item.value);
          const customPrice = groupedByServiceCode.map((eachData) => {
            return {
              attributeCode: "service_channel",
              price: eachData.price,
              customType: "amount",
              mappingValue: eachData.partnerServiceID,
            };
          });
          if (groupedByServiceCode[0].price) {
            delete groupedByServiceCode[0].price;
          }
          if (groupedByServiceCode[0].partnerServiceID) {
            delete groupedByServiceCode[0].partnerServiceID;
          }
          dataGrouped.push({
            ...groupedByServiceCode[0],
            name: groupedByServiceCode[0].serviceCode,
            price: 0,
            attributes: [
              ...(groupedByServiceCode[0].attributes || []),
              {
                label: "Kênh",
                code: "service_channel",
                description: "Kênh",
                dataType: "select",
                required: true,
                options,
              },
            ],
            customPrice,
          });
        } else {
          dataGrouped.push(groupedByServiceCode[0]);
        }
      });

      // create serviceGroup
      const createServiceGroupData = [];
      dataGrouped.map((eachData) => {
        if (eachData.partnerCode === "ongtrum" && eachData.serviceCode) {
          const serviceGroupName = getServiceGroupName(eachData.serviceCode);
          if (
            !createServiceGroupData.some(
              (group) => group.name === serviceGroupName
            )
          ) {
            createServiceGroupData.push({ name: serviceGroupName });
          }
        }
      });

      if (createServiceGroupData.length) {
        const serviceGroupsCreated = await ServiceGroup.find({
          name: { $in: _.flatMap(createServiceGroupData, "name") },
        }).lean();

        for (const serviceGroup of serviceGroupsCreated) {
          const findIndex = createServiceGroupData.findIndex(
            (s) => s.name === serviceGroup.name
          );
          if (findIndex > -1) {
            createServiceGroupData[findIndex]._id = serviceGroup._id;
          }
        }

        const serviceGroupsNameCreated = serviceGroupsCreated.map(
          (serviceGroup) => serviceGroup.name
        );

        const serviceGroupsWillCreate = createServiceGroupData.filter(
          (serviceGroup) =>
            !serviceGroupsNameCreated.includes(serviceGroup.name)
        );

        if (serviceGroupsWillCreate.length) {
          const serviceGroups = await ServiceGroup.insertMany(
            serviceGroupsWillCreate.map((s) => ({ name: s.name }))
          );

          for (const serviceGroup of serviceGroups) {
            const findIndex = createServiceGroupData.findIndex(
              (s) => s.name === serviceGroup.name
            );
            if (findIndex > -1) {
              createServiceGroupData[findIndex]._id = serviceGroup._id;
            }
          }
        }
      }

      dataGrouped.map((eachData) => {
        if (eachData.partnerCode === "ongtrum" && eachData.serviceCode) {
          const serviceGroup = createServiceGroupData.find(
            (s) => s.name === getServiceGroupName(eachData.serviceCode)
          );
          if (serviceGroup) {
            eachData.serviceGroupID = serviceGroup._id;
          }
        }
      });

      const bulkCreate = [];
      dataGrouped.map((eachData) => {
        const newData = {
          name: eachData.name,
          code: generateCode(""),
          description: eachData?.description,
          orderSuccessDescription: eachData?.orderSuccessDescription,
          scriptCode: eachData.scriptCode,
          scriptGroupCode: eachData?.scriptGroupCode,
          serviceGroup: eachData?.serviceGroupID,
          serviceValue: eachData?.serviceValue,
          serviceTags: eachData?.serviceTags,
          unit: eachData?.unit,
          cost: data?.cost,
          price: eachData?.price,
          vipPrice: eachData?.vipPrice,
          originPrice: eachData?.originPrice,
          status: eachData?.status,
          type: eachData?.type,
          attributes: eachData?.attributes,
          isBestSellers: eachData?.isBestSellers,
          partnerCode: eachData?.partnerCode,
          partnerServiceID:
            eachData?.partnerCode !== "local" ? eachData?.partnerServiceID : "",
          minValue: eachData?.minValue,
          maxValue: eachData?.maxValue,
          serviceCode: eachData?.serviceCode,
          customPrice: eachData?.customPrice,
          /////
          subscriptionID: data?.subscriptionID,
          mainImage: data?.mainImage,
          images: data?.images,
          ingredientList: data?.ingredientList
        };
        bulkCreate.push(newData);
      });

      if (bulkCreate.length) {
        await ServicePackage.insertMany(bulkCreate);
      }

      res.status(200).send({
        success: true,
        message: "Thêm mới thành công",
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
      const data = req.body;
      const servicePackage = await ServicePackage.findById(id);

      if (!servicePackage) {
        throw "ID không tồn tại";
      }

      if (data.serviceGroupID) {
        const hasServiceGroup = await ServiceGroup.exists({
          _id: data.serviceGroupID,
        }).lean();

        if (!hasServiceGroup) {
          throw "Nhóm dịch vụ không tồn tại";
        }
      }

      // Validate attributes
      if (data.attributes) {
        const isValid = _.every(data.attributes, (item) => {
          return !_.isEmpty(item.label) && !_.isEmpty(item.code);
        });

        if (!isValid) {
          throw "Tên thuộc tính và mã thuộc tính là bắt buộc";
        }
      }

      const newData = {
        name: data.name,
        description: data?.description,
        orderSuccessDescription: data?.orderSuccessDescription,
        scriptCode: data.scriptCode,
        scriptGroupCode: data?.scriptGroupCode,
        serviceGroup: data?.serviceGroupID,
        serviceValue: data?.serviceValue,
        serviceTags: data?.serviceTags,
        unit: data?.unit,
        cost: data?.cost,
        price: data?.price,
        vipPrice: data?.vipPrice,
        originPrice: data?.originPrice,
        status: data?.status,
        type: data?.type,
        attributes: data?.attributes,
        isBestSellers: data?.isBestSellers,
        partnerCode: data?.partnerCode,
        partnerServiceID:
          data?.partnerCode !== "local" ? data?.partnerServiceID : "",
        minValue: data?.minValue,
        maxValue: data?.maxValue,
        customPrice: data?.customPrice,
        /////
        subscriptionID: data?.subscriptionID,
        mainImage: data?.mainImage,
        images: data?.images,
        ingredientList: data?.ingredientList
      };

      await servicePackage.updateOne(newData);

      res.status(200).send({
        success: true,
        message: "Cập nhật thành công",
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

      const servicePackage = await ServicePackage.findOne({
        _id: id,
        //partnerCode: { $nin: await getPartnerConditions() },
      })
        .select(" name price description mainImage images serviceTags")
        .populate({
          path: 'subscriptionID',
          select: '-createdAt -updatedAt -__v',
        })
        .populate({
          path: 'ingredientList',
          select: 'name image description',
          populate: [{
            path: 'iGroupID', 
            select: 'name', 
          }, {
            path: 'iTags',
            select: 'iTagName color',
          }]
        })
        .lean();

      if (!servicePackage) throw "Dịch vụ không tồn tại";

      res.status(200).send({
        success: true,
        data: { servicePackage },
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
      const servicePackage = await ServicePackage.findOne({ _id: id })
        .populate({ path: "serviceGroup", select: "name" })
        .populate("subscriptionID")
        .populate("ingredientList")
        .select("-__v -createdAt -updatedAt -serviceGroup")
        .lean();

      if (!servicePackage) throw "Dịch vụ không tồn tại";

      res.status(200).send({
        success: true,
        data: { servicePackage },
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
      const servicePackage = ServicePackage.findById(id).lean();

      if (!servicePackage) throw "Dịch vụ không tồn tại";

      await ServicePackage.findByIdAndDelete(id);
      res.status(200).send({
        success: true,
        message: "Xoá thành công!",
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
  async deletePartner(req, res) {
    try {
      const { partnerCode } = req.params;

      await ServicePackage.deleteMany({ partnerCode });
      res.status(200).send({
        success: true,
        message: "Xoá thành công!",
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
      const { search, scriptGroupCode } = req.query;
      let filter = {};

      if (search) {
        const searchFields = ["name"];
        const cond = searchFields.map((field) => {
          return { [field]: { $regex: _.escapeRegExp(search), $options: "i" } };
        });

        filter = { $or: cond };
      }

      if (scriptGroupCode) {
        filter = Object.assign(filter, { scriptGroupCode });
      }

      const total = await ServicePackage.countDocuments(filter);
      const totalPages = Math.ceil(total / pageSize);
      const servicePackages = await ServicePackage.find(filter)
        .lean()
        .select("_id name price description images mainImage status" )
        .populate({
          path: 'subscriptionID',
          select: '-createdAt -updatedAt',
        })
        .populate(
          'ingredientList'
        )
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
        data: { pagination, servicePackages },
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

  // Danh sách dịch vụ hot - customer. TODO
  async servicePackageHot(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 20;
      const skip = (page - 1) * pageSize;
      const { search, scriptGroupCode } = req.query;
      let filter = {
        status: true,
        isBestSellers: true,
        partnerCode: { $nin: await getPartnerConditions() },
      };

      if (search) {
        const searchFields = ["name"];
        const cond = searchFields.map((field) => {
          return { [field]: { $regex: _.escapeRegExp(search), $options: "i" } };
        });

        filter = Object.assign(filter, { $or: cond });
      }

      if (scriptGroupCode) {
        filter = Object.assign(filter, { scriptGroupCode });
      }

      const total = await ServicePackage.countDocuments(filter);
      const totalPages = Math.ceil(total / pageSize);
      const servicePackages = await ServicePackage.find(filter)
        .lean()
        .select("-__v -createdAt -updatedAt -cost")
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
        data: { pagination, servicePackages },
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

  async calculatePriceCustom(customerEnteredValues, servicePackage) {
    const priceIncrease = customerEnteredValues.reduce((acc, enterValue) => {
      const customPrice = servicePackage.customPrice.find(
        (item) =>
          item.mappingValue === enterValue.enteredValue &&
          item.attributeCode === enterValue.attributeCode
      );
      if (customPrice) {
        if (customPrice.customType === "amount") {
          return acc + customPrice.price;
        } else if (customPrice.customType === "percent") {
          return acc + (customPrice.price / 100) * servicePackage.price;
        } else {
          return acc + 0;
        }
      } else {
        return acc + 0;
      }
    }, 0);
    return servicePackage.price + priceIncrease;
  }
}
export default ServicePackageService;
export const getPartnerConditions = async () => {
  const partnerCodeArr = [];
  try {
    // lấy thông tin cài đặt
    const [isUsePartnerOngtrum, isUsePartner1dg] = await Promise.all([
      Setting.findOne({ key: "isUsePartnerOngtrum" }).lean(),
      Setting.findOne({ key: "isUsePartner1dg" }).lean(),
    ]);

    if (isUsePartner1dg.value === "false") {
      partnerCodeArr.push("1dg.me");
    }
    if (isUsePartnerOngtrum.value === "false") {
      partnerCodeArr.push("ongtrum");
    }
    console.log(partnerCodeArr);
    return partnerCodeArr;
  } catch (error) {
    return partnerCodeArr;
  }
};






