import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ExpensesProvider } from "./store/ExpensesContext"; // ✅ add this import

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ExpensesProvider>
      <App />
    </ExpensesProvider>
  </React.StrictMode>
);
