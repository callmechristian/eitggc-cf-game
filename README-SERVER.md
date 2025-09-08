# Hacked by AI - Server Setup

This cybersecurity challenge game has been converted from Electron to a web-based server architecture using Node.js and Express.

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure API Key
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` file and add your Claude API key:
   ```
   CLAUDE_API_KEY=your_actual_api_key_here
   PORT=3000
   ```

3. Get your Claude API key from: https://console.anthropic.com/

### 3. Run the Server

**Development mode (with auto-restart):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

### 4. Play the Game
Open your browser and navigate to:
```
http://localhost:3000
```

## Server Endpoints

- `GET /` - Serves the game interface
- `POST /api/claude` - Claude AI API endpoint
- `GET /health` - Health check endpoint

## Architecture Changes

- **Before**: Electron app with direct Claude API calls from main process
- **After**: Web server with Claude API calls from backend, frontend uses fetch API

## Files Modified

- `claude-ai.js` - Updated to use server API instead of Electron API
- `server.js` - New Express server with Claude API integration
- `package.json` - Updated scripts and dependencies
- `.env.example` - Environment variable template

## Deployment

When deploying to a server:

1. Set environment variables (especially `CLAUDE_API_KEY`)
2. Install dependencies: `npm install`
3. Run: `npm start`
4. Ensure port 3000 (or your chosen port) is accessible

## Security Notes

- Keep your Claude API key secure
- Never commit the `.env` file to version control
- The server handles CORS for web browser access