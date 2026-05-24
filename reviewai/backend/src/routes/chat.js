import express from 'express';
import prisma from '../prisma/client.js';
import { chatAboutCode } from '../services/ai.service.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Send a chat message
router.post('/message', authenticate, async (req, res) => {
  try {
    const { message, reviewId, conversationHistory = [] } = req.body;
    if (!message) return res.status(400).json({ error: 'message is required' });

    let codeContext = '';
    let reviewContext = '';

    if (reviewId) {
      const review = await prisma.review.findFirst({
        where: { id: reviewId, userId: req.user.id },
        include: { issues: true }
      });
      if (review) {
        codeContext = review.codeSnippet || review.rawDiff || '';
        reviewContext = `PR: ${review.prTitle || 'Code Analysis'} | Issues found: ${review.issues.length} | Security Score: ${review.securityScore || 'N/A'} | Quality Score: ${review.qualityScore || 'N/A'}`;
      }
    }

    // Save user message
    await prisma.chat.create({
      data: { userId: req.user.id, reviewId: reviewId || null, role: 'user', content: message }
    });

    // Prepare conversation history for AI
    const messages = [
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
      { role: 'user', content: message }
    ];

    const settings = await prisma.settings.findUnique({ where: { userId: req.user.id } });
    const response = await chatAboutCode(messages, codeContext, reviewContext, settings?.groqApiKey);

    // Save AI response
    const aiChat = await prisma.chat.create({
      data: { userId: req.user.id, reviewId: reviewId || null, role: 'assistant', content: response }
    });

    res.json({ success: true, message: response, chatId: aiChat.id });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Chat failed: ' + error.message });
  }
});

// Get chat history for a review
router.get('/history/:reviewId', authenticate, async (req, res) => {
  try {
    const chats = await prisma.chat.findMany({
      where: { userId: req.user.id, reviewId: req.params.reviewId },
      orderBy: { createdAt: 'asc' }
    });
    res.json({ chats });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

// Get general chat history
router.get('/history', authenticate, async (req, res) => {
  try {
    const chats = await prisma.chat.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json({ chats });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

export default router;
