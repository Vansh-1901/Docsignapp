
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '30d'
    });
};
// Register new user
export const register = async (req, res, next) => {
    try {
        const {name, email, password} = req.body;

        //Check if user already exits
        const existingUser = await User.findOne({ email });
        if(existingUser) {
            return res.status(400).json({ success: false, error: 'Email already exists' });
        }

        // create new user (password gets hashed in pre-save middleware)
        const user = await User.create({name, email, password});

        //Generate JWT token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email:user.email
            }
        });
    } catch (error) {
        next(error);
    }
};

// Login user
export const login = async (req, res, next) => {
    try {
        const {email, password} = req.body;

        //check if user exists
        const user = await User.findOne({email}).select('+password');
        if(!user){
            return res.status(401).json({success: false, error: 'Invalid credentials'});
        }

        // check if password matches
        const isMatch = await user.comparePassword(password);
        if(!isMatch){
            return res.status(401).json({sucess: false, error: 'Invalid credentials'});
        }

        // Generate JWT tiken
        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get current user
export const getCurrentUser = async (req, res, next) => {
    try {
        res.status(200).json({
            success: true,
            user: req.user
        });
    } catch (error) {
        next(error);
    }
}