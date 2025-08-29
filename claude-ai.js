// Claude AI Evaluation Service for Cybersecurity Game
// Using Electron's main process to bypass CORS restrictions

// AI Evaluation Service using Anthropic's Claude AI through Electron
class ClaudeAIEvaluator {
    constructor() {
        this.model = "claude-opus-4-1-20250805";
        this.isElectron = typeof window !== 'undefined' && window.electronAPI;
        this.recentThemes = []; // Track recent themes to avoid repetition
        this.maxThemeHistory = 8; // Remember last 8 themes
        this.formattingRules = `
                                FORMATTING INSTRUCTIONS:
                                - Use **bold** for important terms and key concepts
                                - Use *italic* for subtle emphasis and context
                                - Use backticks for technical terms, passwords, file names, links/URLs, and code
                                - Use «french guillemets» for quoting someone or something
                                - Use ![bracket exclamation marks!] for urgent warnings and red flags
                                - Use +[bracket plus signs+] for success messages
                                - Use -[bracket minus signs-] for failures
                                - Use #[bracket hashtags#] for cybersecurity terms (phishing, malware, encryption, firewall, etc.)
                                - Use \n for line breaks in lists and structured text
                                - Use 1), 2), 3), etc. for numbered lists
                                `;
    }

    async evaluateResponse(scenario, userResponse) {
        if (this.isElectron) {
            return await this.evaluateWithClaude(scenario, userResponse);
        } else {
            // Error out for non-Electron environments
            throw new Error('🌐 Running in browser mode is not supported. Please use an Electron environment.');
        }
    }
    
    async evaluateWithClaude(scenario, userResponse) {
        const prompt = this.createEvaluationPrompt(scenario, userResponse);

        console.log('🤖 Calling Claude AI...');
        const result = await window.electronAPI.callClaudeAPI(prompt);

        if (result.success) {
            console.log('✅ Claude AI response received!');
            return this.parseAIResponse(result.data);
        } else {
            console.log('❌ Claude API failed:', result.error);
            
            // console.log(result);
            // console.log(result.error);
            // console.log(result.error.message);

            // Show user-friendly error message and throw
            let errorMessage = "🚫 Claude AI is currently unavailable";
            if (result.error.includes('overloaded')) {
                errorMessage = "🔥 Claude AI servers are overloaded (high demand)";
            } else if (result.error.message.includes('rate limit')) {
                errorMessage = "⏳ Rate limit exceeded - too many requests";
            } else if (result.error.message.includes('authentication')) {
                errorMessage = "🔑 API authentication failed - check your API key";
            } else if (result.error.message.includes('network')) {
                errorMessage = "🌐 Network error - please check your internet connection";
            } else if (result.error.message.includes('credits')) {
                errorMessage = "🔑 API Tokens exhausted - please contact developer";
            }

            throw new Error(`${errorMessage}. Game cannot continue without AI evaluation.`);
        }
    }

    createEvaluationPrompt(scenario, userResponse) {
        const isGenuine = scenario.isGenuine || false;

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
4. If they were overly suspicious/paranoid - you should create a series of unfortunate events (humorous in the misfortune) to what they missed out and what happened

RESPONSE FORMAT (respond with valid JSON only):
{
  "hacked": false (only influences score, not game over),
  "explanation": "If they acted normally: Congratulate them for recognizing a genuine opportunity and not being paranoid! If they were paranoid: Create a series of unfortunate events (humorous in the misfortune) to what they missed out and what happened.",
  "correctAction": "The correct action was to engage normally with this legitimate opportunity. Give an example of how it would have looked if it was a scam.",
  "actionRating": integer (1-10, where 10 is perfect normal engagement, 1 is extreme paranoia)
}

${this.formattingRules}



Examples for appropriate evaluations:
- Responding lovingly to genuine message from grandma → Good!
- Being overly suspicious of legitimate friend messages → Missed out!
- Enjoying a real scholarship opportunity → Excellent!
- Refusing a genuine job interview → Missed out!

You should be unforgiving and fun, but educational. Paranoid answers should result in a series of unfortunate events. Vague but positive responses are okay. Evaluate the response and return valid JSON only:`;
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

RESPONSE FORMAT (respond with valid JSON only):
{
  "hacked": boolean,
  "explanation": "Create a series of unfortunate events of what happened step-by-step (if hacked) or congratulations (if safe). Keep it funny! Be witty and slightly sarcastic.",
  "correctAction": "Detailed explanation of the proper cybersecurity approach for this scenario.",
  "actionRating": integer (1-10, where 10 is perfect)
}

${this.formattingRules}


Examples of responses that should PASS:
- For phishing: "Check the domain for typosquatting - amaz0n uses zero instead of 'o', verify sender authenticity, delete email and report as phishing"
- For USB: "Do not plug the USB into any computer, report to security immediately, treat as potential malware delivery"

Examples that should FAIL:
- "Be careful"
- "Check if it's real"
- "Think about it"
- "Use common sense"

You should be unforgiving and fun, but educational. Incomplete/insufficient answers should result in a series of unfortunate events. Evaluate the response and return valid JSON only:`;
        }
    }

    async generateNewScenario(level = 0, isGenuine = false, titleHistory = []) {
        if (!this.isElectron) {
            throw new Error('🌐 Running in browser mode is not supported. Please use an Electron environment.');
        }

        return await this.generateScenarioWithClaude(level, isGenuine, titleHistory);
    }

    async generateScenarioWithClaude(level = 0, isGenuine = false, titleHistory = []) {
        const prompt = this.createScenarioPrompt(level, isGenuine, titleHistory);
        console.log(`🎮 Generating new ${isGenuine ? 'genuine' : 'threat'} scenario...`);

        const result = await window.electronAPI.callClaudeAPI(prompt);

        if (result.success) {
            console.log('✅ New scenario generated!');
            return this.parseScenarioResponse(result.data);
        } else {
            console.log('❌ Claude API failed:', result.error);
            
            // Log full result object for debugging
            // console.log('📋 Full result object:', result);
            // console.log('📋 Stringified result:', JSON.stringify(result, null, 2));
            
            // Log detailed error information if available
            // if (result.errorDetails) {
            //     console.log('🔍 Detailed error information:', result.errorDetails);
            // }
            // if (result.fullError) {
            //     console.log('📋 Full error object:', result.fullError);
            // }
            
            // Extract error details from various possible structures
            let errorDetails = this.extractErrorDetails(result.error, result.errorDetails, result.fullError);
            // console.log('🔍 Extracted error details:', errorDetails);

            // Show user-friendly error message and throw
            let errorMessage = this.getUserFriendlyErrorMessage(errorDetails);

            throw new Error(`${errorMessage}`);
        }
    }
    
    createScenarioPrompt(level = 0, isGenuine = false, titleHistory = []) {
        const titleHistoryText = titleHistory.length > 0
            ? `\n🚫 AVOID THESE PREVIOUSLY USED TITLES: ${titleHistory.join(', ')}\nMake sure your title is COMPLETELY DIFFERENT from these!\n`
            : '';

        const recentThemesText = this.recentThemes.length > 0
            ? `\n🎯 THEME DIVERSITY REQUIREMENT: You've recently used these themes: [${this.recentThemes.join(', ')}]\nYou MUST pick a COMPLETELY DIFFERENT theme from the list below. Be creative and original!\n`
            : '\n🎯 THEME DIVERSITY REQUIREMENT: Pick any theme from the comprehensive list below, but make it unique and engaging!\n';
            
            if (isGenuine) {
            return `🎭 You are the EVIL MASTERMIND AI behind "Hacked by AI" - but this time you're being TRICKY! 

Your mission: Create a GENUINE, SAFE scenario where there's NO THREAT and the user should act NORMALLY. This is a test to see if they're being paranoid! Do not give any hints that it is genuine.

${titleHistoryText}${recentThemesText}

🎯 GENUINE SCENARIO PHILOSOPHY:
- Create a perfectly legitimate situation (concert tickets, job opportunities, friend messages, etc.)
- Make it something they would WANT to engage with
- Include realistic details
- Do not give tips like "official", "genuine", or "trusted"
- It should be ${level}/5 difficult to identify as genuine
- The "correct" action is to engage normally and enjoy the opportunity

🎮 TARGET AUDIENCE: 
Highschool girls from Belgium

GENUINE SCENARIO THEMES (MUST ROTATE - Make each one unique):
1. **Entertainment & Events**: Concert tickets, festival passes, movie premieres, gaming tournaments, streaming events
2. **Education & Career**: Scholarship opportunities, internship offers, university programs, skill-building courses, mentorship programs  
3. **Social & Friends**: Real friend messages, group chat invitations, photo sharing, event planning, study groups
4. **Shopping & Deals**: Legitimate sales from known brands, student discounts, seasonal promotions, loyalty programs
5. **Technology & Apps**: Genuine app updates, new feature announcements, legitimate software upgrades, platform migrations
6. **Health & Wellness**: Fitness challenges, mental health resources, nutrition programs, meditation apps, wellness communities
7. **Hobbies & Interests**: Art workshops, book clubs, photography contests, music lessons, creative challenges
8. **Travel & Adventure**: Student travel programs, exchange opportunities, local event discoveries, adventure clubs
9. **Finance & Savings**: Legitimate banking features, student account offers, budgeting tools, financial literacy programs
10. **Gaming & Entertainment**: Real game updates, legitimate DLC releases, community events, streaming platform features

🎯 GENUINE DIVERSITY REQUIREMENTS:
- Make each scenario feel completely different from previous ones
- Focus on opportunities Belgian teenagers would genuinely want
- Include realistic details that make engagement appealing
- Vary the communication method (text, email, app notification, etc.)
- Create FOMO (fear of missing out) for legitimate opportunities

Keep in mind, you can only display TEXT. You cannot imply videos, or images. You can only describe elements that they can interact with, without giving hints.

RESPONSE FORMAT (JSON only, no other text):
{
  "title": "a simple summary without giving hints",
  "description": "A genuine scenario that they should engage with normally, if they can identify it as genuine. Make it appealing and descriptive to what and where the user was doing. It should be ${level}/5 difficult to identify as GENUINE",
  "objective": "a simple objective in up to 8 words, without giving ANY hints that it's genuine. Can be: Decide what to do",
  "level": integer (indicating difficulty level),
  "isGenuine": true
}

${this.formattingRules}


Remember: This is a GENUINE scenario - there's no threat! The user should act normally and if they don't, you'll make them feel silly for missing out! 😊
Reply must be valid JSON only.
CURRENT LEVEL: ${level}`;        } else {
            return `🎭 You are the EVIL MASTERMIND AI behind "Hacked by AI" - the most brutally entertaining cybersecurity death trap ever created! 

Your mission: Craft a wickedly clever cybersecurity scenario that will BAMBOOZLE unsuspecting players who dare to give vague answers. You're like the Jigsaw killer, but for cybersecurity education! 💀

${titleHistoryText}${recentThemesText}

🎯 SCENARIO DESIGN PHILOSOPHY:
- Make it RELATABLE but DEADLY - situations they'll actually face
- Make it increasingly harder as the game progresses
- Level 0 should be very easy, Level 5 should be nearly impossible and require extreme specificity
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
- Level 0-1: Single attack vector, obvious red flags
- Level 2-3: Multiple attack vectors, some legitimate-seeming elements  
- Level 4-5: Advanced persistent threats, nearly impossible to detect
- Level 6+: Nation-state level sophistication, requires expert knowledge

🎪 TONE REQUIREMENTS:
- DRAMATIC and fun
- Make them feel like they're in cyber danger
- Include psychological pressure and time constraints
- Reference pop culture they'll recognize
- Make the stakes feel PERSONAL and urgent

Keep in mind, you can only display TEXT. You cannot imply videos, or images. You can only describe elements that they can interact with, without giving hints.

Vague responses like "be careful" or "check it out" should result in SPECTACULAR digital annihilation! 

RESPONSE FORMAT (JSON only, no other text):
{
  "title": "a simple summary without giving hints",
  "description": "A digital risky scenario. Include specific modern details that make it believable, without giving any hints to the threat. Paint a picture, and add specific details.",
  "objective": "a simple objective in up to 8 words, without giving any hints. Can be "Decide what to do with...",
  "level": integer (indicating difficulty level),
  "isGenuine": false
}

${this.formattingRules}


Remember: You're not just creating a scenario - you're crafting a DIGITAL DEATHTRAP that will humble these overconfident humans! Make them realize that in cybersecurity, precision isn't just important - IT'S SURVIVAL! 🔥

Now... choose your weapon and HACK THEM! 😈 (keep it PG-13)
Reply must be valid JSON only.

CURRENT LEVEL: ${level}`;
        }
    }
    
    parseScenarioResponse(claudeResponse) {
        try {
            // Extract JSON from Claude response if it's wrapped in other text
            const jsonMatch = claudeResponse.match(/\{[\s\S]*\}/);
            const scenario = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(claudeResponse);
            
            // Track theme for diversity (extract theme from title/description)
            this.trackScenarioTheme(scenario);
            
            return scenario;
        } catch (error) {
            console.error('Error parsing scenario response:', error);
            // console.log('Claude response was:', claudeResponse);
            throw new Error('Failed to parse AI-generated scenario. The AI response was malformed.');
        }
    }
    
    trackScenarioTheme(scenario) {
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
        this.recentThemes.push(detectedTheme);
        if (this.recentThemes.length > this.maxThemeHistory) {
            this.recentThemes.shift(); // Remove oldest theme
        }
        
        console.log(`🎯 Theme detected: ${detectedTheme}, Recent themes: [${this.recentThemes.join(', ')}]`);
    }

    parseAIResponse(claudeResponse) {
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
            // console.log('Claude response was:', claudeResponse);
            // Return error response instead of fallback
            throw new Error('Failed to parse AI response. The AI evaluation was malformed.');
        }
    }

    extractErrorDetails(error, errorDetails, fullError) {
        // Try to extract meaningful error information from various sources
        let details = {};
        
        // Check if errorDetails contains parsed JSON from API response
        if (errorDetails && typeof errorDetails === 'object') {
            details = { ...errorDetails };
        }
        
        // Check if fullError contains additional information
        if (fullError && typeof fullError === 'object') {
            details.fullError = fullError;
            
            // If fullError has details property, extract it
            if (fullError.details) {
                details.apiDetails = fullError.details;
            }
        }
        
        // Extract specific Claude API error information
        if (details.error && details.error.type && details.error.message) {
            details.claudeErrorType = details.error.type;
            details.claudeErrorMessage = details.error.message;
        }
        
        // Add request ID if available
        if (details.request_id) {
            details.requestId = details.request_id;
        }
        
        return details;
    }

    getUserFriendlyErrorMessage(errorDetails) {
        // Check for specific Claude API error types
        if (errorDetails.claudeErrorMessage) {
            const message = errorDetails.claudeErrorMessage.toLowerCase();
            
            if (message.includes('credit balance is too low')) {
                return 'API requests exhausted.';
            }
            if (message.includes('rate limit')) {
                return 'Too many requests. Try again later.';
            }
            if (message.includes('invalid request')) {
                return 'Invalid AI request format.';
            }
            if (message.includes('authentication')) {
                return 'AI service authentication failed. Check API key.';
            }
            
            // Return the Claude error message if it's user-friendly
            return errorDetails.claudeErrorMessage;
        }
        
        // Fallback to generic message
        return 'AI service temporarily unavailable';
    }
}
