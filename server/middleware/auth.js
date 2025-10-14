import { supabase } from '../config/supabase.js';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({ error: 'Access token required' });
    }

    // Verify Supabase JWT token using service role key
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error) {
      console.error('❌ Token verification error:', error.message);
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    if (!user) {
      console.error('❌ No user found for token');
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    console.log('✅ User authenticated:', user.email);

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || user.email
    };

    next();
  } catch (err) {
    console.error('❌ Auth middleware error:', err);
    return res.status(500).json({ error: 'Authentication failed' });
  }
};
