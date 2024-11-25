// backend/models/categoryModel.js

import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      auto: true
    },
    name: {
      type: String,
      trim: true,
      required: true,
      minLength: 2,
      maxLength: 50
    }
  },
  { 
    timestamps: true,
    toJSON: {
      transform(_, ret) {
        ret.id = ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Index pour optimiser les recherches
categorySchema.index({ name: 1 });

export default mongoose.model("Category", categorySchema);
