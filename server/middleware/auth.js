import jwt from 'jsonwebtoken';

// Supabase JWT secret is derived from the project's JWT secret
// For Supabase, we need to verify the token against the JWT secret from the project
const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET || 'xqtDZBQxLyqfvCfU/4P6T0D+SqazHQSmVUQCBtQpLOCXPIJFu5lYVcXMnLyJiJCuVRCxDJ7hA8u3gFN2fYcVLg==';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({ error: 'Access token required' });
    }

    // Verify Supabase JWT token
    const decoded = jwt.verify(token, SUPABASE_JWT_SECRET);

    if (!decoded || !decoded.sub) {
      console.error('❌ Invalid token payload');
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    console.log('✅ User authenticated:', decoded.email);

    // Attach user to request
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      name: decoded.user_metadata?.name || decoded.email
    };

    next();
  } catch (err) {
    console.error('❌ Auth middleware error:', err.message);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};
