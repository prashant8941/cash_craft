import express from "express";
import Expense from "../models/Expense.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const newExpense = new Expense(req.body);
    const saved = await newExpense.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get("/", async (req, res) => {
  const expenses = await Expense.find();
  res.json(expenses);
});

export default router;
