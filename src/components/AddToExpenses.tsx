import { useState, useContext } from "react";
import { Button, TextInput, NumberInput, Select, Paper } from "@mantine/core";
import ExpensesContext from "../store/ExpensesContext";
import CategoriesContext from "../store/CategoriesContext";
import HistoryContext from "../store/HistoryContext";
import { useNavigate } from "react-router-dom";

type AmountState = number | null; 

export default function AddToExpenses() {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState<AmountState>(null); 
  const [category, setCategory] = useState("");

  const { addExpense } = useContext(ExpensesContext);
  const { addCategory } = useContext(CategoriesContext);
  const { addHistoryElement } = useContext(HistoryContext);
  const navigate = useNavigate();

  const availableCategoriesData = ["Food", "Transport", "Shopping", "Bills", "Other", "Uncategorized"]; 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const numericAmount = Number(amount);

    if (!title || amount === null || numericAmount <= 0 || !category) {
      alert("⚠️ Please fill all fields and ensure the amount is greater than zero!");
      return;
    }

    const expense = { title, amount: numericAmount, category };

    try {
      // API Call to add expense to MongoDB 
      const res = await fetch("http://localhost:5000/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expense),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(data.message || "Failed to add expense");

      // Update local state/context (for display before next fetch)
      addExpense(data);
      addCategory({
        label: category,
        id: crypto.randomUUID(), 
        amount: numericAmount,
      });

      addHistoryElement({
        label: title,
        amount: numericAmount,
        id: data._id || crypto.randomUUID(), 
        type: "Expense",
        dateCreated: "",
        category: category,
      });

      alert("✅ Expense added successfully!");

      // reset form
      setTitle("");
      setAmount(null); 
      setCategory("");

      navigate("/home");

    } catch (err) {
      console.error("❌ Error adding expense:", err);
      alert("Failed to add expense. Check console for details.");
    }
  };

  return (
    <Paper p="md" radius="md" shadow="md" style={{ maxWidth: 400, margin: "auto" }}>
      <form onSubmit={handleSubmit}>
        <TextInput
          label="Expense Title"
          placeholder="e.g. Coffee"
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
          required
        />

        <NumberInput
          label="Amount"
          placeholder="e.g. 120"
          value={amount ?? undefined} // FINAL FIX: Converts null to undefined for Mantine prop
          onChange={(val) => {
            setAmount(val === undefined || val === null ? null : val);
          }}
          required
          mt="sm"
          min={0} 
        />

        <Select
          label="Category"
          placeholder="Pick one"
          data={availableCategoriesData}
          value={category}
          onChange={(val) => setCategory(val ?? "")}
          required
          mt="sm"
        />

        <Button fullWidth mt="md" type="submit" color="teal">
          Add Expense
        </Button>
      </form>
    </Paper>
  );
}