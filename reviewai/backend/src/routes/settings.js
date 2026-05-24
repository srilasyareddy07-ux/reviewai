import express from 'express';
import prisma from '../prisma/client.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const settings = await prisma.settings.findUnique({ where: { userId: req.user.id } });
    res.json({ settings });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

router.put('/', authenticate, async (req, res) => {
  try {
    const { darkMode, emailNotifications, autoAnalyze, githubWebhook, defaultLanguage, groqApiKey, githubToken } = req.body;

    const settings = await prisma.settings.upsert({
      where: { userId: req.user.id },
      update: { darkMode, emailNotifications, autoAnalyze, githubWebhook, defaultLanguage, groqApiKey, githubToken },
      create: { userId: req.user.id, darkMode, emailNotifications, autoAnalyze, githubWebhook, defaultLanguage, groqApiKey, githubToken }
    });

    // Also update github token on user model
    if (githubToken !== undefined) {
      await prisma.user.update({ where: { id: req.user.id }, data: { githubToken } });
    }

    res.json({ success: true, settings });
  } catch (error) {
    console.error('Settings update error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

export default router;
