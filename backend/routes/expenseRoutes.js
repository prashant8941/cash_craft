import express from "express";
import Expense from "../models/Expense.js";
import Category from "../models/Category.js"; 
import History from "../models/History.js"; 
import mongoose from "mongoose";

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const { title, amount, category } = req.body;

        // 1. Save Expense
        const newExpense = new Expense({ title, amount, category });
        const savedExpense = await newExpense.save();

        // 2. Update Category
        await Category.findOneAndUpdate(
            { label: category },
            { $inc: { amount: amount } }, 
            { upsert: true, new: true }
        );
        
        // 3. Save History
        const newHistory = new History({
            id: savedExpense._id.toString(), 
            label: title,
            amount: amount,
            type: "Expense",
            category: category,
        });
        await newHistory.save();

        res.status(201).json(savedExpense);
    } catch (error) {
        console.error("❌ Mongoose Error Adding Expense:", error);
        res.status(500).json({ message: "Failed to add expense" });
    }
});
// ... (omitted GET/DELETE routes for brevity, assuming they are correct)
router.get("/", async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch expenses" });
  }
});

router.delete("/", async (req, res) => {
  try {
    await Expense.deleteMany({});
    await Category.updateMany({ label: { $ne: "Budget" } }, { $set: { amount: 0 } });
    res.json({ message: "All expenses deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete expenses" });
  }
});

export default router;