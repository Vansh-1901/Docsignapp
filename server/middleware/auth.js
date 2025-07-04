import jwt from 'jsonwebtoken';
import User from '../models/User.js';

//Protect routed - require JWT
export const protect = async (req, res, next) => {
    let token;

    // Get token from header
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    }
    
    if(!token || token.split('.').length !== 3) {
        return res.status(401).json({sucess: false, error: 'Not autorized to access this route'});
    }

    try {
        //verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded token:', decoded);// debug log

        //Get user from token
        req.user = await User.findById(decoded.id).select('-password');

        if(!req.user) {
            console.log('User not found for token');
            return res.status(401).json({sucess: false, error: 'User not found'});
        }
        next();
    } catch (error) {
        console.log('Token verification failed:', error.message);
        return res.status(401).json({success:false, error: 'Not authorized, token failed'});
    }
};
