import axios from 'axios';

const getGithubHeaders = (token) => ({
  Accept: 'application/vnd.github.v3+json',
  'User-Agent': 'ReviewAI/1.0',
  ...(token && { Authorization: `Bearer ${token}` })
});

export const parsePrUrl = (url) => {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/);
  if (!match) throw new Error('Invalid GitHub PR URL format');
  return { owner: match[1], repo: match[2], prNumber: parseInt(match[3]) };
};

export const fetchPullRequest = async (prUrl, token = null) => {
  const githubToken = token || process.env.GITHUB_TOKEN;
  const { owner, repo, prNumber } = parsePrUrl(prUrl);
  const headers = getGithubHeaders(githubToken);
  const baseUrl = `https://api.github.com/repos/${owner}/${repo}`;

  try {
    const [prRes, filesRes, commitsRes] = await Promise.all([
      axios.get(`${baseUrl}/pulls/${prNumber}`, { headers }),
      axios.get(`${baseUrl}/pulls/${prNumber}/files`, { headers }),
      axios.get(`${baseUrl}/pulls/${prNumber}/commits`, { headers }),
    ]);

    const pr = prRes.data;
    const files = filesRes.data;
    const commits = commitsRes.data;

    // Build diff content
    const diffContent = files
      .filter(f => f.patch)
      .map(f => `// File: ${f.filename}\n// Status: ${f.status}\n${f.patch}`)
      .join('\n\n---\n\n');

    // Extract actual changed code (added lines)
    const addedCode = files
      .filter(f => f.patch)
      .map(f => {
        const addedLines = f.patch
          .split('\n')
          .filter(line => line.startsWith('+') && !line.startsWith('+++'))
          .map(line => line.substring(1))
          .join('\n');
        return `// ${f.filename}\n${addedLines}`;
      })
      .join('\n\n');

    // Detect primary language
    const extensionMap = {
      js: 'javascript', ts: 'typescript', jsx: 'javascript', tsx: 'typescript',
      py: 'python', java: 'java', cpp: 'cpp', cc: 'cpp', go: 'go',
      rs: 'rust', rb: 'ruby', php: 'php', cs: 'csharp', swift: 'swift'
    };
    const mainFile = files[0]?.filename || '';
    const ext = mainFile.split('.').pop()?.toLowerCase();
    const language = extensionMap[ext] || 'javascript';

    return {
      title: pr.title,
      description: pr.body || '',
      author: pr.user.login,
      branch: pr.head.ref,
      baseBranch: pr.base.ref,
      commits: commits.length,
      changedFiles: files.length,
      additions: pr.additions,
      deletions: pr.deletions,
      files: files.map(f => ({
        filename: f.filename,
        status: f.status,
        additions: f.additions,
        deletions: f.deletions,
        patch: f.patch
      })),
      diffContent,
      codeToAnalyze: addedCode || diffContent,
      language,
      repoName: `${owner}/${repo}`,
      prNumber,
    };
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error('PR not found. Make sure the repository is public or you have a valid GitHub token.');
    }
    if (error.response?.status === 403) {
      throw new Error('GitHub API rate limit exceeded or access denied. Add a GitHub token in settings.');
    }
    throw new Error(`GitHub API error: ${error.message}`);
  }
};
