import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import asyncHandler from "./asyncHandler.js";

const authenticate = asyncHandler(async (req, res, next) => {
  let token;

  // Lire le JWT depuis le cookie 'jwt'
  token = req.cookies.jwt;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select("-password");

      if (!user) {
        res.status(401);
        throw new Error("Not authorized, user not found.");
      }

      req.user = user; // Assigner l'utilisateur validé à req.user
      next();
    } catch (error) {
      res.status(401).json({ message: "Not authorized, token failed." });
    }
  } else {
    res.status(401).json({ message: "Not authorized, no token." });
  }
});

const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as an admin." }); // Utiliser 403 pour l'accès interdit
  }
};

export { authenticate, authorizeAdmin };
