// Grok API Service with TypeScript interfaces and comprehensive error handling
import { repoAnalyzer, CodebaseContext } from '../utils/repoAnalyzer';

export interface GrokMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GrokRequest {
  model: string;
  messages: GrokMessage[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  stream?: boolean;
}

export interface GrokResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface GrokError {
  error: {
    message: string;
    type: string;
    code?: string;
  };
}

export interface GrokServiceConfig {
  apiKey: string;
  apiUrl: string;
  model: string;
  timeout: number;
  maxRetries: number;
  useMockResponses: boolean;
}

// Mock responses for development and testing
const MOCK_RESPONSES = [
  {
    blockchain: `# Blockchain Technology Overview

**Blockchain** is a distributed ledger technology that maintains a continuously growing list of records, called blocks, which are linked and secured using cryptography.

## Key Features:
- **Decentralization**: No single point of control
- **Immutability**: Records cannot be altered once confirmed
- **Transparency**: All transactions are publicly visible
- **Consensus**: Network agreement on transaction validity

## How it works:
1. Transaction initiated
2. Transaction broadcast to network
3. Network validates transaction
4. Transaction recorded in a block
5. Block added to chain
6. Transaction complete

\`\`\`javascript
// Simple blockchain structure
class Block {
  constructor(data, previousHash) {
    this.timestamp = Date.now();
    this.data = data;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
  }
}
\`\`\`

This technology powers cryptocurrencies like Bitcoin and Ethereum, and has applications in supply chain, healthcare, and finance.`,

    cryptocurrency: `# Cryptocurrency Fundamentals

**Cryptocurrency** is a digital or virtual currency that uses cryptography for security and operates independently of traditional banking systems.

## Popular Cryptocurrencies:

### Bitcoin (BTC)
- First and largest cryptocurrency
- Digital gold and store of value
- Limited supply of 21 million coins

### Ethereum (ETH)
- Smart contract platform
- Enables decentralized applications (DApps)
- Proof-of-Stake consensus mechanism

### Other Notable Coins:
- **Cardano (ADA)**: Research-driven blockchain
- **Solana (SOL)**: High-performance blockchain
- **Polygon (MATIC)**: Ethereum scaling solution

## Key Concepts:

> **Wallet**: Software that stores your private keys
> **Private Key**: Secret code that proves ownership
> **Public Key**: Address others can send crypto to

## Trading Basics:
1. Choose a reputable exchange
2. Complete KYC verification
3. Deposit funds
4. Place buy/sell orders
5. Store coins securely

⚠️ **Important**: Never share your private keys and always use hardware wallets for large amounts.`,

    defi: `# Decentralized Finance (DeFi)

**DeFi** refers to financial services built on blockchain technology that operate without traditional intermediaries like banks.

## Core DeFi Protocols:

### Lending & Borrowing
- **Aave**: Decentralized lending protocol
- **Compound**: Algorithmic money markets
- **MakerDAO**: Decentralized stablecoin system

### Decentralized Exchanges (DEXs)
- **Uniswap**: Automated market maker
- **SushiSwap**: Community-driven DEX
- **1inch**: DEX aggregator

### Yield Farming
- Provide liquidity to earn rewards
- Higher returns but increased risk
- Impermanent loss considerations

## Smart Contract Example:
\`\`\`solidity
pragma solidity ^0.8.0;

contract SimpleLending {
    mapping(address => uint256) public deposits;
    
    function deposit() external payable {
        deposits[msg.sender] += msg.value;
    }
    
    function withdraw(uint256 amount) external {
        require(deposits[msg.sender] >= amount);
        deposits[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
    }
}
\`\`\`

## Risks:
• Smart contract vulnerabilities
• Regulatory uncertainty
• High volatility
• Impermanent loss in liquidity pools`,

    nft: `# Non-Fungible Tokens (NFTs)

**NFTs** are unique digital assets that represent ownership of specific items on the blockchain.

## What makes NFTs special:
- **Uniqueness**: Each token is one-of-a-kind
- **Ownership**: Verifiable on blockchain
- **Transferability**: Can be bought, sold, traded
- **Programmability**: Smart contract functionality

## Popular NFT Categories:

### Digital Art
- Profile pictures (PFPs)
- Generative art collections
- 1/1 artistic pieces

### Gaming Assets
- In-game items and characters
- Virtual land and properties
- Play-to-earn rewards

### Utility NFTs
- Membership tokens
- Access passes
- Governance rights

## Technical Standards:
- **ERC-721**: Standard for unique tokens
- **ERC-1155**: Multi-token standard
- **Metadata**: JSON describing NFT properties

## Creating an NFT:
1. Create digital content
2. Choose blockchain (Ethereum, Polygon, etc.)
3. Upload to IPFS for decentralized storage
4. Mint on marketplace (OpenSea, Foundation)
5. List for sale or auction

\`\`\`json
{
  "name": "My NFT",
  "description": "A unique digital asset",
  "image": "ipfs://QmHash...",
  "attributes": [
    {"trait_type": "Color", "value": "Blue"},
    {"trait_type": "Rarity", "value": "Rare"}
  ]
}
\`\`\`

💡 **Tip**: Always verify authenticity and check the creator's reputation before purchasing NFTs.`
  }
];

class GrokService {
  private config: GrokServiceConfig;
  private codebaseContext: CodebaseContext | null = null;

  constructor(config: GrokServiceConfig) {
    this.config = config;
    this.initializeCodebaseContext();
  }

  // Initialize codebase context
  private async initializeCodebaseContext(): Promise<void> {
    try {
      this.codebaseContext = await repoAnalyzer.getCodebaseContext();
      console.log('Codebase context initialized:', this.codebaseContext.summary);
    } catch (error) {
      console.warn('Failed to initialize codebase context:', error);
    }
  }

  // Check if query is code-related
  private isCodeRelatedQuery(query: string): boolean {
    const codeKeywords = [
      'component', 'function', 'code', 'implement', 'fix', 'error', 'bug',
      'react', 'typescript', 'redux', 'state', 'props', 'hook', 'css',
      'style', 'ui', 'interface', 'class', 'method', 'variable', 'import',
      'export', 'jsx', 'tsx', 'file', 'folder', 'structure', 'architecture',
      'debug', 'refactor', 'optimize', 'performance', 'build', 'deploy'
    ];
    
    const queryLower = query.toLowerCase();
    return codeKeywords.some(keyword => queryLower.includes(keyword));
  }

  // Get relevant file content for code-related queries
  private async getRelevantCodeContext(userQuery: string): Promise<string> {
    try {
      const relevantFiles = await repoAnalyzer.getRelevantFiles(userQuery);
      
      if (relevantFiles.length === 0) {
        return '';
      }

      let codeContext = '\n\n## Relevant Code Files:\n';
      
      // For now, we'll just list the relevant files
      // In a full implementation, you might want to fetch actual file contents
      codeContext += relevantFiles.map(file => 
        `- **${file.name}**: ${file.path}`
      ).join('\n');

      // Add specific guidance based on file types
      const hasComponents = relevantFiles.some(f => f.path.includes('/components/'));
      const hasStore = relevantFiles.some(f => f.path.includes('/store/'));
      const hasServices = relevantFiles.some(f => f.path.includes('/services/'));

      if (hasComponents) {
        codeContext += '\n\n*These are React components using TypeScript and Tailwind CSS for styling.*';
      }
      if (hasStore) {
        codeContext += '\n\n*These files handle Redux state management with Redux Toolkit.*';
      }
      if (hasServices) {
        codeContext += '\n\n*These are service files that handle API calls and external integrations.*';
      }

      return codeContext;
    } catch (error) {
      console.warn('Failed to get relevant code context:', error);
      return '';
    }
  }

  // System prompt for blockchain/cryptocurrency context with dynamic codebase context
  private async getSystemPrompt(userQuery?: string): Promise<string> {
    // Ensure codebase context is available
    if (!this.codebaseContext) {
      try {
        this.codebaseContext = await repoAnalyzer.getCodebaseContext();
      } catch (error) {
        console.warn('Failed to get codebase context for system prompt:', error);
      }
    }

    let basePrompt = `You are a knowledgeable blockchain and cryptocurrency expert assistant. You provide accurate, helpful, and educational information about:

- Blockchain technology and its applications
- Cryptocurrencies (Bitcoin, Ethereum, altcoins)
- DeFi (Decentralized Finance) protocols and concepts
- NFTs (Non-Fungible Tokens) and digital assets
- Smart contracts and dApps
- Trading strategies and market analysis
- Security best practices and wallet management
- Regulatory developments and compliance`;

    // Add codebase context if available
    if (this.codebaseContext) {
      basePrompt += `

## Current Codebase Context:
You are also assisting with a ${this.codebaseContext.summary}

**Project Technologies:** ${this.codebaseContext.technologies.join(', ')}

**Key Project Components:**
${this.codebaseContext.keyFiles.map(file => `- ${file.name} (${file.path})`).join('\n')}

When users ask about code, components, or technical implementation details, you can reference this codebase structure and provide specific guidance related to:
- React components and TypeScript implementation
- Redux state management patterns
- Grok API integration and chat functionality
- UI/UX improvements and Tailwind CSS styling
- File organization and project architecture

You can help with debugging, code improvements, feature additions, and explaining how different parts of the application work together.`;
    }

    // Add relevant code context if this appears to be a code-related query
    if (userQuery && this.isCodeRelatedQuery(userQuery)) {
      const codeContext = await this.getRelevantCodeContext(userQuery);
      basePrompt += codeContext;
    }

    basePrompt += `

Format your responses with:
- Clear headings using # and ##
- Code blocks with \`\`\` for technical examples
- Bullet points and numbered lists for clarity
- **Bold** text for emphasis
- > Blockquotes for important warnings or tips
- Proper markdown formatting

Always provide accurate, up-to-date information and include relevant warnings about risks when discussing investments or trading.`;

    return basePrompt;
  }

  // Get mock response based on message content
  private async getMockResponse(message: string): Promise<string> {
    const lowerMessage = message.toLowerCase();
    
    // Check for code-related queries first
    if (this.isCodeRelatedQuery(message)) {
      const codeContext = await this.getRelevantCodeContext(message);
      return `# Code Assistance

Thank you for your code-related question: "${message}"

I can help you with this React/TypeScript application. Here's what I understand about your codebase:

${this.codebaseContext ? `**Project:** ${this.codebaseContext.summary}

**Technologies:** ${this.codebaseContext.technologies.join(', ')}` : ''}

${codeContext}

## How I can help:
- **React Components**: Creating, modifying, and optimizing React components
- **TypeScript**: Type definitions, interfaces, and type safety
- **Redux State Management**: Actions, reducers, and selectors
- **Tailwind CSS**: Styling and responsive design
- **Grok API Integration**: Chat functionality and API calls
- **Code Architecture**: File organization and best practices

Please provide more specific details about what you'd like to implement or fix, and I'll give you detailed code examples and explanations.

\`\`\`typescript
// Example: Basic React component structure
interface ComponentProps {
  // Define your props here
}

const MyComponent: React.FC<ComponentProps> = ({ }) => {
  return (
    <div className="tailwind-classes">
      {/* Your component content */}
    </div>
  );
};

export default MyComponent;
\`\`\`

What specific aspect would you like help with?`;
    }
    
    if (lowerMessage.includes('blockchain') || lowerMessage.includes('distributed ledger')) {
      return MOCK_RESPONSES[0].blockchain;
    } else if (lowerMessage.includes('cryptocurrency') || lowerMessage.includes('bitcoin') || lowerMessage.includes('ethereum')) {
      return MOCK_RESPONSES[0].cryptocurrency;
    } else if (lowerMessage.includes('defi') || lowerMessage.includes('decentralized finance') || lowerMessage.includes('lending')) {
      return MOCK_RESPONSES[0].defi;
    } else if (lowerMessage.includes('nft') || lowerMessage.includes('non-fungible')) {
      return MOCK_RESPONSES[0].nft;
    }
    
    // Default response
    return `# Blockchain & Cryptocurrency Information

Thank you for your question: "${message}"

I'm here to help you understand blockchain technology and cryptocurrency concepts. Here are some areas I can assist with:

## Topics I can help with:
- **Blockchain fundamentals** and how it works
- **Cryptocurrency** basics and trading
- **DeFi protocols** and yield farming
- **NFTs** and digital collectibles
- **Smart contracts** and dApps
- **Security practices** and wallet management

## Quick Tips:
> Always do your own research (DYOR) before making investment decisions
> Never share your private keys or seed phrases
> Start with small amounts when learning to trade

Feel free to ask specific questions about any blockchain or cryptocurrency topic, and I'll provide detailed, educational responses with examples and best practices.

\`\`\`javascript
// Example: Simple blockchain verification
function verifyTransaction(transaction, blockchain) {
  return blockchain.isValid(transaction);
}
\`\`\`

What specific aspect would you like to learn more about?`;
  }

  // Retry logic with exponential backoff
  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = this.config.maxRetries
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          throw lastError;
        }
        
        // Exponential backoff: 1s, 2s, 4s, 8s...
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  }

  // Format and validate API response
  private formatResponse(response: GrokResponse): string {
    if (!response.choices || response.choices.length === 0) {
      throw new Error('No response choices received from Grok API');
    }

    const choice = response.choices[0];
    if (!choice.message || !choice.message.content) {
      throw new Error('Invalid response format from Grok API');
    }

    let content = choice.message.content.trim();
    
    // Ensure proper markdown formatting for blockchain content
    content = this.enhanceMarkdownFormatting(content);
    
    return content;
  }

  // Enhance markdown formatting for better display
  private enhanceMarkdownFormatting(content: string): string {
    // Ensure code blocks are properly formatted
    content = content.replace(/```(\w+)?\n/g, '```$1\n');
    
    // Ensure proper spacing around headers
    content = content.replace(/^(#{1,6})\s*(.+)$/gm, '$1 $2\n');
    
    // Ensure proper list formatting
    content = content.replace(/^(\d+\.)\s*(.+)$/gm, '$1 $2');
    content = content.replace(/^([•\-\*])\s*(.+)$/gm, '• $2');
    
    // Ensure proper blockquote formatting
    content = content.replace(/^>\s*(.+)$/gm, '> $1');
    
    return content;
  }

  // Main method to send message to Grok API
  async sendMessage(message: string, conversationHistory: GrokMessage[] = []): Promise<string> {
    console.log('GrokService.sendMessage called', {
      message,
      useMockResponses: this.config.useMockResponses,
      apiKey: this.config.apiKey ? 'Set' : 'Not set',
      config: this.config
    });
    
    // Use mock responses in development or when API is unavailable
    if (this.config.useMockResponses) {
      console.log('Using mock responses');
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
      const mockResponse = await this.getMockResponse(message);
      console.log('Mock response generated:', mockResponse.substring(0, 100) + '...');
      return mockResponse;
    }

    if (!this.config.apiKey || this.config.apiKey === 'REMOVED') {
      throw new Error('Grok API key not configured. Please set REACT_APP_GROK_API_KEY in your environment variables.');
    }

    const systemPrompt = await this.getSystemPrompt(message);
    const messages: GrokMessage[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    const requestBody: GrokRequest = {
      model: this.config.model,
      messages,
      max_tokens: 2000,
      temperature: 0.7,
      top_p: 0.9,
      stream: false
    };

    return this.retryWithBackoff(async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      try {
        const response = await fetch(`${this.config.apiUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`,
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData: GrokError = await response.json().catch(() => ({
            error: { message: `HTTP ${response.status}: ${response.statusText}`, type: 'http_error' }
          }));
          
          // Provide user-friendly error messages
          let userMessage = errorData.error.message;
          if (response.status === 401) {
            userMessage = 'Invalid API key. Please check your Grok API configuration.';
          } else if (response.status === 429) {
            userMessage = 'Rate limit exceeded. Please wait a moment before sending another message.';
          } else if (response.status >= 500) {
            userMessage = 'Grok service is temporarily unavailable. Please try again later.';
          } else if (response.status === 403) {
            userMessage = 'Access denied. Please check your API key permissions.';
          }
          
          throw new Error(userMessage);
        }

        const data: GrokResponse = await response.json();
        return this.formatResponse(data);

      } catch (error) {
        clearTimeout(timeoutId);
        
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            throw new Error('Request timeout - Grok API took too long to respond');
          }
          throw error;
        }
        
        throw new Error('Unknown error occurred while calling Grok API');
      }
    });
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    if (this.config.useMockResponses) {
      return true;
    }

    try {
      await this.sendMessage('Hello', []);
      return true;
    } catch {
      return false;
    }
  }

  // Get service configuration
  getConfig(): GrokServiceConfig {
    return { ...this.config };
  }

  // Update configuration
  updateConfig(updates: Partial<GrokServiceConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  // Refresh codebase context (useful when files change)
  async refreshCodebaseContext(): Promise<void> {
    try {
      repoAnalyzer.clearCache();
      this.codebaseContext = await repoAnalyzer.getCodebaseContext();
      console.log('Codebase context refreshed:', this.codebaseContext.summary);
    } catch (error) {
      console.warn('Failed to refresh codebase context:', error);
    }
  }

  // Get current codebase context
  getCodebaseContext(): CodebaseContext | null {
    return this.codebaseContext;
  }
}

// Create and export service instance
const createGrokService = (): GrokService => {
  const config: GrokServiceConfig = {
    apiKey: process.env.REACT_APP_GROK_API_KEY || 'REMOVED',
    apiUrl: process.env.REACT_APP_GROK_API_URL || 'https://api.x.ai/v1',
    model: process.env.REACT_APP_GROK_MODEL || 'grok-beta',
    timeout: parseInt(process.env.REACT_APP_API_TIMEOUT || '30000'),
    maxRetries: parseInt(process.env.REACT_APP_MAX_RETRIES || '3'),
    useMockResponses: process.env.REACT_APP_USE_MOCK_RESPONSES === 'true' || 
                     !process.env.REACT_APP_GROK_API_KEY ||
                     process.env.REACT_APP_GROK_API_KEY === 'REMOVED'
  };

  return new GrokService(config);
};

export const grokService = createGrokService();
export default GrokService;
