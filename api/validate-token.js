// Vercel serverless function for JWT token validation
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ 
      success: false, 
      error: 'Token is required' 
    });
  }

  const JWT_SECRET = process.env.JWT_SECRET || 'default-jwt-secret-change-in-production';
  
  try {
    // Verify and decode the JWT token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if token is for game access
    if (decoded.authorized === true) {
      return res.status(200).json({
        success: true,
        message: 'Token is valid',
        decoded: {
          authorized: decoded.authorized,
          exp: decoded.exp,
          iat: decoded.iat
        }
      });
    } else {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token has expired'
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    } else {
      console.error('Token validation error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error'
      });
    }
  }
}