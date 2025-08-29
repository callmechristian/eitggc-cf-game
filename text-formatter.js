// Text Formatter for AI-generated content
// Handles custom markdown-like formatting for scenario and evaluation text

class TextFormatter {    constructor() {
        // Define formatting rules and their corresponding HTML
        // Order matters - more specific rules should come first
        this.formatRules = [   
            // Quotes with «text» (before other patterns that might interfere)
            {
                pattern: /«(.+)»/g,
                replacement: '<span class="text-quote">"$1"</span>'
            },      
            // Email addresses (avoid matching inside HTML tags)
            {
                pattern: /\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b(?![^<]*<\/span>)/g,
                replacement: '<span class="text-email">$1</span>'
            },
            // IP addresses (before other rules)
            {
                pattern: /\b(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\b/g,
                replacement: '<span class="text-ip">$1</span>'
            },
            // File extensions (before other rules)
            {
                pattern: /\b(\w+\.(exe|pdf|doc|docx|zip|rar|jpg|png|gif|mp3|mp4|txt|js|html|css|php|py))\b/gi,
                replacement: '<span class="text-file">$1</span>'
            },
            // Bold text with **text** (must come before single asterisk)
            {
                pattern: /\*\*([^*]+?)\*\*/g,
                replacement: '<span class="text-bold">$1</span>'
            },
            // Code/technical terms with `code`
            {
                pattern: /`([^`]+?)`/g,
                replacement: '<span class="text-code">$1</span>'
            },
            // Single quotes with ''text'' (avoid HTML conflicts)
            {
                pattern: /\'\'([^'\]]*?)\'\'/g,
                replacement: '<span class="text-highlight">$1</span>'
            },
            // Warning text with ![text!] (allow any content including backticks)
            {
                pattern: /!\[([^!\]]*?)!\]/g,
                replacement: '<span class="text-warning">$1</span>'
            },
            // Success/positive text with +[text+]
            {
                pattern: /\+\[([^+\]]*?)\+\]/g,
                replacement: '<span class="text-success">$1</span>'
            },
            // Error/negative text with -[text-] (avoid matching HTML and other patterns)
            {
                pattern: /\-\[([^-\]]*?)\-\]/g,
                replacement: '<span class="text-error">$1</span>'
            },
            // Cyber/tech emphasis with #[text#]
            {
                pattern: /\#\[([^#\]]*?)\#\]/g,
                replacement: '<span class="text-cyber">$1</span>'
            },
            // Numbered lists with 1), 2), 3) etc
            {
                pattern: /(\d+)\)/g,
                replacement: '<span class="text-numbered-list">$1)</span>'
            },
            // Important notes with [text]
            {
                pattern: /\[([^\]]+?)\]/g,
                replacement: '<span class="text-note">$1</span>'
            },
            // Italic text with *text* (after bold, simple pattern)
            {
                pattern: /\*([^*]+?)\*/g,
                replacement: '<span class="text-italic">$1</span>'
            },
            // Social tags starting with @username
            {
                pattern: /@([a-zA-Z0-9_]+)/g,
                replacement: '<span class="text-highlight">@$1</span>'
            }
        ];
    }    /**
     * Format text using custom markdown-like syntax
     * @param {string} text - Raw text to format
     * @param {string} type - Type of content ('scenario', 'evaluation', 'explanation')
     * @returns {string} - Formatted HTML text
     */
    formatText(text, type = 'general') {
        if (!text || typeof text !== 'string') {
            return text;
        }

        let formattedText = text;

        // Apply formatting rules carefully to avoid conflicts
        this.formatRules.forEach((rule, index) => {
            const before = formattedText;
            formattedText = formattedText.replace(rule.pattern, rule.replacement);
            // Debug logging for problematic patterns
            if (text.includes('{"') || text.includes('!WARNING')) {
                console.log(`Rule ${index}: ${rule.pattern} | Before: "${before}" | After: "${formattedText}"`);
            }
        });// Clean up any double-nested spans (happens when patterns interfere)
        formattedText = formattedText.replace(/<span class="text-code">([^<]*)<span class="text-email">([^<]*)<\/span>([^<]*)<\/span>/g, '<span class="text-code">$1$2$3</span>');
        
        // Clean up any malformed HTML from pattern conflicts
        formattedText = formattedText.replace(/>\s*">/g, '">');
        formattedText = formattedText.replace(/"\s*>/g, '">');
        
        // Fix any stray quote marks that got separated
        formattedText = formattedText.replace(/"\s*>/g, '">');
        formattedText = formattedText.replace(/>\s*"/g, '>"');

        return formattedText;
    }

    /**
     * Initialize CSS styles for formatting
     */
    initializeStyles() {
        const styles = `
            /* Text Formatting Styles */
            .text-bold {
                font-weight: 700;
                color: #ffffff;
            }

            .text-italic {
                font-style: italic;
                color: #a4b0be;
            }

            .text-code {
                font-family: 'JetBrains Mono', monospace;
                background: rgba(0, 210, 211, 0.1);
                color: #00d2d3;
                padding: 2px 6px;
                border-radius: 4px;
                border: 1px solid rgba(0, 210, 211, 0.3);
                font-size: 0.9em;
                display: inline-block;
                line-height: 1.4;
                margin: 1px 0;
            }

            .text-quote {
                background: rgba(255, 107, 122, 0.15);
                color: #ffffff;
                padding: 2px 4px;
                border-radius: 3px;
                font-weight: 500;
                border: 1px solid rgba(255, 107, 122, 0.3);
                display: inline-block;
                line-height: 1.4;
                margin: 1px 0;
            }

            .text-highlight {
                background: linear-gradient(45deg, rgba(255, 107, 122, 0.2), rgba(0, 210, 211, 0.2));
                color: #ffffff;
                padding: 2px 4px;
                border-radius: 3px;
                font-weight: 500;
                display: inline-block;
                line-height: 1.4;
                margin: 1px 0;
            }

            .text-warning {
                color: #ffa502;
                font-weight: 600;
                animation: pulse-warning 2s infinite;
            }

            .text-success {
                color: #2ed573;
                font-weight: 600;
            }

            .text-error {
                color: #ff6b7a;
                font-weight: 600;
            }

            .text-cyber {
                color: #00d2d3;
                font-weight: 700;
                text-shadow: 0 0 8px rgba(0, 210, 211, 0.5);
                animation: cyber-glow 3s ease-in-out infinite alternate;
            }

            .text-note {
                background: rgba(255, 255, 255, 0.1);
                color: #e0e0e0;
                padding: 4px 8px;
                border-radius: 6px;
                border-left: 3px solid #00d2d3;
                display: inline-block;
                margin: 2px 0;
            }

            .text-email {
                color: #fd79a8;
                font-family: 'JetBrains Mono', monospace;
                font-size: 0.9em;
            }            .text-ip {
                color: #fdcb6e;
                font-family: 'JetBrains Mono', monospace;
                background: rgba(253, 203, 110, 0.1);
                padding: 2px 4px;
                border-radius: 3px;
                display: inline-block;
                line-height: 1.4;
                margin: 1px 0;
            }

            .text-file {
                color: #a29bfe;
                font-family: 'JetBrains Mono', monospace;
                background: rgba(162, 155, 254, 0.1);
                padding: 2px 4px;
                border-radius: 3px;
                display: inline-block;
                line-height: 1.4;
                margin: 1px 0;
            }

            .text-numbered-list {
                color: #00d2d3;
                font-weight: 600;
                font-family: 'JetBrains Mono', monospace;
                margin-right: 2px;
                margin-left: 4px;
                text-shadow: 0 0 4px rgba(0, 210, 211, 0.3);
            }

            /* Animations */
            @keyframes pulse-warning {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.7; }
            }

            @keyframes cyber-glow {
                0% { 
                    text-shadow: 0 0 8px rgba(0, 210, 211, 0.5);
                }
                100% { 
                    text-shadow: 0 0 12px rgba(0, 210, 211, 0.8);
                }
            }
        `;

        // Check if styles are already injected
        if (typeof document !== 'undefined' && !document.getElementById('text-formatter-styles')) {
            const styleSheet = document.createElement('style');
            styleSheet.id = 'text-formatter-styles';
            styleSheet.textContent = styles;
            document.head.appendChild(styleSheet);
        }
    }
}

// Initialize global text formatter instance
const textFormatter = new TextFormatter();

// Initialize styles when DOM is ready (browser only)
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        textFormatter.initializeStyles();
    });
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TextFormatter;
}
