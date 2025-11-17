import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  label: { type: String, required: true, unique: true }, 
  amount: { type: Number, default: 0 },
  dateCreated: { type: Date, default: Date.now },
});

export default mongoose.model("Category", categorySchema);