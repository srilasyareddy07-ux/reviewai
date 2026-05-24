import express from 'express';
import prisma from '../prisma/client.js';
import { analyzeCode, generateFix, scanSecurity } from '../services/ai.service.js';
import { fetchPullRequest } from '../services/github.service.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Analyze a PR by URL
router.post('/analyze-pr', authenticate, async (req, res) => {
  try {
    const { prUrl } = req.body;
    if (!prUrl) return res.status(400).json({ error: 'prUrl is required' });

    const settings = await prisma.settings.findUnique({ where: { userId: req.user.id } });
    const githubToken = settings?.githubToken || process.env.GITHUB_TOKEN;
    const groqApiKey = settings?.groqApiKey || null;

    // Fetch PR from GitHub
    const prData = await fetchPullRequest(prUrl, githubToken);

    // Create review record
    const review = await prisma.review.create({
      data: {
        userId: req.user.id,
        prUrl,
        repoName: prData.repoName,
        prNumber: prData.prNumber,
        prTitle: prData.title,
        language: prData.language,
        rawDiff: prData.diffContent,
        codeSnippet: prData.codeToAnalyze,
        status: 'analyzing'
      }
    });

    // AI Analysis
    const prContext = `PR: ${prData.title}\nBranch: ${prData.branch} → ${prData.baseBranch}\nAuthor: ${prData.author}\nFiles changed: ${prData.changedFiles}`;
    const analysis = await analyzeCode(prData.codeToAnalyze, prData.language, prContext, groqApiKey);

    // Save issues
    if (analysis.issues?.length > 0) {
      await prisma.issue.createMany({
        data: analysis.issues.map(issue => ({
          reviewId: review.id,
          title: issue.title || 'Unknown Issue',
          description: issue.description || '',
          severity: issue.severity || 'medium',
          category: issue.category || 'bug',
          lineNumber: issue.lineNumber || null,
          originalCode: issue.originalCode || null,
          fixedCode: issue.fixedCode || null,
          confidence: issue.confidence || 0.8,
        }))
      });
    }

    // Update review with scores
    const updatedReview = await prisma.review.update({
      where: { id: review.id },
      data: {
        mergeScore: analysis.mergeScore,
        qualityScore: analysis.qualityScore,
        securityScore: analysis.securityScore,
        summary: analysis.summary,
        status: 'completed'
      },
      include: { issues: true }
    });

    res.json({ success: true, review: updatedReview, prData });
  } catch (error) {
    console.error('PR analysis error:', error);
    res.status(500).json({ error: error.message || 'Analysis failed' });
  }
});

// Analyze pasted code
router.post('/analyze-code', authenticate, async (req, res) => {
  try {
    const { code, language = 'javascript' } = req.body;
    if (!code) return res.status(400).json({ error: 'code is required' });

    const settings = await prisma.settings.findUnique({ where: { userId: req.user.id } });
    const groqApiKey = settings?.groqApiKey || null;

    const review = await prisma.review.create({
      data: {
        userId: req.user.id,
        codeSnippet: code,
        language,
        status: 'analyzing'
      }
    });

    const analysis = await analyzeCode(code, language, '', groqApiKey);

    if (analysis.issues?.length > 0) {
      await prisma.issue.createMany({
        data: analysis.issues.map(issue => ({
          reviewId: review.id,
          title: issue.title || 'Issue',
          description: issue.description || '',
          severity: issue.severity || 'medium',
          category: issue.category || 'bug',
          lineNumber: issue.lineNumber || null,
          originalCode: issue.originalCode || null,
          fixedCode: issue.fixedCode || null,
          confidence: issue.confidence || 0.8,
        }))
      });
    }

    const updatedReview = await prisma.review.update({
      where: { id: review.id },
      data: {
        mergeScore: analysis.mergeScore,
        qualityScore: analysis.qualityScore,
        securityScore: analysis.securityScore,
        summary: analysis.summary,
        status: 'completed'
      },
      include: { issues: true }
    });

    res.json({ success: true, review: updatedReview });
  } catch (error) {
    console.error('Code analysis error:', error);
    res.status(500).json({ error: error.message || 'Analysis failed' });
  }
});

// Get all reviews for user
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { userId: req.user.id },
        include: { issues: { orderBy: { createdAt: 'asc' } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.review.count({ where: { userId: req.user.id } })
    ]);

    res.json({ reviews, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Get single review
router.get('/:id', authenticate, async (req, res) => {
  try {
    const review = await prisma.review.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: { issues: { orderBy: { createdAt: 'asc' } }, chats: { orderBy: { createdAt: 'asc' } } }
    });
    if (!review) return res.status(404).json({ error: 'Review not found' });
    res.json({ review });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch review' });
  }
});

// Generate AI fix for a specific issue
router.post('/:id/fix', authenticate, async (req, res) => {
  try {
    const { issueId } = req.body;
    const review = await prisma.review.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: { issues: true }
    });
    if (!review) return res.status(404).json({ error: 'Review not found' });

    const issue = review.issues.find(i => i.id === issueId);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    const settings = await prisma.settings.findUnique({ where: { userId: req.user.id } });
    const fix = await generateFix(review.codeSnippet || issue.originalCode || '', issue, review.language, settings?.groqApiKey);

    // Update issue with fix
    await prisma.issue.update({
      where: { id: issueId },
      data: { fixedCode: fix.fixedCode }
    });

    res.json({ success: true, fix });
  } catch (error) {
    console.error('Fix generation error:', error);
    res.status(500).json({ error: 'Failed to generate fix' });
  }
});

// Security scan only
router.post('/security-scan', authenticate, async (req, res) => {
  try {
    const { code, language = 'javascript' } = req.body;
    if (!code) return res.status(400).json({ error: 'code is required' });

    const settings = await prisma.settings.findUnique({ where: { userId: req.user.id } });
    const result = await scanSecurity(code, language, settings?.groqApiKey);

    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ error: 'Security scan failed' });
  }
});

// Delete review
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await prisma.review.deleteMany({ where: { id: req.params.id, userId: req.user.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

export default router;
