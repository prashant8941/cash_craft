// backend/routes/auth.js (UPDATED with Login Route)

import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config(); // Load JWT_SECRET from .env

const router = express.Router();

// --- REGISTRATION ROUTE (Existing) ---
// @route   POST api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        user = new User({ email, password });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();
        
        // After registration, we often log the user in immediately (or redirect to login)
        // For simplicity, we'll just return a success message here as before.

        res.status(201).json({ msg: 'User registered successfully', userId: user._id });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// --- LOGIN ROUTE (NEW) ---
// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Check if user exists
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // 2. Compare the plain text password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // 3. Create and return a JSON Web Token (JWT)
        const payload = {
            user: {
                id: user.id // MongoDB's user ID
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET, // Your secret key from .env
            { expiresIn: '1h' }, // Token expiration time
            (err, token) => {
                if (err) throw err;
                // Success: Send the token back to the client
                res.json({ token }); 
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});


export default router;