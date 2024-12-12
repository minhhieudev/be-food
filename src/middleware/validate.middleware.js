import { validationResult } from "express-validator";

// Define validate middleware
function ValidateMiddleware(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(200).json({ success: false, message: errors.errors[0].msg });
  }
  next();
}

export default ValidateMiddleware;
