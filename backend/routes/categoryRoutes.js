import express from "express";
import Category from "../models/Category.js"; 
import History from "../models/History.js"; 
import BudgetEntry from "../models/BudgetEntry.js"; 
import mongoose from "mongoose"; 

const router = express.Router();

router.post("/budget", async (req, res) => {
    try {
        const { amount, historyLabel } = req.body;
        const budgetCategory = await Category.findOneAndUpdate(
            { label: "Budget" }, 
            { $inc: { amount: amount } }, 
            { upsert: true, new: true, runValidators: true } 
        );

        if (!budgetCategory) {
            return res.status(500).json({ message: "Failed to update budget category total." });
        }
        
        const newEntry = new BudgetEntry({
            label: historyLabel,
            amount: amount,
        });
        await newEntry.save();

        const historyId = new mongoose.Types.ObjectId().toString(); 

        const newHistory = new History({
            id: historyId,
            label: historyLabel,
            amount: amount,
            type: "Budget",
            category: "Budget",
        });
        await newHistory.save();

        res.status(201).json({ 
            message: "Budget entry saved and total updated successfully", 
            category: budgetCategory,
            entry: newEntry,
            history: newHistory 
        });
    } catch (error) {
        console.error("Mongoose Error Adding Budget Entry:", error); 
        res.status(500).json({ message: "Failed to add budget entry" });
    }
});
export default router;