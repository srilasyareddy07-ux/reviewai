import express from 'express';
import prisma from '../prisma/client.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const [totalReviews, recentReviews, issueStats, scoreAverages] = await Promise.all([
      prisma.review.count({ where: { userId } }),
      prisma.review.findMany({
        where: { userId, status: 'completed' },
        include: { issues: true },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      prisma.issue.groupBy({
        by: ['severity'],
        where: { review: { userId } },
        _count: { severity: true }
      }),
      prisma.review.aggregate({
        where: { userId, status: 'completed' },
        _avg: { mergeScore: true, qualityScore: true, securityScore: true }
      })
    ]);

    // Issues by category
    const categoryStats = await prisma.issue.groupBy({
      by: ['category'],
      where: { review: { userId } },
      _count: { category: true }
    });

    // Reviews over last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentActivity = await prisma.review.findMany({
      where: { userId, createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true, mergeScore: true, status: true },
      orderBy: { createdAt: 'asc' }
    });

    const totalIssues = await prisma.issue.count({ where: { review: { userId } } });
    const criticalIssues = await prisma.issue.count({ where: { review: { userId }, severity: 'critical' } });

    res.json({
      totalReviews,
      totalIssues,
      criticalIssues,
      recentReviews,
      issuesBySeverity: issueStats.map(s => ({ severity: s.severity, count: s._count.severity })),
      issuesByCategory: categoryStats.map(c => ({ category: c.category, count: c._count.category })),
      averageScores: {
        merge: Math.round(scoreAverages._avg.mergeScore || 0),
        quality: Math.round(scoreAverages._avg.qualityScore || 0),
        security: Math.round(scoreAverages._avg.securityScore || 0),
      },
      recentActivity
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;
