// Claude AI Evaluation Service for Cybersecurity Game
// Frontend client that calls secure Vercel serverless functions

class ClaudeAIEvaluator {
    constructor() {
        this.evaluateAPI = '/api/evaluate';
        this.generateAPI = '/api/generate-scenario';
        this.titleHistory = []; // Track recent titles to avoid repetition
        this.maxTitleHistory = 10;
    }

    async evaluateResponse(scenario, userResponse) {
        console.log('🤖 Calling Claude AI for evaluation...');
        
        try {
            const response = await fetch(this.evaluateAPI, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ scenario, userResponse })
            });

            const result = await response.json();
            
            if (result.success) {
                console.log('✅ Claude AI evaluation received!');
                return result.data;
            } else {
                console.log('❌ Claude API failed:', result.error);
                throw new Error(`🚫 ${result.error}. Game cannot continue without AI evaluation.`);
            }
        } catch (error) {
            console.error('Evaluation API Error:', error);
            throw new Error('🌐 Network error - please check your internet connection. Game cannot continue without AI evaluation.');
        }
    }

    async generateNewScenario(level = 0, isGenuine = false, titleHistory = []) {
        console.log(`🎮 Generating new ${isGenuine ? 'genuine' : 'threat'} scenario...`);
        
        // Track title history to avoid repetition
        const currentTitleHistory = titleHistory.length > 0 ? titleHistory : this.titleHistory;
        
        try {
            const response = await fetch(this.generateAPI, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    level, 
                    isGenuine, 
                    titleHistory: currentTitleHistory 
                })
            });

            const result = await response.json();
            
            if (result.success) {
                console.log('✅ New scenario generated!');
                
                // Track the title to avoid repetition
                this.titleHistory.push(result.data.title);
                if (this.titleHistory.length > this.maxTitleHistory) {
                    this.titleHistory.shift(); // Remove oldest title
                }
                
                return result.data;
            } else {
                console.log('❌ Claude API failed:', result.error);
                throw new Error(`🚫 ${result.error}`);
            }
        } catch (error) {
            console.error('Scenario Generation API Error:', error);
            throw new Error('🌐 Network error - please check your internet connection.');
        }
    }
}