import { createContext, useState, useEffect } from "react";

interface Expense {
  _id?: string;
  title: string;
  amount: number;
  category: string;
  dateCreated?: string;
}

interface ExpensesContextType {
  expenses: Expense[];
  addExpense: (expense: Expense) => void;
  setExpenses: (arr: Expense[]) => void;
}

const ExpensesContext = createContext<ExpensesContextType>({
  expenses: [],
  addExpense: () => {},
  setExpenses: () => {},
});

export const ExpensesProvider = ({ children }: { children: React.ReactNode }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // fetch expenses from backend once on load
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("http://localhost:5000/api/expenses");
        if (!res.ok) throw new Error("Failed to fetch expenses");
        const data = await res.json();
        setExpenses(data || []);
      } catch (err) {
        console.error("Could not load expenses from server:", err);
      }
    }
    load();
  }, []);

  const addExpense = (expense: Expense) => {
    // prefer server-provided _id if present, but keep the object as-is
    setExpenses((prev) => [expense, ...prev]);
  };

  return (
    <ExpensesContext.Provider value={{ expenses, addExpense, setExpenses }}>
      {children}
    </ExpensesContext.Provider>
  );
};

export default ExpensesContext;
