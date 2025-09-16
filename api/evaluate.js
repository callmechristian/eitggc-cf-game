// Vercel serverless function for Claude AI evaluation
// Keeps all prompts and evaluation logic secure on the backend

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { scenario, userResponse } = req.body;
  if (!scenario || !userResponse) {
    return res.status(400).json({ 
      success: false, 
      error: 'Scenario and userResponse are required' 
    });
  }

  const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
  if (!CLAUDE_API_KEY) {
    return res.status(500).json({ 
      success: false, 
      error: 'Claude API key not configured' 
    });
  }

  try {
    const prompt = createEvaluationPrompt(scenario, userResponse);
    const claudeResponse = await callClaudeAPI(CLAUDE_API_KEY, prompt);
    
    if (claudeResponse.success) {
      const evaluation = parseAIResponse(claudeResponse.data);
      return res.status(200).json({
        success: true,
        data: evaluation
      });
    } else {
      return res.status(500).json({
        success: false,
        error: getUserFriendlyErrorMessage(claudeResponse.error)
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

function createEvaluationPrompt(scenario, userResponse) {
  const isGenuine = scenario.isGenuine || false;
  const formattingRules = `                              
                          MARKDOWN INSTRUCTIONS:
                          (do not nest same types, don't break the JSON format)
                          - **bold**
                          - *italic*
                          - backticks for technical terms, passwords, file names, links/URLs, and code
                          - «french guillemets» for quoting
                          - ![bracket exclamation marks!] for warnings
                          - +[bracket plus signs+] for success messages
                          - -[bracket minus signs-] for failures
                          - #hashtags# for cybersecurity terms (phishing, malware, encryption, firewall, etc.)
                          - 1), 2), 3), etc. for numbered lists
                          `;

  if (isGenuine) {
    return `You are evaluating a GENUINE scenario in "Hacked by AI" where there was NO THREAT and the player should have acted normally.

GENUINE SCENARIO:
Title: ${scenario.title}
Description: ${scenario.description}
Objective: ${scenario.objective}

PLAYER RESPONSE: "${userResponse}"

EVALUATION RULES FOR GENUINE SCENARIOS:
1. This was a legitimate, safe opportunity with NO cybersecurity threats
2. The correct action was to engage normally and enjoy the opportunity
3. If they acted normally/positively - they should NOT be "hacked" (they win!)
4. Some verifying is fine, but if they were overly suspicious/paranoid - you should create a series of unfortunate events (humorous in the misfortune but not shameful) to what they missed out and what happened. It should be educational, and focus WHY this wasn't a threat.

RESPONSE FORMAT (JSON):
{
  "hacked": false (only influences score, not game over),
  "explanation": "If they acted normally: Congratulate them for recognizing a genuine opportunity and not being paranoid! If they were paranoid: Create a series of unfortunate events (humorous in the misfortune) to what they missed out and what happened.",
  "correctAction": "The correct action was to engage normally with this legitimate opportunity. Give an example of how it would have looked if it was a scam.",
  "actionRating": integer (1-10, where 10 is perfect normal engagement, 1 is extreme paranoia)
}

${formattingRules}

Examples for appropriate evaluations:
- Responding lovingly to genuine message from grandma → Good!
- Being overly suspicious of legitimate friend messages → Missed out!
- Enjoying a real scholarship opportunity → Excellent!
- Refusing a genuine job interview → Missed out!

You should be fun and educational. Paranoid answers should result in a series of unfortunate events. Vague but positive responses are okay. Evaluate the response. Return valid JSON only!`;
  } else {
    return `You are a strict cybersecurity AI evaluator for a game called "Hacked by AI". Your job is to determine if a player's response to a cybersecurity scenario is adequate to prevent being "hacked".

SCENARIO:
Title: ${scenario.title}
Description: ${scenario.description}
Objective: ${scenario.objective}

PLAYER RESPONSE: "${userResponse}"

EVALUATION RULES:
1. Be strict - only very specific, accurate cybersecurity responses should pass (at a highschool level)
2. The player should demonstrate clear understanding of proper cybersecurity practices
3. Vague responses like "be careful" or "check it" should result in being hacked
4. The response must include specific actions or verification methods
5. Consider real-world cybersecurity best practices
6. The game should be challenging and fun - most responses should result in being "hacked"

RESPONSE FORMAT (JSON):
{
  "hacked": boolean,
  "explanation": "Create a series of unfortunate events of what happened step-by-step (if hacked) or congratulations (if safe). Keep it funny! Be witty and slightly sarcastic.",
  "correctAction": "Detailed explanation of the proper cybersecurity approach for this scenario.",
  "actionRating": integer (1-10, where 10 is perfect)
}

${formattingRules}


Examples of responses that should PASS:
- For phishing: "Check the domain for typosquatting - amaz0n uses zero instead of 'o', verify sender authenticity, delete email and report as phishing"
- For USB: "Do not plug the USB into any computer, report to security immediately, treat as potential malware delivery"

Examples that should FAIL:
- "Be careful"
- "Check if it's real"
- "Think about it"
- "Use common sense"

You should be unforgiving and fun, but educational. Incomplete/insufficient answers should result in a series of unfortunate events. Evaluate the response. Return valid JSON only!`;
  }
}

async function callClaudeAPI(apiKey, prompt) {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-opus-4-1-20250805',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, data: data.content[0].text };
    } else {
      const errorText = await response.text();
      return { success: false, error: errorText };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function parseAIResponse(claudeResponse) {
  try {
    // Extract JSON from Claude response if it's wrapped in other text
    const jsonMatch = claudeResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      // Try parsing the entire response as JSON
      return JSON.parse(claudeResponse);
    }
  } catch (error) {
    console.error('Error parsing Claude response:', error);
    throw new Error('Failed to parse AI response. The AI evaluation was malformed.');
  }
}

function getUserFriendlyErrorMessage(error) {
  if (typeof error === 'string') {
    const errorLower = error.toLowerCase();
    if (errorLower.includes('credit balance is too low')) {
      return 'API requests exhausted.';
    }
    if (errorLower.includes('rate limit')) {
      return 'Too many requests. Try again later.';
    }
    if (errorLower.includes('invalid request')) {
      return 'Invalid AI request format.';
    }
    if (errorLower.includes('authentication')) {
      return 'AI service authentication failed. Check API key.';
    }
  }
  
  return 'AI service temporarily unavailable';
}