import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  // The 'label' field is what we use to find the single "Budget" document
  label: { type: String, required: true, unique: true }, // 👈 Making label UNIQUE
  amount: { type: Number, default: 0 },
  dateCreated: { type: Date, default: Date.now },
});

export default mongoose.model("Category", categorySchema);