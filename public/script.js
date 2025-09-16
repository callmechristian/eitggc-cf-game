// Game state management
class HackedByAIGame {
    constructor() {
        this.currentScenario = 0;
        this.isGameActive = false;
        this.startTime = null;
        this.aiEvaluator = null;
        this.survivalTimer = null;
        this.cyberScore = 0;
        this.totalPossibleScore = 0;
        this.currentScenarioData = null;
        this.currentScreen = 'start-screen'; // Track current screen for music restart
        
        // Initialize audio manager
        this.audioManager = new AudioManager();
        
        this.initializeEventListeners();
        this.showScreen('start-screen');
        // Initialize AI evaluator and connect it to scenario manager

        setTimeout(() => {
            this.aiEvaluator = new ClaudeAIEvaluator();
            if (typeof scenarioManager !== 'undefined') {
                scenarioManager.setAIEvaluator(this.aiEvaluator);
            }
        }, 1000);
    }

    initializeEventListeners() {
        // Start game
        document.getElementById('start-game').addEventListener('click', () => {
            this.playButtonSound();
            this.startGame();
        });

        // Submit action
        document.getElementById('submit-action').addEventListener('click', () => {
            this.playButtonSound();
            this.submitAction();
        });

        // Enter key on textarea
        document.getElementById('user-input').addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                this.playButtonSound();
                this.submitAction();
            }
        });

        // Next scenario
        document.getElementById('next-scenario').addEventListener('click', () => {
            this.playButtonSound();
            this.nextScenario();
        });        // Restart game
        document.getElementById('restart-game').addEventListener('click', () => {
            this.playButtonSound();
            this.restartGame();
        });

        // Play again
        document.getElementById('play-again').addEventListener('click', () => {
            this.playButtonSound();
            this.restartGame();
        });
          // See results button
        document.getElementById('see-results').addEventListener('click', () => {
            this.playButtonSound();
            this.showScreen('result-screen');
        });
        
        // See success results button
        document.getElementById('see-success-results').addEventListener('click', () => {
            this.playButtonSound();
            this.showSuccessDetails();
        });
        
        // Volume control event listeners
        document.getElementById('volume-slider').addEventListener('input', (e) => {
            const volume = e.target.value / 100; // Convert percentage to decimal
            this.setVolume(volume);
            document.getElementById('volume-value').textContent = `${e.target.value}%`;
        });        // Music toggle
        document.getElementById('toggle-music').addEventListener('click', () => {
            this.playButtonSound();
            const isEnabled = this.audioManager.toggleMusic();
            const button = document.getElementById('toggle-music');
            if (isEnabled) {
                button.classList.add('active');
                button.textContent = '🎵';
                // Restart music for current screen
                this.restartCurrentMusic();
            } else {
                button.classList.remove('active');
                button.textContent = '🔇';
            }
        });
        
        // SFX toggle
        document.getElementById('toggle-sfx').addEventListener('click', () => {
            const isEnabled = this.audioManager.toggleSfx();
            const button = document.getElementById('toggle-sfx');
            if (isEnabled) {
                button.classList.add('active');
                button.textContent = '🔊';
                // Play button sound to test
                this.audioManager.playSoundEffect('button');
            } else {
                button.classList.remove('active');
                button.textContent = '🔇';
            }
        });        // How to play navigation
        document.getElementById('how-to-play').addEventListener('click', () => {
            this.playButtonSound();
            this.showScreen('how-to-play-screen');
        });
        
        document.getElementById('back-to-start').addEventListener('click', () => {
            this.playButtonSound();
            this.showScreen('start-screen');
        });

        document.getElementById('start-from-guide').addEventListener('click', () => {
            this.playButtonSound();
            this.startGame();
        });

        // Initialize keyboard navigation
        this.initializeKeyboardNavigation();
    }

    showScreen(screenId) {
        console.log('🎬 Switching to screen:', screenId);
        
        // Track current screen for music restart
        this.currentScreen = screenId;
        
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show target screen
        document.getElementById(screenId).classList.add('active');
        
        console.log('✅ Screen switched to:', screenId);
        
        // Play appropriate background music for each screen
        this.playScreenMusic(screenId);
        
        // Show footer only on start and loading screens
        const footer = document.querySelector('.game-footer');
        if (screenId === 'start-screen' || screenId === 'loading-screen') {
            footer.style.display = 'block';
        } else {
            footer.style.display = 'none';
        }
          // Show header only on start screen
        const header = document.querySelector('.game-header');
        if (screenId === 'start-screen') {
            header.style.display = 'block';
        } else {
            header.style.display = 'none';
        }    }
    
    async startGame() {
        // Check if AI is initialized, wait if not
        if (!this.aiEvaluator) {
            this.showSimpleLoading('Initializing AI systems...', 'general');
            
            // Wait for AI to be initialized (check every 500ms, max 10 seconds)
            let attempts = 0;
            const maxAttempts = 20; // 10 seconds
            
            while (!this.aiEvaluator && attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 500));
                attempts++;
            }
            
            // If AI still not initialized after waiting, show error
            if (!this.aiEvaluator) {
                this.showAIFailure('AI system failed to initialize. Please refresh the page and try again.');
                return;
            }
        }
        
        this.currentScenario = 0;
        this.isGameActive = true;
        this.startTime = Date.now();
        this.cyberScore = 0;
        this.totalPossibleScore = 0;
        this.updateStats();
        this.startSurvivalTimer();
        this.loadScenario(); // This will show loading screen and then transition to game screen
    }

    startSurvivalTimer() {
        this.survivalTimer = setInterval(() => {
            if (this.isGameActive) {
                const elapsed = Date.now() - this.startTime;
                const minutes = Math.floor(elapsed / 60000);
                const seconds = Math.floor((elapsed % 60000) / 1000);
                document.getElementById('survival-time').textContent = 
                    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        }, 1000);
    }    stopSurvivalTimer() {
        if (this.survivalTimer) {
            clearInterval(this.survivalTimer);
            this.survivalTimer = null;
        }
    }

    updateStats() {
        const currentLevel = this.currentScenario + 1;
        const difficultyDisplay = currentLevel >= 5 ? '💀' : currentLevel.toString();
        document.getElementById('scenario-counter').textContent = difficultyDisplay;
    }
    
    async loadScenario() {
        // Show simple loading screen for scenario generation
        this.showSimpleLoading('Creating scenario...', 'scenario');
        try {
            console.log('🎮 Starting scenario generation...');
            
            // Generate new scenario using AI - NO FALLBACKS!
            const scenario = await scenarioManager.generateScenario(this.currentScenario);
            
            console.log('✅ Scenario generated:', scenario);
            
            this.currentScenarioData = scenario;            // Update scenario display with generated content using safe text formatter
            document.getElementById('scenario-title').innerHTML = scenario.title;
            document.getElementById('scenario-description').innerHTML = textFormatter.formatText(scenario.description, 'scenario');
            document.getElementById('scenario-objective').innerHTML = scenario.objective;
            
            console.log('📝 Scenario content updated in DOM');
            
            // Clear previous input
            document.getElementById('user-input').value = '';
            
            // Hide loading and show game screen
            console.log('🎬 Transitioning to game screen...');
            this.hideSimpleLoading('game-screen');

            // Focus on input after transition
            setTimeout(() => {
                document.getElementById('user-input').focus();
            }, 400);
            
        } catch (error) {
            console.error('❌ Critical AI Failure:', error);
            
            // Show AI failure screen instead of continuing
            this.showAIFailure(error.message);
            return;
        }
    }

    async submitAction() {
        const userInput = document.getElementById('user-input').value.trim();
        
        if (!userInput) {
            this.showTemporaryMessage('Please enter your response before submitting!');
            return;
        }        
        // Show simple loading screen for AI evaluation
        this.showSimpleLoading('The AI is deciding your fate...', 'ai');
        try {
            console.log('🤖 Starting AI evaluation...');
            
            // Evaluate the response using Claude AI - NO FALLBACKS!
            if (!this.aiEvaluator) {
                throw new Error('🚫 AI Evaluator not initialized. Game requires Claude AI to function.');
            }
              const result = await this.aiEvaluator.evaluateResponse(this.currentScenarioData, userInput);
            
            // console.log('✅ AI evaluation result:', result);
            // console.log('🔍 SUBMIT - Before result handling - currentScenario:', this.currentScenario);
            // console.log('🔍 SUBMIT - Before result handling - cyberScore:', this.cyberScore);
            // console.log('🔍 SUBMIT - Before result handling - totalPossibleScore:', this.totalPossibleScore);
            
            if (result.hacked) {
                // console.log('💀 Player was hacked, showing hack result...');
                this.showHackResult(result);
            } else {
                // console.log('🛡️ Player survived, showing success result...');
                this.showSuccessResult(result);
            }
        } catch (error) {
            console.error('❌ AI Evaluation Error:', error);
            
            // Show AI failure instead of continuing
            this.showAIFailure(error.message);
        }    }
          
        showHackResult(result) {
        // console.log('💀 showHackResult called with:', result);
        // console.log('🔍 HACK - currentScenario:', this.currentScenario);
        // console.log('🔍 HACK - cyberScore:', this.cyberScore);
        // console.log('🔍 HACK - totalPossibleScore:', this.totalPossibleScore);
        
        this.isGameActive = false;
        this.stopSurvivalTimer();
          // Update score tracking
        const rating = result.actionRating || 1;
        this.totalPossibleScore += 10; // Each scenario has max 10 points
        this.cyberScore += rating; // Add whatever points were earned (likely low)        // Prepare result data for the detailed result screen with safe formatting
        document.getElementById('hack-explanation').innerHTML = textFormatter.formatText(result.explanation, 'evaluation');
        document.getElementById('correct-action').innerHTML = textFormatter.formatText(result.correctAction, 'explanation');
        
        // Show action rating
        const actionRatingSection = document.getElementById('action-rating');
        actionRatingSection.style.display = 'block';
        actionRatingSection.innerHTML = `
            <strong>Action Rating:</strong> 
            <span class="rating-score">${rating}/10</span>
            <div class="rating-bar">
                <div class="rating-fill" style="width: ${rating * 10}%"></div>
            </div>
        `;
          // Hide next scenario button, show view recap
        document.getElementById('next-scenario').style.display = 'none';
        document.getElementById('restart-game').innerHTML = 'VIEW RECAP';
        document.getElementById('restart-game').style.display = 'inline-block';
        
        // Update restart button to show recap instead - but call showRecap immediately
        // Store the current scores before they can be reset
        const finalScenarios = this.currentScenario;
        const finalCyberScore = this.cyberScore;
        const finalTotalScore = this.totalPossibleScore;
        
        document.getElementById('restart-game').onclick = () => {
            // Use stored values for the recap instead of current values
            this.displayStoredRecap(finalScenarios, finalCyberScore, finalTotalScore);
        };
        
        // Show the dramatic hack alert screen first
        this.showScreen('hack-alert-screen');
        
        // Add some dramatic effect        
        setTimeout(() => {
            this.addGlitchEffect();
        }, 500);
    }
    showSuccessResult(result) {
        // Play success music
        this.audioManager.playBackgroundMusic('success');
        
        // Update score tracking
        const rating = result.actionRating || 8;
        this.cyberScore += rating;
        this.totalPossibleScore += 10; // Each scenario has max 10 points
        
        // console.log(`📊 Score updated: ${this.cyberScore}/${this.totalPossibleScore}`);
        
        this.updateStats();
        
        // Store result data for the detailed result screen
        this.currentSuccessResult = result;
        this.currentSuccessRating = rating;
        
        // Show the dramatic success alert screen first
        this.showScreen('success-alert-screen');
        
        // Add celebration effect
        setTimeout(() => {
            this.addCelebrationEffect();
        }, 500);
    }
    
    showSuccessDetails() {
        const result = this.currentSuccessResult;
        const rating = this.currentSuccessRating;        // Show success message in explanation section with safe formatting
        document.getElementById('hack-explanation').innerHTML = textFormatter.formatText(result.explanation, 'evaluation');
        document.getElementById('correct-action').innerHTML = textFormatter.formatText(result.correctAction, 'explanation');
        
        // Check if this was a genuine scenario where player was paranoid
        const wasGenuineScenario = this.currentScenarioData && this.currentScenarioData.isGenuine === true;
        const wasParanoid = rating < 7; // Low rating on genuine scenario indicates paranoia
        
        // Show action rating with success styling
        const actionRatingSection = document.getElementById('action-rating');
        actionRatingSection.style.display = 'block';
        
        // Adjust celebration message based on scenario type and performance
        let celebrationText = '';
        if (wasGenuineScenario && wasParanoid) {
            celebrationText = ''; // No celebration for paranoid behavior on genuine scenarios
        } else {
            celebrationText = '<div class="score-celebration">🎯 Excellent Security Response!</div>';
        }
        
        actionRatingSection.innerHTML = `
            <strong>Cyber Score Earned:</strong> 
            <span class="rating-score success">${rating}/10</span>
            <div class="rating-bar">
                <div class="rating-fill success" style="width: ${rating * 10}%"></div>
            </div>
            ${celebrationText}
        `;
        
        // Adjust button text based on scenario type and performance
        const nextButton = document.getElementById('next-scenario');
        if (wasGenuineScenario && wasParanoid) {
            nextButton.textContent = 'OOPS! NEXT';
        } else {
            nextButton.textContent = 'EASY. NEXT?';
        }
        
        // Show next scenario button, hide restart
        nextButton.style.display = 'inline-block';
        document.getElementById('restart-game').style.display = 'none';
        
        this.showScreen('result-screen');
    }
    
    nextScenario() {
        // console.log('🚀 nextScenario called - BEFORE increment:', this.currentScenario);
        this.currentScenario++;
        // console.log('🚀 nextScenario - AFTER increment:', this.currentScenario);
        this.updateStats();
        this.loadScenario(); // Continue to next scenario - infinite survival mode
    }

      showRecap() {
        // console.log('📊 Calculating final stats...');
        // console.log('Current scenario:', this.currentScenario);
        // console.log('Cyber score:', this.cyberScore);
        // console.log('Total possible score:', this.totalPossibleScore);
        
        this.isGameActive = false;
        this.stopSurvivalTimer();
        
        const finalTime = document.getElementById('survival-time').textContent;
        const finalScorePercentage = this.totalPossibleScore > 0 ? Math.round((this.cyberScore / this.totalPossibleScore) * 100) : 0;
        
        console.log('Final time:', finalTime);
        console.log('Final score percentage:', finalScorePercentage);
        console.log('Setting final-scenarios to:', this.currentScenario);
        console.log('Setting final-cyber-score to:', `${this.cyberScore}/10 (${finalScorePercentage}%)`);
        
        document.getElementById('final-scenarios').textContent = this.currentScenario; // Levels survived (successfully completed)
        document.getElementById('final-time').textContent = finalTime;
        document.getElementById('final-cyber-score').textContent = `${this.cyberScore}/10 (${finalScorePercentage}%)`;

        console.log('📝 Stats updated in DOM');// Add performance evaluation
        let performance = "";
        if (finalScorePercentage >= 95) {
            performance = "👑 CYBER QUEEN 👑";
        } else if (finalScorePercentage >= 90) {
            performance = "💻 HACKER HEROINE";
        } else if (finalScorePercentage >= 85) {
            performance = "🛡️ DEFENDER DIVA";
        } else if (finalScorePercentage >= 75) {
            performance = "🔒 ENCRYPTION EXPERT";
        } else if (finalScorePercentage >= 65) {
            performance = "🌐 CYBER EXPLORER";
        } else if (finalScorePercentage >= 60) {
            performance = "📱 PHISHING FIGHTER";
        } else if (finalScorePercentage >= 50) {
            performance = "🎀 MALWARE ENTHUSIAST";
        } else if (finalScorePercentage >= 40) {
            performance = "💌 SPAM ANALYST";
        } else if (finalScorePercentage >= 25) {
            performance = "🛠️ SPAM ENJOYER";
        } else {
            performance = "📚 NEEDS TRAINING";
        }
        document.getElementById('performance-level').textContent = performance;
        
        this.showScreen('recap-screen');
        
        // Add glitch effect instead of celebration
        this.addGlitchEffect();
    }

    displayStoredRecap(scenarios, cyberScore, totalScore) {
        console.log('📊 Displaying stored recap...');
        console.log('Stored scenarios:', scenarios);
        console.log('Stored cyber score:', cyberScore);
        console.log('Stored total score:', totalScore);
        
        this.isGameActive = false;
        this.stopSurvivalTimer();
        
        const finalTime = document.getElementById('survival-time').textContent;
        const finalScorePercentage = totalScore > 0 ? Math.round((cyberScore / totalScore) * 100) : 0;
        
        console.log('Final time:', finalTime);
        console.log('Final score percentage:', finalScorePercentage);
        console.log('Setting final-scenarios to:', scenarios);
        console.log('Setting final-cyber-score to:', `${cyberScore}/${totalScore} (${finalScorePercentage}%)`);
        
        document.getElementById('final-scenarios').textContent = scenarios;
        document.getElementById('final-time').textContent = finalTime;
        document.getElementById('final-cyber-score').textContent = `${cyberScore}/${totalScore} (${finalScorePercentage}%)`;
        
        console.log('📝 Stored stats updated in DOM');
        
        // Add performance evaluation
        let performance = "";
        if (finalScorePercentage >= 95) {
            performance = "👑 CYBER QUEEN 👑";
        } else if (finalScorePercentage >= 90) {
            performance = "💻 HACKER HEROINE";
        } else if (finalScorePercentage >= 85) {
            performance = "🛡️ DEFENDER DIVA";
        } else if (finalScorePercentage >= 75) {
            performance = "🔒 ENCRYPTION EXPERT";
        } else if (finalScorePercentage >= 65) {
            performance = "🌐 CYBER EXPLORER";
        } else if (finalScorePercentage >= 60) {
            performance = "📱 PHISHING FIGHTER";
        } else if (finalScorePercentage >= 50) {
            performance = "🎀 MALWARE ENTHUSIAST";
        } else if (finalScorePercentage >= 40) {
            performance = "💌 SPAM ANALYST";
        } else if (finalScorePercentage >= 25) {
            performance = "🛠️ SPAM ENJOYER";
        } else {
            performance = "📚 NEEDS TRAINING";
        }
        document.getElementById('performance-level').textContent = performance;
        
        this.showScreen('recap-screen');
        
        // Add glitch effect instead of celebration
        this.addGlitchEffect();
    }

    restartGame() {
        this.currentScenario = 0;
        this.isGameActive = false;
        this.cyberScore = 0;
        this.totalPossibleScore = 0;
        this.currentScenarioData = null;
        this.stopSurvivalTimer();
        this.removeEffects();
        
        // Reset scenario manager to generate fresh scenarios
        if (typeof scenarioManager !== 'undefined') {
            scenarioManager.reset();
        }
        
        this.showScreen('start-screen');
    }

    showTemporaryMessage(message) {
        // Create temporary message overlay
        const overlay = document.createElement('div');
        overlay.className = 'temp-message';
        overlay.textContent = message;
        overlay.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 0, 0, 0.9);
            color: white;
            padding: 20px 40px;
            border-radius: 10px;
            font-family: 'Orbitron', monospace;
            font-weight: bold;
            z-index: 1000;
            box-shadow: 0 0 30px rgba(255, 0, 0, 0.5);
        `;
        
        document.body.appendChild(overlay);
        
        setTimeout(() => {
            overlay.remove();
        }, 2000);
    }

    addGlitchEffect() {
        const body = document.body;
        body.style.animation = 'glitch 0.3s infinite';
        
        setTimeout(() => {
            body.style.animation = '';
        }, 2000);
    }

    addCelebrationEffect() {
        // Add floating cyber elements
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                this.createFloatingElement();
            }, i * 200);
        }
    }

    createFloatingElement() {
        const element = document.createElement('div');
        const symbols = ['💾', '🔐', '🛡️', '⚡', '🔒', '💻', '🌐', '🔑'];
        element.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        element.style.cssText = `
            position: fixed;
            font-size: 2rem;
            pointer-events: none;
            z-index: 1000;
            left: ${Math.random() * 100}vw;
            top: 100vh;
            animation: float-up 3s ease-out forwards;
        `;
        
        document.body.appendChild(element);
        
        setTimeout(() => {
            element.remove();
        }, 3000);
    }

    removeEffects() {        document.body.style.animation = '';
        document.querySelectorAll('.temp-message').forEach(el => el.remove());
    }
    
    showAIFailure(errorMessage) {
        this.isGameActive = false;
        this.stopSurvivalTimer();
        
        // Check if this is a token/usage limit error
        const isUsageLimitError = errorMessage && (
            errorMessage.toLowerCase().includes('usage limit') ||
            errorMessage.toLowerCase().includes('token limit') ||
            errorMessage.toLowerCase().includes('rate limit') ||
            errorMessage.toLowerCase().includes('quota exceeded') ||
            errorMessage.toLowerCase().includes('too many requests') ||
            errorMessage.toLowerCase().includes('429')
        );
        
        // Show AI failure message in the explanation section with actual error details
        let errorDisplay = '';
        let solutionsText = '';
        
        if (isUsageLimitError) {
            errorDisplay = `
                <strong>⚠️ USAGE LIMIT REACHED ⚠️</strong><br><br>
                The AI service has reached its usage limit for your account or API key.<br><br>
                <strong>Error Details:</strong><br>
                <code style="background: rgba(255,255,255,0.1); padding: 5px; border-radius: 3px; font-size: 0.9em; word-break: break-all;">${errorMessage}</code><br><br>
            `;
            solutionsText = `
                <strong>🔧 Solutions:</strong><br>
                • Add your own API key in the source code
            `;
        } else {
            errorDisplay = `
                <strong>💀 AI FAILURE 💀</strong><br><br>
                The evil AI mastermind has encountered a critical error!<br><br>
                <strong>Error Details:</strong><br>
                <code style="background: rgba(255,255,255,0.1); padding: 5px; border-radius: 3px; font-size: 0.9em; word-break: break-all;">${errorMessage}</code><br><br>
            `;
            solutionsText = `
                <strong>🔧 Possible Solutions:</strong><br>
                • Contact the developer or modify the source code yourself
            `;
        }
        
        document.getElementById('hack-explanation').innerHTML = `
            ${errorDisplay}
            Without the AI's diabolical genius to craft scenarios and judge your responses, the game cannot continue.<br><br>
            ${solutionsText}
        `;
        document.getElementById('correct-action').textContent =
            "In real cybersecurity, system failures are common. Always have backup plans and incident response procedures ready!";
          // Hide action rating section for AI failures
        const actionRatingSection = document.getElementById('action-rating');
        actionRatingSection.style.display = 'none';
        document.getElementsByClassName('action-rating-section')[0].style.display = 'none';
        
        // Only show restart button
        document.getElementById('next-scenario').style.display = 'none';
        document.getElementById('restart-game').style.display = 'inline-block';
        
        this.showScreen('result-screen');
    }    
    
    // Simple loading screen management
    showSimpleLoading(message, loadingType = 'general') {
        document.getElementById('loading-message').textContent = message;
        this.currentLoadingType = loadingType; // Store for music selection
        this.showScreen('loading-screen');
    }

    hideSimpleLoading(targetScreen) {
        setTimeout(() => {
            this.showScreen(targetScreen);
        }, 300); // Small delay for better UX
    }    
    
    playScreenMusic(screenId) {
        switch(screenId) {
            case 'start-screen':
                this.audioManager.playBackgroundMusic('start');
                break;
            case 'how-to-play-screen':
                // Keep start screen music playing - don't interrupt
                break;
            case 'game-screen':
                this.audioManager.playBackgroundMusic('game');
                break;
            case 'hack-alert-screen':
                this.audioManager.playSoundEffect('alert');
                this.audioManager.playBackgroundMusic('hack');
                break;
            case 'success-alert-screen':
                // Keep success music playing - don't interrupt
                break;
            case 'result-screen':
                // Keep current music (hack or success) playing
                break;
            case 'recap-screen':
                this.audioManager.playBackgroundMusic('hack');
                break;
            case 'loading-screen':
                // Play different music based on loading type
                if (this.currentLoadingType === 'scenario') {
                    this.audioManager.playBackgroundMusic('loadingScenario');
                } else if (this.currentLoadingType === 'ai') {
                    this.audioManager.playBackgroundMusic('loadingAI');
                }
                // For other loading types, keep current music
                break;
            default:
                // For unknown screens, stop music
                this.audioManager.stopBackgroundMusic();
        }
    }
    
    playButtonSound() {
        this.audioManager.playSoundEffect('button');
    }
    
    restartCurrentMusic() {
        if (this.currentScreen) {
            this.playScreenMusic(this.currentScreen);
        }    }
    
    setVolume(volume) {
        this.audioManager.setVolume(volume);
    }

    initializeKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Skip if user is typing in input fields
            if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') {
                return;
            }

            // Only handle up/down arrow keys
            if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') {
                return;
            }

            e.preventDefault();
            
            const scrollAmount = 100;
            const scrollableElement = this.findActiveScrollableElement();
            
            if (scrollableElement) {
                const direction = e.key === 'ArrowUp' ? -scrollAmount : scrollAmount;
                scrollableElement.scrollBy({
                    top: direction,
                    behavior: 'smooth'
                });
            }
        });
    }

    findActiveScrollableElement() {
        // Get the currently active screen
        const activeScreen = document.querySelector('.screen.active');
        if (!activeScreen) {
            return document.querySelector('.content-wrapper');
        }

        // List of scrollable container selectors in priority order
        const scrollableSelectors = [
            '.how-to-play-content',
            '.scenario-container', 
            '.result-content',
            '.recap-content'
        ];

        // Find first scrollable element in active screen
        for (const selector of scrollableSelectors) {
            const element = activeScreen.querySelector(selector);
            if (element && this.isElementScrollable(element)) {
                return element;
            }
        }

        // Fallback to content wrapper
        const contentWrapper = document.querySelector('.content-wrapper');
        if (this.isElementScrollable(contentWrapper)) {
            return contentWrapper;
        }

        return contentWrapper; // Always return something to scroll
    }

    isElementScrollable(element) {
        if (!element) return false;
        return element.scrollHeight > element.clientHeight;
    }
}

// Audio Manager for background music and sound effects
class AudioManager {
    constructor() {
        this.currentBgMusic = null;
        this.masterVolume = 0.15; // Default volume (15%)
        this.musicEnabled = true;
        this.sfxEnabled = true;
        
        // Define folder structure - files will be discovered dynamically
        this.musicFolders = {
            start: 'audio/start/',
            game: 'audio/game/',
            hack: 'audio/hack/',
            success: 'audio/success/',
            loadingScenario: 'audio/loading-scenario/',
            loadingAI: 'audio/loading-ai/'
        };
        
        this.sfxFolders = {
            button: 'audio/sfx/button/',
            alert: 'audio/sfx/alert/'
        };
        
        // Track counts per folder (you can adjust these based on how many files you have)
        this.trackCounts = {
            start: 2,          // Assumes start-1.mp3 through start-2.mp3
            game: 4,           // Assumes game-1.mp3 through game-4.mp3
            hack: 1,           // Assumes hack-1.mp3 through hack-1.mp3
            success: 2,        // Assumes success-1.mp3 through success-2.mp3
            loadingScenario: 4, // Assumes loading-scenario-1.mp3 through loading-scenario-4.mp3
            loadingAI: 8       // Assumes loading-ai-1.mp3 through loading-ai-8.mp3
        };
        
        this.sfxCounts = {
            button: 1,          // Assumes button-1.mp3 through button-4.mp3
            alert: 4            // Assumes alert-1.mp3 through alert-5.mp3
        };
        
        // Pre-create audio elements
        this.bgMusicElements = {};
        this.sfxElements = {};
        
        this.initializeAudioElements();
    }
      initializeAudioElements() {
        // Filename mappings for different naming conventions
        const filenameMap = {
            start: 'start',
            game: 'game', 
            hack: 'hack',
            success: 'success',
            loadingScenario: 'loading-scenario',
            loadingAI: 'loading-ai'
        };
        
        // Create audio elements for background music
        Object.keys(this.musicFolders).forEach(screenType => {
            this.bgMusicElements[screenType] = [];
            const folderPath = this.musicFolders[screenType];
            const trackCount = this.trackCounts[screenType] || 1;
            const filePrefix = filenameMap[screenType] || screenType;
              for (let i = 1; i <= trackCount; i++) {
                const audio = new Audio();
                audio.loop = true;
                // Set volume based on screen type - game music should be quieter
                audio.volume = screenType === 'game' ? 0.2 : this.masterVolume;
                audio.preload = 'auto';
                
                // Dynamic filename using correct prefix
                const filename = `${filePrefix}-${i}.mp3`;
                audio.src = `${folderPath}${filename}`;
                
                // Handle errors gracefully
                audio.addEventListener('error', (e) => {
                    console.warn(`Audio file not found: ${folderPath}${filename}`);
                });
                
                audio.addEventListener('canplaythrough', () => {
                    console.log(`✅ Loaded: ${folderPath}${filename}`);
                });
                
                this.bgMusicElements[screenType].push(audio);
            }
        });
        
        // Create audio elements for sound effects
        Object.keys(this.sfxFolders).forEach(sfxType => {
            this.sfxElements[sfxType] = [];
            const folderPath = this.sfxFolders[sfxType];
            const sfxCount = this.sfxCounts[sfxType] || 1;
            
            for (let i = 1; i <= sfxCount; i++) {
                const audio = new Audio();
                audio.volume = this.masterVolume * 0.7; // SFX slightly quieter
                audio.preload = 'auto';
                
                const filename = `${sfxType}-${i}.mp3`;
                audio.src = `${folderPath}${filename}`;
                
                audio.addEventListener('error', (e) => {
                    console.warn(`SFX file not found: ${folderPath}${filename}`);
                });
                
                this.sfxElements[sfxType].push(audio);
            }
        });
    }      setVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        
        // Update volume for all background music elements
        Object.keys(this.bgMusicElements).forEach(musicType => {
            this.bgMusicElements[musicType].forEach(audio => {
                // Game music should always be lower
                const targetVolume = musicType === 'game' ? this.masterVolume/2.0 : this.masterVolume;
                audio.volume = targetVolume;
            });
        });
        
        // Update volume for all SFX elements
        Object.values(this.sfxElements).forEach(sfxArray => {
            sfxArray.forEach(audio => {
                audio.volume = this.masterVolume * 0.7; // SFX slightly quieter
            });
        });
    }
    
    getRandomTrack(trackArray) {
        if (!trackArray || trackArray.length === 0) return null;
        const randomIndex = Math.floor(Math.random() * trackArray.length);
        return trackArray[randomIndex];
    }
      playBackgroundMusic(musicType) {
        if (!this.musicEnabled) return;
        
        // Stop current background music
        this.stopBackgroundMusic();
        
        const availableTracks = this.bgMusicElements[musicType];
        if (availableTracks && availableTracks.length > 0) {
            // Randomly select a track
            const selectedTrack = this.getRandomTrack(availableTracks);
            
            // Set volume based on music type - game music should be quieter
            const volumeMultiplier = musicType === 'game' ? this.masterVolume/2.0 : this.masterVolume;
            selectedTrack.volume = volumeMultiplier;
            
            console.log(`🎵 Playing random ${musicType} track:`, selectedTrack.src.split('/').pop(), `at volume ${volumeMultiplier}`);
            
            this.currentBgMusic = selectedTrack;
            selectedTrack.currentTime = 0;
            selectedTrack.play().catch(e => {
                console.warn('Could not play background music:', e);
            });
        }
    }
    
    stopBackgroundMusic() {
        if (this.currentBgMusic) {
            this.currentBgMusic.pause();
            this.currentBgMusic.currentTime = 0;
            this.currentBgMusic = null;
        }
    }
    
    playSoundEffect(sfxType) {
        if (!this.sfxEnabled) return;
        
        const availableSfx = this.sfxElements[sfxType];
        if (availableSfx && availableSfx.length > 0) {
            // Randomly select a sound effect
            const selectedSfx = this.getRandomTrack(availableSfx);
            
            console.log(`🔊 Playing random ${sfxType} SFX:`, selectedSfx.src.split('/').pop());
            
            selectedSfx.currentTime = 0;
            selectedSfx.play().catch(e => {
                console.warn('Could not play sound effect:', e);
            });
        }
    }
    
    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;
        if (!this.musicEnabled) {
            this.stopBackgroundMusic();
        }
        return this.musicEnabled;
    }
    
    toggleSfx() {
        this.sfxEnabled = !this.sfxEnabled;
        return this.sfxEnabled;
    }
    
    fadeOut(duration = 1000) {
        if (!this.currentBgMusic) return;
        
        const audio = this.currentBgMusic;
        const startVolume = audio.volume;
        const fadeStep = startVolume / (duration / 200);
        
        const fadeInterval = setInterval(() => {
            if (audio.volume > fadeStep) {
                audio.volume -= fadeStep;
            } else {
                audio.volume = 0;
                audio.pause();
                clearInterval(fadeInterval);
                audio.volume = startVolume; // Reset for next time
            }
        }, 200);
    }
}

// Add custom CSS animations
const additionalStyles = `
@keyframes glitch {
    0% { transform: translateX(0); filter: hue-rotate(0deg); }
    20% { transform: translateX(-2px); filter: hue-rotate(90deg); }
    40% { transform: translateX(2px); filter: hue-rotate(180deg); }
    60% { transform: translateX(-1px); filter: hue-rotate(270deg); }
    80% { transform: translateX(1px); filter: hue-rotate(360deg); }
    100% { transform: translateX(0); filter: hue-rotate(0deg); }
}

@keyframes float-up {
    0% {
        transform: translateY(0) rotate(0deg);
        opacity: 1;
    }
    100% {
        transform: translateY(-100vh) rotate(360deg);
        opacity: 0;
    }
}
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new HackedByAIGame();
});

// Add some console easter eggs for the curious
console.log(`
██╗  ██╗ █████╗  ██████╗██╗  ██╗███████╗██████╗     ██████╗ ██╗   ██╗     █████╗ ██╗
██║  ██║██╔══██╗██╔════╝██║ ██╔╝██╔════╝██╔══██╗    ██╔══██╗╚██╗ ██╔╝    ██╔══██╗██║
███████║███████║██║     █████╔╝ █████╗  ██║  ██║    ██████╔╝ ╚████╔╝     ███████║██║
██╔══██║██╔══██║██║     ██╔═██╗ ██╔══╝  ██║  ██║    ██╔══██╗  ╚██╔╝      ██╔══██║██║
██║  ██║██║  ██║╚██████╗██║  ██╗███████╗██████╔╝    ██████╔╝   ██║       ██║  ██║██║
╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚═════╝     ╚═════╝    ╚═╝       ╚═╝  ╚═╝╚═╝

Welcome to the source code! This is an INFINITE SURVIVAL cybersecurity game powered by Claude AI.
How many levels can YOU survive? The AI gets tougher as you progress! 🛡️
`);

console.log("🎯 SURVIVAL MODE: This infinite cybersecurity challenge uses Anthropic's Claude AI to generate endless unique scenarios and evaluate your responses. Beat your high score! Be specific and technically accurate!");
