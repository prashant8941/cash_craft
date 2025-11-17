import mongoose from "mongoose";

const budgetEntrySchema = new mongoose.Schema({
  label: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: 0 },
  dateCreated: { type: Date, default: Date.now },
});

export default mongoose.model("BudgetEntry", budgetEntrySchema);