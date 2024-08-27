import mongoose, { Schema } from 'mongoose';

// Define the Poll schema
const pollSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true,
  },
  options: [
    {
      optionText: {
        type: String,
        required: true,
      },
      votes: {
        type: Number,
        default: 0, // Initialize votes to 0
      },
    },
  ],
  creator_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create and export the Poll model
export const Poll = mongoose.model('Poll', pollSchema);
