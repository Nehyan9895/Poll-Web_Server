import mongoose, { CallbackError, Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    votedPolls: string[]; // Array of poll IDs that the user has voted in
}

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    votedPolls: {
        type: [String], // Array of poll IDs
        default: []
    }
});

userSchema.pre('save', async function (next) {
    if (this.isModified('password') || this.isNew) {
        try {
            if (!this.password.startsWith('$2a$')) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(this.password, salt);
                this.password = hashedPassword;
            }
            next();
        } catch (err) {
            next(err as CallbackError);
        }
    } else {
        return next();
    }
});

export const User = mongoose.model<IUser>('User', userSchema);
