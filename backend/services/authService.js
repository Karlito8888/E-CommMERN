// backend/services/authService.js

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { APIError } from '../middlewares/errorMiddleware.js';
import { ERROR_MESSAGES } from '../utils/errorMessages.js';
import User from "../models/userModel.js";

export class AuthService {
  static async validatePassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      return { isValid: false, message: 'Le mot de passe doit contenir au moins 8 caractères' };
    }

    if (!hasUpperCase || !hasLowerCase) {
      return { isValid: false, message: 'Le mot de passe doit contenir des majuscules et des minuscules' };
    }

    if (!hasNumbers) {
      return { isValid: false, message: 'Le mot de passe doit contenir au moins un chiffre' };
    }

    if (!hasSpecialChar) {
      return { isValid: false, message: 'Le mot de passe doit contenir au moins un caractère spécial' };
    }

    return { isValid: true };
  }

  static async hashPassword(password) {
    return bcrypt.hash(password, 10);
  }

  static async comparePasswords(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }

  static generateToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });
  }

  static setTokenCookie(res, token) {
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
  }

  static clearTokenCookie(res) {
    res.cookie("jwt", "", {
      httpOnly: true,
      expires: new Date(0),
    });
  }

  static async findUserById(id) {
    const user = await User.findById(id);
    if (!user) {
      throw new APIError(ERROR_MESSAGES.RESOURCE.NOT_FOUND('Utilisateur'), 404);
    }
    return user;
  }

  static async findUserByEmail(email) {
    return User.findOne({ email });
  }

  static async register(userData) {
    const { username, email, password } = userData;

    const userExists = await this.findUserByEmail(email);
    if (userExists) {
      throw new APIError(ERROR_MESSAGES.RESOURCE.ALREADY_EXISTS('Utilisateur'), 400);
    }

    const { isValid, message } = await this.validatePassword(password);
    if (!isValid) {
      throw new APIError(message, 400);
    }

    const hashedPassword = await this.hashPassword(password);
    const user = new User({
      username,
      email,
      password: hashedPassword,
    });

    await user.save();
    return user;
  }

  static async login(email, password) {
    const user = await this.findUserByEmail(email);
    if (!user || !(await this.comparePasswords(password, user.password))) {
      throw new APIError(ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS, 401);
    }
    return user;
  }

  static async updateProfile(userId, updateData) {
    const user = await this.findUserById(userId);
    const { username, email, password } = updateData;

    if (email && email !== user.email) {
      const emailExists = await this.findUserByEmail(email);
      if (emailExists) {
        throw new APIError(ERROR_MESSAGES.RESOURCE.ALREADY_EXISTS('Email'), 400);
      }
    }

    if (username) user.username = username;
    if (email) user.email = email;

    if (password) {
      const { isValid, message } = await this.validatePassword(password);
      if (!isValid) {
        throw new APIError(message, 400);
      }
      user.password = await this.hashPassword(password);
    }

    await user.save();
    return user;
  }

  static async updateShippingAddress(userId, addressData) {
    const user = await this.findUserById(userId);
    user.shippingAddress = {
      ...user.shippingAddress,
      ...addressData
    };
    await user.save();
    return user;
  }
}
