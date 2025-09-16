# Hacked by AI - Cybersecurity Challenge Game

A modern cybersecurity education game powered by Claude AI, designed to test and improve cybersecurity awareness through AI-generated scenarios.

## 🎯 Features

- **AI-Generated Scenarios**: Unique cybersecurity challenges created by Claude AI
- **Password Protection**: Secure access system with JWT authentication
- **Real-time Evaluation**: AI evaluates responses and provides detailed feedback
- **Modern UI**: Cyberpunk-themed interface with smooth animations
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Educational Focus**: Designed for high school cybersecurity education

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Vercel account (for deployment)
- Claude API key from Anthropic

### Local Development

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd eitggc-cf-game
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add:
   ```env
   CLAUDE_API_KEY=your_claude_api_key_here
   GAME_PASSWORD=your_game_password_here
   JWT_SECRET=your_jwt_secret_here
   ```

3. **Run locally:**
   ```bash
   npm run dev
   ```
   
   Open http://localhost:3000

### Deployment to Vercel

1. **Deploy to Vercel:**
   ```bash
   vercel --prod
   ```

2. **Set environment variables in Vercel dashboard:**
   - `CLAUDE_API_KEY`: Your Claude API key
   - `GAME_PASSWORD`: Password for game access
   - `JWT_SECRET`: Secret for JWT token signing (32+ characters)

## 🎮 How to Play

1. **Access**: Enter the game password on the login screen
2. **Scenarios**: Read each AI-generated cybersecurity scenario carefully
3. **Respond**: Type your specific response to the security threat
4. **Evaluation**: AI evaluates your response and provides feedback
5. **Learn**: Review correct actions and improve your cybersecurity knowledge

## 🏗️ Architecture

### Web Application Structure
```
├── index.html              # Password protection screen
├── game.html              # Main game interface
├── styles.css             # Game styling
├── claude-ai.js           # Frontend API client
├── text-formatter.js      # Text formatting utilities
├── scenarios.js           # Scenario management
├── script.js              # Game logic
├── api/
│   ├── verify-password.js # Password verification endpoint
│   ├── validate-token.js  # JWT token validation
│   ├── evaluate.js        # Scenario evaluation endpoint
│   └── generate-scenario.js # Scenario generation endpoint
└── vercel.json            # Vercel configuration
```

### API Endpoints
- `POST /api/verify-password` - Authenticate user with password
- `POST /api/validate-token` - Validate JWT token
- `POST /api/evaluate` - Evaluate user response to scenario
- `POST /api/generate-scenario` - Generate new AI scenario

## 🔒 Security Features

- **Server-side password storage** - Password never exposed to frontend
- **JWT authentication** - Secure token-based session management
- **API rate limiting** - Built-in protection against brute force
- **Input validation** - All inputs validated server-side
- **CORS protection** - Properly configured cross-origin requests

## 🎨 Customization

### Change Game Password
Update the `GAME_PASSWORD` environment variable in your Vercel dashboard.

### Modify AI Prompts
Edit the prompt templates in:
- `api/evaluate.js` - For evaluation prompts
- `api/generate-scenario.js` - For scenario generation prompts

### Update Styling
Modify `styles.css` for visual customization. The design uses a cyberpunk theme with:
- Color palette: `#ff4757` (red), `#00d2d3` (cyan), `#0a0a0a` (dark)
- Fonts: Inter and JetBrains Mono
- Glassmorphism effects and smooth animations

## 📚 Educational Use

This game is designed for:
- High school cybersecurity courses
- Corporate security training
- Cybersecurity awareness programs
- Self-paced learning

### Target Audience
- High school students
- Cybersecurity beginners
- Anyone wanting to improve security awareness

## 🛠️ Development

### Project Structure
- **Frontend**: JavaScript, HTML5, CSS3
- **Backend**: Vercel serverless functions (Node.js)
- **AI Integration**: Claude API for scenario generation and evaluation
- **Authentication**: JWT-based with server-side validation

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Credits

- **AI**: Powered by Anthropic's Claude AI
- **Design**: Cyberpunk-inspired UI with modern web technologies
- **Education**: Built for EITGGC cybersecurity education

## 📞 Support

For issues or questions:
1. Check the GitHub issues
2. Contact your instructor (for students)
3. Review the API documentation

---

**Made with 🔒 for cybersecurity education**