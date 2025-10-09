import dotenv from 'dotenv';
dotenv.config({ path: '.env.development.local' });
import jwt from 'jsonwebtoken';

// Middleware to verify JWT and extract user ID
export const authorize = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization header missing or malformed' });
    }

    const token = authHeader.split(' ')[1]; //Loại bỏ Bearer ở đầu
    if (!token) {
      return res.status(401).json({ message: 'Token missing' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET); //payload đã encode khi tạo token

    req.userId = decoded.userId; 
    next();
  }
  catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Middleware to allow access only to the user themselves
export const allowSelfOrAdmin = (req, res, next) => {
  if (req.userId !== req.params.id && req.userId !== process.env.ADMIN_ID) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
};

// Middleware to allow access only to the admin
export const allowAdminOnly = (req, res, next) => {
  if (req.userId !== process.env.ADMIN_ID) {
    return res.status(403).json({ message: 'Admin only' });
  }
  next();
};

