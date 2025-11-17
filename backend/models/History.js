import mongoose from "mongoose";

const historySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  label: { type: String, required: true },
  amount: { type: Number, required: true },
  type: {
    type: String,
    enum: ["Budget", "Expense", "Budget Reset", "Expenses Reset"],
    required: true,
  },
  category: { type: String, required: true },
  dateCreated: { type: Date, default: Date.now },
});

export default mongoose.model("History", historySchema);
