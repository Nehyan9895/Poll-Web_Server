import { User } from "../model/userModel";
import { Request, Response } from "express";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Poll } from "../model/pollModel";

const JWT_SECRET = process.env.JWT_SECRET || 'myjwtsecret';


class UserController {
    async signup(req: Request, res: Response) {
        try {
            let { username, email, password } = req.body
            const existingUser = await User.findOne({ email: email })

            if (existingUser) {
                throw new Error('This user already exists');
            }

            const salt = await bcrypt.genSalt(10);
            password = await bcrypt.hash(password, salt);

            const userData = {
                username: username,
                email: email,
                password: password
            }
            const user = new User(userData)
            await user.save();
            const message = 'User Registered Successfully'
            res.status(200).json(message)
        } catch (err) {
            if (err instanceof Error) {
                res.status(400).json(err.message);
            } else {
                res.status(400).json('An unknown error occurred');
            }
        }

    }

    async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email: email })

            if (!user) {
                throw new Error('User not exists')
            }

            const isPasswordValid = await bcrypt.compare(password, user.password)

            if (!isPasswordValid) {
                throw new Error('Invalid email or password')
            }

            const token = jwt.sign({ email: user.email, id: user._id }, JWT_SECRET, { expiresIn: '10h' });
            const response = { token, user: { email: user.email, id: user._id, username: user.username }, message: 'Candidate login successful' }

            res.status(200).json(response)

        } catch (err) {
            if (err instanceof Error) {
                res.status(400).json(err.message);
            } else {
                res.status(400).json('An unknown error occurred');
            }
        }
    }

    async createPoll(req: Request, res: Response) {
        try {
            const { question, options, createrId } = req.body;

            // Check if the user exists
            const user = await User.findById(createrId);
            if (!user) {
                throw new Error('User not found');
            }

            // Validate question and options
            if (!question || !options || options.length !== 4) {
                return res.status(400).json({ message: 'Poll question and exactly 4 options are required' });
            }

            // Structure the pollData with initial vote counts
            const pollData = {
                question,
                options: options.map((optionText: string) => ({
                    optionText,
                    votes: 0, // Initialize vote count to 0
                })),
                creator_id: user._id,
            };

            // Create and save the poll
            const poll = new Poll(pollData);
            await poll.save();

            // Add the username to the poll data before sending the response
            const pollResponse = {
                ...poll.toObject(), // Convert the poll document to a plain object
                creator_id: {
                    _id: user._id,
                    username: user.username
                }
            };

            // Respond with success message and the created poll including the username
            res.status(201).json({ message: 'Poll created successfully', poll: pollResponse });
        } catch (err) {
            if (err instanceof Error) {
                res.status(400).json(err.message);
            } else {
                res.status(400).json('An unknown error occurred');
            }
        }
    }


    async getAllPolls(req: Request, res: Response) {
        try {
            const polls = await Poll.find().populate('creator_id', 'username').sort({ createdAt: -1 });;

            res.status(200).json(polls);
        } catch (err) {
            if (err instanceof Error) {
                res.status(400).json(err.message);
            } else {
                res.status(400).json('An unknown error occurred');
            }
        }
    }

    async getPollsByCreatorId(req:Request,res:Response){
        try {
            const id = req.params.id;
            const polls = await Poll.find({creator_id:id}).populate('creator_id', 'username').sort({ createdAt: -1 });
            res.status(200).json(polls)
        } catch (err) {
            if (err instanceof Error) {
                res.status(400).json(err.message);
            } else {
                res.status(400).json('An unknown error occurred');
            }
        }
    }

    async getPollById(req: Request, res: Response) {
        try {
            const id = req.params.pollId;
            const poll = await Poll.findById(id).populate('creator_id', 'username');

            res.status(200).json(poll);
        } catch (err) {
            if (err instanceof Error) {
                res.status(400).json(err.message);
            } else {
                res.status(400).json('An unknown error occurred');
            }
        }
    }

    async vote(req: Request, res: Response) {
        try {
            const pollId = req.params.id;
            const { optionText, userId } = req.body;
    
            // Find the poll by ID
            const poll = await Poll.findById(pollId);
    
            if (!poll) {
                return res.status(404).json({ message: 'Poll not found' });
            }
    
            // Find the user by ID
            const user = await User.findById(userId);
    
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
    
            // Check if the user has already voted in this poll
            if (user.votedPolls.includes(pollId)) {
                return res.status(400).json({ message: 'User has already voted in this poll' });
            }
    
            // Find the option and increment the vote count
            const option = poll.options.find(opt => opt.optionText === optionText);
    
            if (option) {
                option.votes += 1;
                await poll.save(); // Save the updated poll
    
                // Add pollId to user's votedPolls array
                user.votedPolls.push(pollId);
                await user.save();
    
                res.status(200).json({ message: 'Vote updated successfully', poll });
            } else {
                res.status(400).json({ message: 'Option not found' });
            }
    
        }catch (err) {
            if (err instanceof Error) {
                res.status(400).json(err.message);
            } else {
                res.status(400).json('An unknown error occurred');
            }
        }
    }

}

export const userController = new UserController();