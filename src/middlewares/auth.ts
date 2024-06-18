// middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/users';

const jwtSecret = 'random_secret_key'; // Replace with your own secret

export const authenticateJWT = async (req: Request, res: Response, next: NextFunction) => {
  const [preset, token] = req.headers.authorization?.split(' ') || [];
  if (token && preset=='Bearer') {
    try {
      const decoded: any = jwt.verify(token, jwtSecret);
      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });
      if (!user) {
        throw new Error('User not found');
      }
      req.user = user;
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Unauthorized' });
    }
  }
  next();
};
