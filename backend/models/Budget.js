import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema({
  label: { type: String, default: "Budget" },
  amount: { type: Number, required: true, min: 0 },
  id: { type: String, required: true, unique: true },
  dateCreated: { type: Date, default: Date.now },
});

export default mongoose.model("Budget", budgetSchema);
