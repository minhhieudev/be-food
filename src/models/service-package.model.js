import mongoose from "mongoose";

export const ServicePackageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    orderSuccessDescription: {
      type: String,
    },
    scriptCode: {
      type: String,
    },
    scriptGroupCode: {
      type: String,
      // enum: ScriptGroupCodeEnum,
    },
    serviceGroup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "service-group",
    },
    serviceValue: {
      type: String,
    },
    serviceTags: {
      type: [String],
    },
    unit: {
      type: String,
    },
    cost: {
      type: Number,
    },
    price: {
      type: Number,
    },
    vipPrice: {
      type: Number,
    },
    originPrice: {
      type: Number,
    },
    status: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      // enum: TypeEnum
    },
    isBestSellers: {
      type: Boolean,
      default: false,
    },
    attributes: {
      type: [
        {
          label: String,
          code: String,
          description: String,
          dataType: String,
          required: Boolean,
          commentType: Boolean,
          options: [
            {
              label: String,
              value: String,
              description: String,
            },
          ],
        },
      ],
    },
    partnerCode: {
      type: String,
      default: 'local',
    },
    partnerServiceID: {
      type: Number,
    },
    minValue: {
      type: Number,
    },
    maxValue: {
      type: Number,
    },
    serviceCode: String,
    customPrice: {
      type: [
        {
          attributeCode: String,
          price: Number,
          customType: String, // amount, percent
          mappingValue: String, // Ong trum service ID
        },
      ],
    },
    images: {
      type: [String],
    },
    subscriptionID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'subdescription-meal',
    },
    mainImage: {
      type: String,
    },
    ingredientList: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'ingredient',
    },
  },
  { timestamps: true }
);

const ServicePackage = mongoose.model("service-package", ServicePackageSchema);

export default ServicePackage;
