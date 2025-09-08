// Vercel serverless function for secure password verification
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ 
      success: false, 
      error: 'Password is required' 
    });
  }

  // Get the correct password and JWT secret from environment variables
  const CORRECT_PASSWORD = process.env.GAME_PASSWORD;
  const JWT_SECRET = process.env.JWT_SECRET;
  
  try {
    // Simple comparison (in production, you might want to hash passwords)
    const isValid = password === CORRECT_PASSWORD;
    
    if (isValid) {
      // Generate JWT token with expiration
      const payload = {
        authorized: true,
        iat: Math.floor(Date.now() / 1000), // issued at
        exp: Math.floor(Date.now() / 1000) + (4 * 60 * 60), // expires in 4 hours
      };
      
      const token = jwt.sign(payload, JWT_SECRET);
      
      return res.status(200).json({
        success: true,
        message: 'Access granted',
        token: token,
        expiresIn: 4 * 60 * 60 // 4 hours in seconds
      });
    } else {
      // Add a small delay to prevent brute force attacks
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return res.status(401).json({
        success: false,
        error: 'Invalid password'
      });
    }
  } catch (error) {
    console.error('Password verification error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
}