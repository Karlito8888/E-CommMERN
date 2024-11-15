// backend/services/userService.js

import User from '../models/userModel.js';
import { APIError } from '../middlewares/errorMiddleware.js';
import { ERROR_MESSAGES } from '../utils/errorMessages.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export class UserService {
  static async findById(id) {
    const user = await User.findById(id);
    if (!user) {
      throw new APIError(ERROR_MESSAGES.RESOURCE.NOT_FOUND('Utilisateur'), 404);
    }
    return user;
  }

  static async findByEmail(email) {
    return User.findOne({ email });
  }

  static async findAll() {
    return User.find({}, '-password');
  }

  static async register(userData) {
    const { username, email, password } = userData;

    const userExists = await this.findByEmail(email);
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
    const user = await this.findByEmail(email);
    if (!user || !(await this.comparePasswords(password, user.password))) {
      throw new APIError(ERROR_MESSAGES.USER.INVALID_CREDENTIALS, 401);
    }

    const token = this.generateToken(user._id);
    return { user, token };
  }

  static async updateProfile(userId, updateData) {
    const user = await this.findById(userId);
    
    if (updateData.email && updateData.email !== user.email) {
      const emailExists = await this.findByEmail(updateData.email);
      if (emailExists) {
        throw new APIError(ERROR_MESSAGES.USER.EMAIL.ALREADY_EXISTS, 400);
      }
    }

    Object.assign(user, updateData);
    await user.save();
    return user;
  }

  static async updateShippingAddress(userId, addressData) {
    const user = await this.findById(userId);
    user.shippingAddress = addressData;
    await user.save();
    return user;
  }

  static async deleteUser(userId, adminId) {
    const user = await this.findById(userId);
    
    if (user.isAdmin) {
      throw new APIError(ERROR_MESSAGES.USER.CANNOT_DELETE_ADMIN, 403);
    }

    await user.deleteOne();
    return true;
  }

  static async validatePassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      return { isValid: false, message: ERROR_MESSAGES.USER.PASSWORD.TOO_SHORT };
    }

    if (!hasUpperCase || !hasLowerCase) {
      return { isValid: false, message: ERROR_MESSAGES.USER.PASSWORD.MISSING_UPPERCASE };
    }

    if (!hasNumbers) {
      return { isValid: false, message: ERROR_MESSAGES.USER.PASSWORD.MISSING_NUMBER };
    }

    if (!hasSpecialChar) {
      return { isValid: false, message: ERROR_MESSAGES.USER.PASSWORD.MISSING_SPECIAL };
    }

    return { isValid: true };
  }

  static async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  static async comparePasswords(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }

  static generateToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
  }

  static setTokenCookie(res, token) {
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 jours
    });
  }

  static clearTokenCookie(res) {
    res.cookie('jwt', '', {
      httpOnly: true,
      expires: new Date(0),
    });
  }
}
