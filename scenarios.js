// Dynamic Scenario Manager for Hacked by AI
// Generates scenarios on-demand using Claude AI - NO FALLBACKS!

class ScenarioManager {
    constructor() {
        this.generatedScenarios = [];
        this.aiEvaluator = null;
        this.titleHistory = []; // Track previously generated titles
        this.maxTitleHistory = 15; // Keep last 15 titles to avoid repeats in survival mode
    }

    setAIEvaluator(evaluator) {
        this.aiEvaluator = evaluator;
    }
    
    async generateScenario(scenarioIndex) {
        // Check if we already have this scenario cached
        if (this.generatedScenarios[scenarioIndex]) {
            return this.generatedScenarios[scenarioIndex];
        }

        // Generate new scenario - AI ONLY, NO FALLBACKS!
        if (!this.aiEvaluator) {
            throw new Error('🚫 AI Evaluator not initialized. Game requires Claude AI to function.');
        }

        try {
            // 1/5 chance for genuine scenario
            const isGenuineScenario = Math.random() < 0.2;
            
            const scenario = await this.aiEvaluator.generateNewScenario(scenarioIndex, isGenuineScenario, this.titleHistory);
            // Add unique ID, index, and genuine flag
            scenario.id = scenarioIndex + 1;
            scenario.index = scenarioIndex;
            scenario.isGenuine = isGenuineScenario;
            
            // Update title history to avoid duplicates
            this.addToTitleHistory(scenario.title);
            
            // Cache the scenario
            this.generatedScenarios[scenarioIndex] = scenario;
            return scenario;
        } catch (error) {
            console.error('Failed to generate scenario:', error);
            throw new Error(`🤖 AI Scenario Generation Failed: ${error.message}`);
        }
    }

    reset() {
        this.generatedScenarios = [];
        // Note: We intentionally DON'T clear titleHistory so titles stay unique across games
    }    
    
    addToTitleHistory(title) {
        // Add the new title to history
        this.titleHistory.push(title);
        
        // Keep only the last maxTitleHistory titles
        if (this.titleHistory.length > this.maxTitleHistory) {
            this.titleHistory.shift(); // Remove the oldest title
        }
    }
    
    getTitleHistoryString() {
        if (this.titleHistory.length === 0) {
            return "No previous titles to avoid.";
        }
        return `Previously generated titles to avoid: ${this.titleHistory.join(', ')}`;
    }
}

// Create global scenario manager instance
const scenarioManager = new ScenarioManager();

// Export for modern module systems if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { scenarioManager };
}
