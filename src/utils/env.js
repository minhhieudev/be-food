import { config } from "dotenv";
config();
const env = (name) => {
    try {
        return process.env[`${name}`] || "";
    } catch (error) {
        console.log("env", error);
        return "";
    }
};

export default env;