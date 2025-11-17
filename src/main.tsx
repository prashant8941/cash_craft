import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ExpensesProvider } from "./store/ExpensesContext"; // ✅ add this import

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <ExpensesProvider>
        <App />
      </ExpensesProvider>
    </BrowserRouter>
  </React.StrictMode>
);
