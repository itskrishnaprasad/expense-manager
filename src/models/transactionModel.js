import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    // Link to the user who created this transaction
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // This references the 'User' model
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["income", "expense"], // The type must be one of these two values
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category", // This links to the Category model
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01, // Amount must be positive
    },
    note: {
      type: String,
      trim: true,
      maxLength: 100,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
