import express from 'express';
import prisma from '../prisma/client.js';

const router = express.Router();

// Register or login user (called after Firebase auth on frontend)
router.post('/sync', async (req, res) => {
  try {
    const { firebaseUid, email, displayName, photoURL } = req.body;

    if (!firebaseUid || !email) {
      return res.status(400).json({ error: 'firebaseUid and email are required' });
    }

    const user = await prisma.user.upsert({
      where: { firebaseUid },
      update: { email, displayName, photoURL, updatedAt: new Date() },
      create: { firebaseUid, email, displayName, photoURL },
      include: { settings: true }
    });

    // Create default settings if not exists
    if (!user.settings) {
      await prisma.settings.create({
        data: { userId: user.id }
      });
    }

    res.json({ success: true, user: { id: user.id, email: user.email, displayName: user.displayName, photoURL: user.photoURL } });
  } catch (error) {
    console.error('Auth sync error:', error);
    res.status(500).json({ error: 'Failed to sync user' });
  }
});

// Get user profile
router.get('/me', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ error: 'Not authenticated' });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { settings: true, _count: { select: { reviews: true } } }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

export default router;
