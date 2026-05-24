import Groq from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config();

const getGroqClient = (apiKey) => {
  const key = apiKey || process.env.GROQ_API_KEY;
  if (!key) throw new Error('GROQ_API_KEY is required');
  return new Groq({ apiKey: key });
};

export const analyzeCode = async (code, language = 'javascript', prContext = '', userApiKey = null) => {
  const groq = getGroqClient(userApiKey);

  const systemPrompt = `You are ReviewAI, an expert code review assistant specializing in security, performance, and code quality.

Analyze the provided code and return a JSON object with this EXACT structure:
{
  "summary": "Brief 2-3 sentence overall assessment",
  "mergeScore": <number 0-100>,
  "qualityScore": <number 0-100>,
  "securityScore": <number 0-100>,
  "issues": [
    {
      "title": "Issue title",
      "description": "Detailed explanation of the problem and why it matters",
      "severity": "critical|high|medium|low|info",
      "category": "security|performance|bug|smell|style",
      "lineNumber": <number or null>,
      "originalCode": "the problematic code snippet",
      "fixedCode": "the corrected code snippet",
      "confidence": <number 0-1>
    }
  ]
}

Severity guide:
- critical: Security vulnerabilities, data loss risks, crashes
- high: Bugs, major security issues, significant performance problems
- medium: Code smells, minor security concerns, moderate performance issues
- low: Style issues, naming conventions, minor improvements
- info: Suggestions, best practices, optional improvements

Be thorough. Find ALL issues. Provide specific, actionable fixes.
Return ONLY valid JSON, no markdown, no explanation.`;

  const userPrompt = `Language: ${language}
${prContext ? `PR Context: ${prContext}\n` : ''}
Code to analyze:
\`\`\`${language}
${code}
\`\`\``;

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.1,
    max_tokens: 4096,
  });

  const content = completion.choices[0]?.message?.content || '{}';
  
  // Clean JSON
  const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned);
};

export const generateFix = async (code, issue, language = 'javascript', userApiKey = null) => {
  const groq = getGroqClient(userApiKey);

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `You are an expert code fixer. Given problematic code and an issue description, provide the corrected code.
Return ONLY a JSON object:
{
  "fixedCode": "the complete fixed code",
  "explanation": "brief explanation of changes made",
  "improvements": ["list", "of", "specific", "improvements"]
}
No markdown, no extra text.`
      },
      {
        role: 'user',
        content: `Language: ${language}
Issue: ${issue.title} - ${issue.description}
Severity: ${issue.severity}

Original Code:
\`\`\`${language}
${code}
\`\`\``
      }
    ],
    temperature: 0.1,
    max_tokens: 2048,
  });

  const content = completion.choices[0]?.message?.content || '{}';
  const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned);
};

export const chatAboutCode = async (messages, code = '', reviewContext = '', userApiKey = null) => {
  const groq = getGroqClient(userApiKey);

  const systemPrompt = `You are ReviewAI Assistant, an expert AI code reviewer and developer assistant.
You help developers understand code issues, security vulnerabilities, performance optimizations, and best practices.
Be concise, technical, and actionable. Use markdown formatting for code examples.
${code ? `\nCode context:\n\`\`\`\n${code}\n\`\`\`` : ''}
${reviewContext ? `\nReview context: ${reviewContext}` : ''}`;

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages
    ],
    temperature: 0.7,
    max_tokens: 2048,
  });

  return completion.choices[0]?.message?.content || 'I could not generate a response.';
};

export const scanSecurity = async (code, language = 'javascript', userApiKey = null) => {
  const groq = getGroqClient(userApiKey);

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `You are a security expert. Analyze code for security vulnerabilities only.
Return JSON:
{
  "vulnerabilities": [
    {
      "title": "vulnerability name",
      "cve": "CVE number if applicable or null",
      "description": "detailed description",
      "severity": "critical|high|medium|low",
      "lineNumber": null or number,
      "originalCode": "vulnerable snippet",
      "fixedCode": "secure version",
      "owasp": "OWASP category if applicable"
    }
  ],
  "securityScore": <0-100>,
  "riskLevel": "critical|high|medium|low|safe"
}
Return ONLY JSON.`
      },
      {
        role: 'user',
        content: `Language: ${language}\n\nCode:\n\`\`\`${language}\n${code}\n\`\`\``
      }
    ],
    temperature: 0.1,
    max_tokens: 2048,
  });

  const content = completion.choices[0]?.message?.content || '{}';
  const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned);
};
