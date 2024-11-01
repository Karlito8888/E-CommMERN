// backend/models/categoryModel.js

import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Le nom de la catégorie est requis"],
      maxLength: [
        32,
        "Le nom de la catégorie ne doit pas dépasser 32 caractères",
      ],
      unique: true,
    },
  },
  { timestamps: true }
);

categorySchema.index({ name: 1 }, { unique: true });

export default mongoose.model("Category", categorySchema);

