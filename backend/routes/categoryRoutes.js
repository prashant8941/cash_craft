import express from "express";
import Category from "../models/Category.js"; 
import History from "../models/History.js"; 
import BudgetEntry from "../models/BudgetEntry.js"; // Required for detailed entry log
import mongoose from "mongoose"; 

const router = express.Router();

router.post("/budget", async (req, res) => {
    try {
        const { amount, historyLabel } = req.body;

        // 1. UPDATE/CREATE RUNNING BUDGET TOTAL (in 'categories' collection)
        // This ensures the single "Budget" document is created and its amount is incremented.
        const budgetCategory = await Category.findOneAndUpdate(
            { label: "Budget" }, 
            { $inc: { amount: amount } }, 
            { upsert: true, new: true, runValidators: true } 
        );

        if (!budgetCategory) {
            return res.status(500).json({ message: "Failed to update budget category total." });
        }
        
        // 2. CREATE NEW BUDGET ENTRY (in the 'budgetentries' collection)
        const newEntry = new BudgetEntry({
            label: historyLabel,
            amount: amount,
        });
        await newEntry.save();
        
        // 3. CREATE HISTORY LOG (in 'histories' collection)
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
        console.error("❌ Mongoose Error Adding Budget Entry:", error); 
        res.status(500).json({ message: "Failed to add budget entry" });
    }
});
// ... (omitted GET route for brevity)
export default router;