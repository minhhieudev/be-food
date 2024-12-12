import axios, { HttpStatusCode } from "axios";
import crypto from "crypto";
import Rate from "../models/rate.model.js";

export function isValidUsername(username) {
  // Sử dụng biểu thức chính quy để kiểm tra username không chứa ký tự đặc biệt
  const regex = /^[a-zA-Z0-9._]+$/; // Chấp nhận chữ cái, số và dấu gạch dưới

  // Kiểm tra xem username phù hợp với biểu thức chính quy không
  return regex.test(username);
}

export function generateCode(prefix) {
  const timestamp = Date.now().toString();
  const randomDigits = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `${prefix}${timestamp}${randomDigits}`;
}

// Hàm để lấy tỷ giá hối đoái từ USD sang VNĐ
export async function convertUSDToVND(amount) {
  try {
    const rates = await Rate.findOne({ code: "USD" }).lean();
    const convertedAmount = amount / rates.exchangeRate;
    return Math.floor(convertedAmount);
  } catch (error) {
    console.error("Đã xảy ra lỗi khi lấy tỷ giá hối đoái:", error);
    throw error;
  }
}

// Hàm để lấy tỷ giá hối đoái từ USD sang VNĐ
export async function getVNDRateFromUSD() {
  try {
    // Gọi API để lấy tỷ giá hối đoái
    const response = await axios.get(
      "https://api.exchangerate-api.com/v4/latest/USD"
    );

    const exchangeRates = response.data.rates;

    // Lấy tỷ giá hối đoái của VNĐ từ kết quả trả về
    const VNDRate = exchangeRates.VND;

    return VNDRate;
  } catch (error) {
    console.error("Đã xảy ra lỗi khi lấy tỷ giá hối đoái:", error);
    throw error;
  }
}

export const mapStatus1Dgme = (status) => {
  // Status: Pending, Processing, In progress, Completed, Partial, Canceled
  switch (status) {
    case "Pending":
    case "Processing":
    case "In progress":
    case "Partial":
      return "running";

    case "Canceled":
      return "cancelled";

    case "Completed":
      return "completed";

    default:
      return "running";
  }
};

export const mapStatusOngtrum = (status) => {
  // Status: pending, Processing, in progress, completed, partial, Canceled
  if (status) status = status.toLowerCase();
  switch (status) {
    case "pending":
    case "processing":
    case "in progress":
    case "partial":
      return "running";

    case "canceled":
      return "cancelled";

    case "completed":
      return "completed";

    default:
      return "running";
  }
};

export const mapStatusServerTool = (service) => {
  const remains = service?.remains;
  if (remains === 0) {
    return "completed";
  }
  return "running";
};

const cryp = {
  key: "MST_USER_KEY$123456",
  type: "aes-256-cbc",
};

export function encryptObjectId(objectId) {
  const currentDate = Date.now();
  const encryptString = `${currentDate}_${objectId.toString()}`
  const cipher = crypto.createCipher(cryp.type, cryp.key);
  let encrypted = cipher.update(encryptString, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

export function decryptObjectId(encryptedObjectId) {
  const decipher = crypto.createDecipher(cryp.type, cryp.key);
  let decrypted = decipher.update(encryptedObjectId, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted.split("_")[1];
}

export function capitalizeFirstLetter(string) {
  if (!string) return string; // handle empty string or null input
  return string.charAt(0).toUpperCase() + string.slice(1);
}

