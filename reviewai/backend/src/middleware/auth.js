import prisma from '../prisma/client.js';

// Simple middleware that extracts user from headers
// In production, verify Firebase JWT token here
export const authenticate = async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'];
    const authHeader = req.headers['authorization'];

    if (!userId && !authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // For demo: trust x-user-id header (in production, verify Firebase JWT)
    if (userId) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }
      req.user = user;
      return next();
    }

    // Firebase token verification would go here in production
    // const decodedToken = await admin.auth().verifyIdToken(token);
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'];
    if (userId) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user) req.user = user;
    }
    next();
  } catch (error) {
    next();
  }
};
