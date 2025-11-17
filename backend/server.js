
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import expenseRoutes from "./routes/expenseRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import authRoutes from "./routes/auth.js"; 

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        console.log("MongoDB Connected successfully!");
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => 
            console.log(`Server running on port ${PORT}`)
        );
        
    } catch (err) {
        console.error("DB Connection Error:", err.message);
        console.error("Please check your MONGO_URI, IP Whitelist, and Database User Credentials.");
        process.exit(1); 
    }
};

app.use("/api/expenses", expenseRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/auth", authRoutes); 
connectDB();