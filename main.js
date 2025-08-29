const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fetch = require('node-fetch');

// Configure dotenv with explicit path for packaged app
require('dotenv').config({ 
  path: path.join(__dirname, '.env')
});

// Fallback config for packaged apps
const config = require('./config.js');

// Get API key from environment variable or config fallback
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY || config.CLAUDE_API_KEY;

// Debug logging
console.log('🔍 Debug info:');
console.log('  __dirname:', __dirname);
console.log('  .env path:', path.join(__dirname, '.env'));
console.log('  API key loaded:', CLAUDE_API_KEY ? '✅ Yes' : '❌ No');

if (!CLAUDE_API_KEY) {
  console.error('❌ No Claude API key found! Please set CLAUDE_API_KEY in your .env file');
}

let mainWindow;

const createWindow = () => {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'icon.png'),
    title: 'Hacked by AI - Cybersecurity Challenge',
    show: false,
    backgroundColor: '#0a0a0a'
  });

  // Load the app
  mainWindow.loadFile('index.html');

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
};

// Handle Claude AI API calls from renderer process
ipcMain.handle('claude-api', async (event, prompt) => {
  const maxRetries = 3;
  const baseDelay = 1000; // 1 second
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {    try {
      console.log(`Claude API attempt ${attempt}/${maxRetries}`);
        const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',        headers: {
          'x-api-key': CLAUDE_API_KEY,
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
        console.log('✅ Claude API success on attempt', attempt);
        return { success: true, data: data.content[0].text };      } else {
        const errorText = await response.text();
        console.log(`❌ Claude API error ${response.status}: ${errorText}`);
        
        // Parse error details for better error reporting
        let errorDetails = null;
        try {
          errorDetails = JSON.parse(errorText);
        } catch (parseError) {
          errorDetails = { raw: errorText };
        }
        
        // Handle specific error codes
        if (response.status === 529) {
          throw new Error('Claude API is overloaded. Please try again in a moment.');
        } else if (response.status === 401) {
          throw new Error('Claude API authentication failed. Check your API key.');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait before trying again.');
        } else {
          // Create detailed error object
          const detailedError = {
            status: response.status,
            statusText: response.statusText,
            message: `Claude API error: ${response.status} ${response.statusText}`,
            details: errorDetails,
            fullResponse: errorText
          };
          throw detailedError;
        }
      }    } catch (error) {
      console.error(`Claude API attempt ${attempt} failed:`, error);
      
      // If this was the last attempt, return the error with full details
      if (attempt === maxRetries) {
        return { 
          success: false, 
          error: error.message || error,
          errorDetails: error.details || null,
          fullError: error,
          shouldFallback: true 
        };
      }
      
      // Wait before retrying (exponential backoff)
      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.log(`⏳ Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
});

// App event handlers
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
