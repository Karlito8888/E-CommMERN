// backend/services/passwordService.js
import bcrypt from 'bcryptjs';
import { ERROR_MESSAGES } from '../utils/errorMessages.js';

const SALT_ROUNDS = 10;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

class PasswordService {
  static async hashPassword(password) {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  static async comparePasswords(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }

  static validatePasswordStrength(password) {
    if (!password) {
      throw new Error(ERROR_MESSAGES.USER.PASSWORD.REQUIRED_FIELD);
    }

    if (password.length < 8) {
      throw new Error(ERROR_MESSAGES.USER.PASSWORD.TOO_SHORT);
    }

    if (!PASSWORD_REGEX.test(password)) {
      throw new Error(ERROR_MESSAGES.USER.PASSWORD.INVALID);
    }

    return true;
  }

  static generateResetToken() {
    return crypto.randomBytes(32).toString('hex');
  }
}

export default PasswordService;
