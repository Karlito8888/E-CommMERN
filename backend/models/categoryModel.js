import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: true,
    minLength: 2,
    maxLength: 32,
    unique: true,
  },
});

export default mongoose.model("Category", categorySchema);
