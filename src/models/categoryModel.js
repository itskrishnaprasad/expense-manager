// src/models/categoryModel.js

import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  // Reference to the user who owns this category
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["income", "expense"],
  },
  // Flag to distinguish default categories from user-created ones
  isDefault: {
    type: Boolean,
    default: false,
  },
});

// Create a compound index for performance.
// This will speed up the most common query: finding all categories for a specific user, often filtered by type.
categorySchema.index({ user: 1, type: 1 });

const Category = mongoose.model("Category", categorySchema);

export default Category;
