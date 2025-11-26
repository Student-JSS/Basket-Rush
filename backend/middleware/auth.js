import User from '../models/userModel.js';
import JWT from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your _jwt_secret_here'

export default async function authMiddleSearch(req,res,next) {
    const token = 
    req.cookies?.token ||
    (req.headers.authorization?.startsWith('Bearer')
    ? req.headers.authorization.split(' ')[1]
      : null);

      if(!token){
        return res
        .status(401)
        .json({ success: false, message: "Not authorized - token missing"})

      }

      try {
        const payload = JWT.verify(token, JWT_SECRET);
        const user = await User.findById(payload.id).select('-password');

        if(!user) {
            return res
            .status(401)
            .json({ success: false, message: 'User no longer exists' })
        }
        req.user = user;
        next();

      }
      catch (err) {
        console.error('Auth middleware error:', err);
        const message = err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid Token';
        res.status(401).json({ success: false, message})
      }
}