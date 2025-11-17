import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import expenseRoutes from "./routes/expenseRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js"; 

// Load environment variables from .env file
dotenv.config();

const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Database Connection Function ---
const connectDB = async () => {
    try {
        // Removed deprecated options: useNewUrlParser and useUnifiedTopology
        await mongoose.connect(process.env.MONGO_URI);
        
        console.log("✅ MongoDB Connected successfully!");
        
        // Start the server only after the DB is connected
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => 
            console.log(`🚀 Server running on port ${PORT}`)
        );
        
    } catch (err) {
        // If connection fails, log the error and exit the process
        console.error("❌ DB Connection Error:", err.message);
        console.error("Please check your MONGO_URI, IP Whitelist, and Database User Credentials.");
        process.exit(1); 
    }
};

// --- Routes ---
// The connection must be established before setting up routes that rely on it
app.use("/api/expenses", expenseRoutes);
app.use("/api/categories", categoryRoutes); 

// Initialise the Database Connection and Server Start
connectDB();