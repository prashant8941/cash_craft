// backend/models/User.js

import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true, // Ensures no two users have the same email
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    // You can add more fields like name, createdAt, etc., here later
}, {
    timestamps: true // Adds createdAt and updatedAt timestamps
});

export default mongoose.model('User', UserSchema);