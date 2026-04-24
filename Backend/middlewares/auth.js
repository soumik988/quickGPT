/*import jwt from "jsonwebtoken"
import User from "../models/User.js";

export const protect = async (req, res, next) => {
    let token = req.headers.authorization;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const userId = decoded.id;

        const user = await User.findById(userId)

        if (!user) {
            return res.json({ success: false, message: "Not authorized,user not found" })
        }

        req.user = user;

        next()
    } catch (error) {
        res.status(401).json({ message: "not authorized token failed" })
    }
}*/



import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    // Accept both "Bearer <token>" and raw token
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Invalid token format",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, token failed",
    });
  }
};