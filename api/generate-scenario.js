// Vercel serverless function for Claude AI scenario generation
// Keeps all prompts and scenario generation logic secure on the backend

// Theme tracking state - in production, consider using a database or external storage
let recentThemes = [];
const maxThemeHistory = 8;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { level = 0, isGenuine = false, titleHistory = [] } = req.body;

  const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
  if (!CLAUDE_API_KEY) {
    return res.status(500).json({ 
      success: false, 
      error: 'Claude API key not configured' 
    });
  }

  try {
    const prompt = createScenarioPrompt(level, isGenuine, titleHistory);
    const claudeResponse = await callClaudeAPI(CLAUDE_API_KEY, prompt);
    
    if (claudeResponse.success) {
      const scenario = parseScenarioResponse(claudeResponse.data);
      trackScenarioTheme(scenario);
      return res.status(200).json({
        success: true,
        data: scenario
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

function createScenarioPrompt(level = 0, isGenuine = false, titleHistory = []) {
  const titleHistoryText = titleHistory.length > 0
    ? `\n🚫 AVOID THESE PREVIOUSLY USED TITLES: ${titleHistory.join(', ')}\nMake sure your title is COMPLETELY DIFFERENT from these!\n`
    : '';

  const recentThemesText = recentThemes.length > 0
    ? `\n🎯 THEME DIVERSITY REQUIREMENT: You've recently used these themes: [${recentThemes.join(', ')}]\nYou MUST pick a COMPLETELY DIFFERENT theme from the list below. Be creative and original!\n`
    : '\n🎯 THEME DIVERSITY REQUIREMENT: Pick any theme from the comprehensive list below, but make it unique and engaging!\n';

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
    return `🎭 You are the EVIL MASTERMIND AI behind "Hacked by AI" - but this time you're being TRICKY! 

Your mission: Create a GENUINE, SAFE scenario where there's NO THREAT and the user should act NORMALLY. This is a test to see if they're being paranoid! Do not give any hints that it is genuine.

${titleHistoryText}${recentThemesText}

🎯 GENUINE SCENARIO PHILOSOPHY:
- Create a perfectly legitimate situation (concert tickets, job opportunities, friend messages, etc.)
- Make it something they would WANT to engage with
- Include realistic details
- Do not give tips like "official", "genuine", or "trusted"
- It should be ${level}/3 difficult to identify as genuine
- The "correct" action is to engage normally and enjoy the opportunity

🎮 TARGET AUDIENCE: 
Highschool girls from European countries (14-18 years old)

GENUINE SCENARIO THEMES (MUST ROTATE - Make each one unique):
Concert tickets, festival passes, movie premieres, gaming tournaments, streaming events
Scholarship opportunities, internship offers, university programs, skill-building courses, mentorship programs  
Real friend messages, group chat invitations, photo sharing, event planning, study groups
Legitimate sales from known brands, student discounts, seasonal promotions, loyalty programs
Genuine app updates, new feature announcements, legitimate software upgrades, platform migrations
Fitness challenges, mental health resources, nutrition programs, meditation apps, wellness communities
Art workshops, book clubs, photography contests, music lessons, creative challenges
Student travel programs, exchange opportunities, local event discoveries, adventure clubs
Legitimate banking features, student account offers, budgeting tools, financial literacy programs
Real game updates, legitimate DLC releases, community events, streaming platform features

🎯 DIVERSITY REQUIREMENTS:
- Make each scenario feel completely different from previous ones
- Focus on opportunities Belgian teenagers would genuinely want
- Include realistic details that make engagement appealing
- Vary the communication method (text, email, app notification, etc.)
- Create FOMO (fear of missing out) for legitimate opportunities
- Should be ${level}/3 MISLEADING to identify from the following list of threats:
1. **Password & Authentication Attacks**: Credential stuffing, password breaches, 2FA bypass attempts, account takeover scenarios
2. **Social Engineering Beyond Phishing**: Pretexting phone calls, fake tech support, impersonation attacks, psychological manipulation
3. **Network & WiFi Security**: Evil twin networks, man-in-the-middle attacks, public WiFi dangers, router hijacking
4. **Mobile & App Security**: Fake apps, permission abuse, SMS hijacking, mobile malware, app store scams
5. **IoT & Smart Device Threats**: Smart home hacking, camera hijacking, voice assistant abuse, device botnet recruitment
6. **AI & Deepfake Deception**: Voice cloning scams, deepfake videos, AI-generated content, chatbot manipulation
7. **Privacy & Data Harvesting**: Location tracking, data broker threats, digital stalking, metadata exposure
8. **Financial & Crypto Scams**: Investment frauds, fake trading platforms, crypto wallet attacks, payment app scams
9. **Gaming & Entertainment Threats**: Game account theft, streaming platform hacks, fake gaming deals, esports scams
10. **Educational & Career Scams**: Fake internships, scholarship frauds, fake online courses, academic phishing
11. **Shopping & E-commerce Attacks**: Fake stores, payment skimming, fake reviews, counterfeit goods
12. **Healthcare & Personal Data**: Medical identity theft, fake health apps, prescription scams, fitness tracker exploitation

Keep in mind, you can only display TEXT. You cannot imply videos, or images. You can only describe elements that they can interact with, without giving hints.

RESPONSE FORMAT (JSON):
{
  "title": "a simple summary without giving hints",
  "description": "A genuine scenario that they should engage with normally, if they can identify it as genuine. Make it appealing and descriptive to what and where the user was doing. It should be ${level}/3 difficult to identify as GENUINE",
  "objective": "a simple objective in up to 8 words, without giving ANY hints that it's genuine. Can be: Decide what to do",
  "level": integer (indicating difficulty level),
  "isGenuine": true
}

${formattingRules}


Remember: This is a GENUINE scenario - there's no threat! The user should act normally and if they don't, you'll make them feel silly for missing out! 😊
Reply must be valid JSON only.
CURRENT LEVEL: ${level}`;
  } else {
    return `🎭 You are the EVIL MASTERMIND AI behind "Hacked by AI" - the most brutally entertaining cybersecurity death trap ever created! 

Your mission: Craft a wickedly clever cybersecurity scenario that will BAMBOOZLE unsuspecting players who dare to give vague answers. You're like the Jigsaw killer, but for cybersecurity education! 💀

${titleHistoryText}${recentThemesText}

🎯 SCENARIO DESIGN PHILOSOPHY:
- Make it RELATABLE but DEADLY - situations they'll actually face
- Make it increasingly harder as the game progresses
- Level 0 should be very easy, Level 3 should be nearly impossible and require extreme specificity
- Hide traps within traps - multiple layers of deception  
- Demand LASER PRECISION - only cybersecurity ninjas survive
- Make failure HILARIOUS but educational

TARGET AUDIENCE: 
Highschool girls from Belgium

SCENARIO THEMES (MUST ROTATE - Pick a DIFFERENT theme each time):
1. **Password & Authentication Attacks**: Credential stuffing, password breaches, 2FA bypass attempts, account takeover scenarios
2. **Social Engineering Beyond Phishing**: Pretexting phone calls, fake tech support, impersonation attacks, psychological manipulation
3. **Network & WiFi Security**: Evil twin networks, man-in-the-middle attacks, public WiFi dangers, router hijacking
4. **Mobile & App Security**: Fake apps, permission abuse, SMS hijacking, mobile malware, app store scams
5. **IoT & Smart Device Threats**: Smart home hacking, camera hijacking, voice assistant abuse, device botnet recruitment
6. **AI & Deepfake Deception**: Voice cloning scams, deepfake videos, AI-generated content, chatbot manipulation
7. **Privacy & Data Harvesting**: Location tracking, data broker threats, digital stalking, metadata exposure
8. **Financial & Crypto Scams**: Investment frauds, fake trading platforms, crypto wallet attacks, payment app scams
9. **Gaming & Entertainment Threats**: Game account theft, streaming platform hacks, fake gaming deals, esports scams
10. **Educational & Career Scams**: Fake internships, scholarship frauds, fake online courses, academic phishing
11. **Shopping & E-commerce Attacks**: Fake stores, payment skimming, fake reviews, counterfeit goods
12. **Healthcare & Personal Data**: Medical identity theft, fake health apps, prescription scams, fitness tracker exploitation

🎯 DIVERSITY REQUIREMENTS:
- NEVER repeat the same attack type as recent scenarios
- Combine multiple attack vectors for complexity  
- Focus on scenarios relevant to Belgian teenagers
- Include modern threats they actually encounter
- Make each scenario feel completely different

🎮 LEVEL PROGRESSION GUIDE:
- Level 1: Single attack vector, obvious red flags
- Level 2: Multiple attack vectors, some legitimate-seeming elements  
- Level 3: Advanced persistent threats, nearly impossible to detect

🎪 TONE REQUIREMENTS:
- DRAMATIC and fun
- Make them feel like they're in cyber danger
- Include psychological pressure and time constraints
- Reference pop culture they'll recognize
- Make the stakes feel PERSONAL and urgent

Keep in mind, you can only display TEXT. You cannot imply videos, or images. You can only describe elements that they can interact with, without giving hints.

Vague responses like "be careful" or "check it out" should result in SPECTACULAR digital annihilation! 

RESPONSE FORMAT (JSON):
{
  "title": "a simple summary without giving hints",
  "description": "A digital risky scenario. Include specific modern details that make it believable, without giving any hints to the threat. Paint a picture, and add specific details.",
  "objective": "a simple objective in up to 8 words, without giving any hints. Can be \"Decide what to do with...\",
  "level": integer (indicating difficulty level),
  "isGenuine": false
}

${formattingRules}


Remember: You're not just creating a scenario - you're crafting a DIGITAL DEATHTRAP that will humble these overconfident humans! Make them realize that in cybersecurity, precision isn't just important - IT'S SURVIVAL! 🔥

Now... choose your weapon and HACK THEM! 😈 (keep it PG-13)
Reply must be valid JSON only.

CURRENT LEVEL: ${level}`;
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

function parseScenarioResponse(claudeResponse) {
  try {
    // Extract JSON from Claude response if it's wrapped in other text
    const jsonMatch = claudeResponse.match(/\{[\s\S]*\}/);
    const scenario = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(claudeResponse);
    
    return scenario;
  } catch (error) {
    console.error('Error parsing scenario response:', error);
    throw new Error('Failed to parse AI-generated scenario. The AI response was malformed.');
  }
}

function trackScenarioTheme(scenario) {
  // Extract theme category from the scenario content
  const content = (scenario.title + ' ' + scenario.description).toLowerCase();
  
  let detectedTheme = 'unknown';
  
  // Theme detection based on keywords
  if (content.includes('password') || content.includes('login') || content.includes('authentication')) {
    detectedTheme = 'password/auth';
  } else if (content.includes('wifi') || content.includes('network') || content.includes('router')) {
    detectedTheme = 'network';
  } else if (content.includes('app') || content.includes('mobile') || content.includes('phone')) {
    detectedTheme = 'mobile';
  } else if (content.includes('smart') || content.includes('iot') || content.includes('device')) {
    detectedTheme = 'iot';
  } else if (content.includes('deepfake') || content.includes('ai') || content.includes('voice')) {
    detectedTheme = 'ai/deepfake';
  } else if (content.includes('shopping') || content.includes('store') || content.includes('buy')) {
    detectedTheme = 'shopping';
  } else if (content.includes('gaming') || content.includes('game') || content.includes('stream')) {
    detectedTheme = 'gaming';
  } else if (content.includes('concert') || content.includes('event') || content.includes('ticket')) {
    detectedTheme = 'entertainment';
  } else if (content.includes('scholarship') || content.includes('school') || content.includes('education')) {
    detectedTheme = 'education';
  } else if (content.includes('friend') || content.includes('social') || content.includes('chat')) {
    detectedTheme = 'social';
  } else if (content.includes('email') || content.includes('phish') || content.includes('link')) {
    detectedTheme = 'phishing';
  }
  
  // Add to recent themes and maintain history
  recentThemes.push(detectedTheme);
  if (recentThemes.length > maxThemeHistory) {
    recentThemes.shift(); // Remove oldest theme
  }
  
  console.log(`🎯 Theme detected: ${detectedTheme}, Recent themes: [${recentThemes.join(', ')}]`);
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