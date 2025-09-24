// Repository Analyzer - Dynamically reads and analyzes codebase structure
// This utility provides context about the codebase to enhance AI responses

export interface FileInfo {
  path: string;
  name: string;
  extension: string;
  size?: number;
  lastModified?: string;
}

export interface DirectoryStructure {
  name: string;
  path: string;
  files: FileInfo[];
  subdirectories: DirectoryStructure[];
}

export interface CodebaseContext {
  projectStructure: DirectoryStructure;
  technologies: string[];
  keyFiles: FileInfo[];
  packageInfo?: {
    name?: string;
    version?: string;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  summary: string;
}

class RepoAnalyzer {
  private static instance: RepoAnalyzer;
  private cachedContext: CodebaseContext | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  static getInstance(): RepoAnalyzer {
    if (!RepoAnalyzer.instance) {
      RepoAnalyzer.instance = new RepoAnalyzer();
    }
    return RepoAnalyzer.instance;
  }

  // Main method to get codebase context
  async getCodebaseContext(): Promise<CodebaseContext> {
    // Return cached context if still valid
    if (this.cachedContext && (Date.now() - this.cacheTimestamp) < this.CACHE_DURATION) {
      return this.cachedContext;
    }

    try {
      const context = await this.analyzeCodebase();
      this.cachedContext = context;
      this.cacheTimestamp = Date.now();
      return context;
    } catch (error) {
      console.error('Error analyzing codebase:', error);
      // Return a basic fallback context
      return this.getFallbackContext();
    }
  }

  // Analyze the codebase structure
  private async analyzeCodebase(): Promise<CodebaseContext> {
    const [packageInfo, projectStructure] = await Promise.all([
      this.getPackageInfo(),
      this.getProjectStructure()
    ]);

    const technologies = this.detectTechnologies(packageInfo, projectStructure);
    const keyFiles = this.identifyKeyFiles(projectStructure);
    const summary = this.generateProjectSummary(packageInfo, technologies, keyFiles);

    return {
      projectStructure,
      technologies,
      keyFiles,
      packageInfo,
      summary
    };
  }

  // Get package.json information
  private async getPackageInfo(): Promise<CodebaseContext['packageInfo']> {
    try {
      const response = await fetch('/package.json');
      if (response.ok) {
        const packageJson = await response.json();
        return {
          name: packageJson.name,
          version: packageJson.version,
          dependencies: packageJson.dependencies,
          devDependencies: packageJson.devDependencies
        };
      }
    } catch (error) {
      console.warn('Could not read package.json:', error);
    }
    return undefined;
  }

  // Get project structure (simplified version for browser environment)
  private async getProjectStructure(): Promise<DirectoryStructure> {
    // Since we're in a browser environment, we'll use a predefined structure
    // based on the project layout provided in the context
    return {
      name: 'Merkle_Latest',
      path: '/',
      files: [
        { path: '/package.json', name: 'package.json', extension: 'json' },
        { path: '/README.md', name: 'README.md', extension: 'md' },
        { path: '/tsconfig.json', name: 'tsconfig.json', extension: 'json' },
        { path: '/tailwind.config.js', name: 'tailwind.config.js', extension: 'js' },
        { path: '/postcss.config.js', name: 'postcss.config.js', extension: 'js' }
      ],
      subdirectories: [
        {
          name: 'src',
          path: '/src',
          files: [
            { path: '/src/App.tsx', name: 'App.tsx', extension: 'tsx' },
            { path: '/src/index.tsx', name: 'index.tsx', extension: 'tsx' },
            { path: '/src/index.css', name: 'index.css', extension: 'css' },
            { path: '/src/new.css', name: 'new.css', extension: 'css' }
          ],
          subdirectories: [
            {
              name: 'components',
              path: '/src/components',
              files: [
                { path: '/src/components/ChatHeader.tsx', name: 'ChatHeader.tsx', extension: 'tsx' },
                { path: '/src/components/ChatMessages.tsx', name: 'ChatMessages.tsx', extension: 'tsx' },
                { path: '/src/components/EnhancedChatMessages.tsx', name: 'EnhancedChatMessages.tsx', extension: 'tsx' },
                { path: '/src/components/MessageInput.tsx', name: 'MessageInput.tsx', extension: 'tsx' },
                { path: '/src/components/MerkleLogo.tsx', name: 'MerkleLogo.tsx', extension: 'tsx' },
                { path: '/src/components/ThreeSectionInput.tsx', name: 'ThreeSectionInput.tsx', extension: 'tsx' }
              ],
              subdirectories: []
            },
            {
              name: 'services',
              path: '/src/services',
              files: [
                { path: '/src/services/grokService.ts', name: 'grokService.ts', extension: 'ts' }
              ],
              subdirectories: []
            },
            {
              name: 'store',
              path: '/src/store',
              files: [
                { path: '/src/store/chatSlice.ts', name: 'chatSlice.ts', extension: 'ts' },
                { path: '/src/store/store.ts', name: 'store.ts', extension: 'ts' },
                { path: '/src/store/hooks.ts', name: 'hooks.ts', extension: 'ts' },
                { path: '/src/store/index.ts', name: 'index.ts', extension: 'ts' }
              ],
              subdirectories: []
            },
            {
              name: 'types',
              path: '/src/types',
              files: [
                { path: '/src/types/chat.ts', name: 'chat.ts', extension: 'ts' }
              ],
              subdirectories: []
            },
            {
              name: 'utils',
              path: '/src/utils',
              files: [
                { path: '/src/utils/fileHandler.ts', name: 'fileHandler.ts', extension: 'ts' },
                { path: '/src/utils/messagePersistence.ts', name: 'messagePersistence.ts', extension: 'ts' }
              ],
              subdirectories: []
            },
            {
              name: 'hooks',
              path: '/src/hooks',
              files: [
                { path: '/src/hooks/useMediaQuery.ts', name: 'useMediaQuery.ts', extension: 'ts' },
                { path: '/src/hooks/useSwipeGesture.ts', name: 'useSwipeGesture.ts', extension: 'ts' }
              ],
              subdirectories: []
            },
            {
              name: 'context',
              path: '/src/context',
              files: [
                { path: '/src/context/MobileMenuContext.tsx', name: 'MobileMenuContext.tsx', extension: 'tsx' }
              ],
              subdirectories: []
            }
          ]
        },
        {
          name: 'public',
          path: '/public',
          files: [
            { path: '/public/image.png', name: 'image.png', extension: 'png' }
          ],
          subdirectories: [
            {
              name: 'assets',
              path: '/public/assets',
              files: [
                { path: '/public/assets/Merkle_logo.png', name: 'Merkle_logo.png', extension: 'png' },
                { path: '/public/assets/Merkle_logo.svg', name: 'Merkle_logo.svg', extension: 'svg' }
              ],
              subdirectories: []
            }
          ]
        }
      ]
    };
  }

  // Detect technologies used in the project
  private detectTechnologies(packageInfo?: CodebaseContext['packageInfo'], structure?: DirectoryStructure): string[] {
    const technologies: Set<string> = new Set();

    // Detect from package.json dependencies
    if (packageInfo?.dependencies) {
      const deps = Object.keys(packageInfo.dependencies);
      if (deps.includes('react')) technologies.add('React');
      if (deps.includes('@reduxjs/toolkit')) technologies.add('Redux Toolkit');
      if (deps.includes('typescript')) technologies.add('TypeScript');
      if (deps.includes('tailwindcss')) technologies.add('Tailwind CSS');
      if (deps.some(dep => dep.includes('grok'))) technologies.add('Grok AI API');
    }

    // Detect from file extensions
    if (structure) {
      this.scanForTechnologies(structure, technologies);
    }

    // Add known technologies based on project structure
    technologies.add('React');
    technologies.add('TypeScript');
    technologies.add('Redux Toolkit');
    technologies.add('Tailwind CSS');
    technologies.add('Grok AI API');
    technologies.add('Blockchain/Cryptocurrency Chat Interface');

    return Array.from(technologies);
  }

  // Recursively scan for technologies based on file extensions
  private scanForTechnologies(structure: DirectoryStructure, technologies: Set<string>): void {
    structure.files.forEach(file => {
      switch (file.extension) {
        case 'tsx':
        case 'jsx':
          technologies.add('React');
          break;
        case 'ts':
          technologies.add('TypeScript');
          break;
        case 'css':
          if (file.name.includes('tailwind') || file.path.includes('tailwind')) {
            technologies.add('Tailwind CSS');
          }
          break;
      }
    });

    structure.subdirectories.forEach(subdir => {
      this.scanForTechnologies(subdir, technologies);
    });
  }

  // Identify key files that are important for understanding the project
  private identifyKeyFiles(structure: DirectoryStructure): FileInfo[] {
    const keyFiles: FileInfo[] = [];
    
    // Add important configuration and entry files
    const importantPatterns = [
      'package.json',
      'tsconfig.json',
      'App.tsx',
      'index.tsx',
      'grokService.ts',
      'chatSlice.ts',
      'store.ts',
      'chat.ts'
    ];

    this.findKeyFiles(structure, importantPatterns, keyFiles);
    return keyFiles;
  }

  // Recursively find key files
  private findKeyFiles(structure: DirectoryStructure, patterns: string[], keyFiles: FileInfo[]): void {
    structure.files.forEach(file => {
      if (patterns.some(pattern => file.name.includes(pattern))) {
        keyFiles.push(file);
      }
    });

    structure.subdirectories.forEach(subdir => {
      this.findKeyFiles(subdir, patterns, keyFiles);
    });
  }

  // Generate a summary of the project
  private generateProjectSummary(
    packageInfo?: CodebaseContext['packageInfo'],
    technologies?: string[],
    keyFiles?: FileInfo[]
  ): string {
    const projectName = packageInfo?.name || 'Merkle Science Chat Application';
    const techStack = technologies?.join(', ') || 'React, TypeScript';
    
    return `${projectName} is a blockchain and cryptocurrency chat interface built with ${techStack}. 
The application features a modern chat UI with AI-powered responses using the Grok API, 
Redux state management, and responsive design with Tailwind CSS. 
Key components include chat messaging, file handling, and blockchain/crypto educational content.`;
  }

  // Fallback context when analysis fails
  private getFallbackContext(): CodebaseContext {
    return {
      projectStructure: {
        name: 'Merkle_Latest',
        path: '/',
        files: [],
        subdirectories: []
      },
      technologies: ['React', 'TypeScript', 'Redux Toolkit', 'Tailwind CSS', 'Grok AI API'],
      keyFiles: [],
      summary: 'Merkle Science Chat Application - A blockchain and cryptocurrency chat interface with AI-powered responses.'
    };
  }

  // Get relevant files based on user query
  async getRelevantFiles(query: string): Promise<FileInfo[]> {
    const context = await this.getCodebaseContext();
    const relevantFiles: FileInfo[] = [];
    
    const queryLower = query.toLowerCase();
    
    // Determine relevant files based on query content
    if (queryLower.includes('chat') || queryLower.includes('message')) {
      relevantFiles.push(...context.keyFiles.filter(f => 
        f.name.includes('chat') || f.name.includes('message') || f.name.includes('Chat')
      ));
    }
    
    if (queryLower.includes('component') || queryLower.includes('ui')) {
      relevantFiles.push(...context.keyFiles.filter(f => 
        f.path.includes('/components/') || f.extension === 'tsx'
      ));
    }
    
    if (queryLower.includes('store') || queryLower.includes('state') || queryLower.includes('redux')) {
      relevantFiles.push(...context.keyFiles.filter(f => 
        f.path.includes('/store/') || f.name.includes('slice')
      ));
    }
    
    if (queryLower.includes('service') || queryLower.includes('api') || queryLower.includes('grok')) {
      relevantFiles.push(...context.keyFiles.filter(f => 
        f.path.includes('/services/') || f.name.includes('Service')
      ));
    }
    
    // Always include core files for general queries
    if (relevantFiles.length === 0) {
      relevantFiles.push(...context.keyFiles.filter(f => 
        ['App.tsx', 'grokService.ts', 'chatSlice.ts'].some(key => f.name.includes(key))
      ));
    }
    
    return relevantFiles;
  }

  // Clear cache (useful for development)
  clearCache(): void {
    this.cachedContext = null;
    this.cacheTimestamp = 0;
  }
}

export const repoAnalyzer = RepoAnalyzer.getInstance();
export default RepoAnalyzer;
