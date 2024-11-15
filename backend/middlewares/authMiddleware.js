// backend/middlewares/authMiddleware.js

import jwt from 'jsonwebtoken';
import { UserService } from '../services/userService.js';
import asyncHandler from './asyncHandler.js';
import { APIError } from './errorMiddleware.js';
import { ERROR_MESSAGES } from '../utils/errorMessages.js';

export const authenticate = asyncHandler(async (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    throw new APIError(ERROR_MESSAGES.AUTH.TOKEN_INVALID, 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserService.findById(decoded.userId);
    req.user = user;
    next();
  } catch (error) {
    throw new APIError(ERROR_MESSAGES.AUTH.TOKEN_EXPIRED, 401);
  }
});

export const authorizeAdmin = (req, res, next) => {
  if (!req.user?.isAdmin) {
    throw new APIError(ERROR_MESSAGES.AUTH.UNAUTHORIZED, 403);
  }
  next();
};
