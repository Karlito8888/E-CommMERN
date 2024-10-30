// backend/models/userModel.js

import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      minlength: 2,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      match: /.+\@.+\..+/,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      trim: true,
      validate: {
        validator: function (value) {
          // Vérifier si le mot de passe contient au moins une majuscule et un caractère spécial
          return /[A-Z]/.test(value) && /[!@#$%^&*(),.?":{}|<>]/.test(value);
        },
        message: (props) =>
          `${props.value} n'est pas un mot de passe valide ! Il doit contenir au moins une majuscule et un caractère spécial.`,
      },
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,

    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;

