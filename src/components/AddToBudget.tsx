import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Button, TextInput, NumberInput } from "@mantine/core";
import HistoryContext from "../store/HistoryContext";
import CategoriesContext from "../store/CategoriesContext";

const AddToBudget = () => {
  const { addCategory } = useContext(CategoriesContext);
  const { addHistoryElement } = useContext(HistoryContext);

  const [label, setLabel] = useState("");
  const [value, setValue] = useState<number | null>(null);
  const navigate = useNavigate();

  const handleAddBudget = async () => {
    const numericValue = Number(value);

    if (label === "" || value === null || numericValue <= 0 || Number.isNaN(numericValue)) {
      alert(
        "Invalid Entries. Make sure the label is not empty and the amount is greater than zero."
      );
      return;
    }

    const newBudgetData = {
      amount: numericValue,
      historyLabel: label,
    };

    try {
      // API Call to add/update budget
      const res = await fetch("http://localhost:5000/api/categories/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBudgetData),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(data.message || "Failed to add/update budget");

      // Update local state/context 
      addCategory({
        label: "Budget",
        id: data.category.id || crypto.randomUUID(), 
        amount: numericValue,
      });

      addHistoryElement({
        label: label,
        amount: numericValue,
        id: data.history.id || crypto.randomUUID(), 
        type: "Budget",
        dateCreated: "",
        category: "Budget",
      });

      alert("Budget added/updated successfully!");
      navigate("/home");
    } catch (err) {
      console.error(" Error adding budget:", err);
      alert("Failed to add budget. Check console for details.");
    }
  };

  return (
    <div>
      <TextInput
        onChange={(e) => setLabel(e.currentTarget.value)}
        mt={20}
        size="md"
        w="40%"
        placeholder="Ex: Christmas bonus"
        label="Label"
        withAsterisk
        value={label}
      />
      
      <NumberInput 
        onChange={(val) => setValue(val === undefined || val === null ? null : val)}
        mt={20}
        size="md"
        w="40%"
        placeholder="Ex: 3000"
        label="Amount"
        withAsterisk
        value={value ?? undefined} // Corrected Mantine prop type
        min={0}
      />
      <Button mt={20} onClick={handleAddBudget}>
        Add To Budget
      </Button>
    </div>
  );
};

export default AddToBudget;

