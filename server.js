const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Claude AI API integration
async function callClaudeAPI(prompt) {
    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.CLAUDE_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-opus-4-1-20250805',
                max_tokens: 4000,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ]
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            console.error('Claude API Error:', data);
            return {
                success: false,
                error: data.error?.message || 'Unknown API error',
                errorDetails: data.error,
                fullError: data
            };
        }

        return {
            success: true,
            data: data.content[0].text
        };
    } catch (error) {
        console.error('Network/Parse Error:', error);
        return {
            success: false,
            error: error.message,
            errorDetails: null,
            fullError: error
        };
    }
}

// API Routes
app.post('/api/claude', async (req, res) => {
    try {
        const { prompt } = req.body;
        
        if (!prompt) {
            return res.status(400).json({
                success: false,
                error: 'Prompt is required'
            });
        }

        const result = await callClaudeAPI(prompt);
        res.json(result);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            errorDetails: error.message
        });
    }
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
    console.log(`🚀 Hacked by AI server running on port ${port}`);
    console.log(`🌐 Open http://localhost:${port} to play the game`);
    console.log(`🤖 Claude API Key: ${process.env.CLAUDE_API_KEY ? 'Configured' : 'Missing - add to .env file'}`);
});