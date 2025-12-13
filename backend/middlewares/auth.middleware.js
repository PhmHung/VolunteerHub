/** @format */
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import asyncHandler from "express-async-handler";

const protect = asyncHandler(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        res.status(401);
        throw new Error("User not found, authorization denied.");
      }

      next();
    } catch (error) {
      res.status(401);
      throw new Error("Token expired or invalid, authorization denied.");
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("Has no token, authorization denied.");
  }
});

const allowAdminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403);
    throw new Error("Only Admin can access this resource.");
  }
};

const allowAdminOrManager = (req, res, next) => {
  if (req.user && (req.user.role === "admin" || req.user.role === "manager")) {
    next();
  } else {
    res.status(403);
    throw new Error("Only Admin or Manager can access this resource.");
  }
};

const allowSelfOrAdmin = (req, res, next) => {
  if (
    req.user &&
    (req.user._id.toString() === req.params.id || req.user.role === "admin")
  ) {
    next();
  } else {
    res.status(403);
    throw new Error("Can only access own data or be an Admin.");
  }
};

export { protect, allowAdminOnly, allowAdminOrManager, allowSelfOrAdmin };
