// Demo utility to showcase the dynamic codebase context functionality
// This file demonstrates how the enhanced Grok service now understands the repository structure

import { grokService } from '../services/grokService';
import { repoAnalyzer } from './repoAnalyzer';

export class CodebaseContextDemo {
  // Test the codebase analysis
  static async testCodebaseAnalysis(): Promise<void> {
    console.log('🔍 Testing Codebase Analysis...');
    
    try {
      const context = await repoAnalyzer.getCodebaseContext();
      console.log('📊 Codebase Context:', {
        summary: context.summary,
        technologies: context.technologies,
        keyFiles: context.keyFiles.map(f => f.name),
        packageInfo: context.packageInfo?.name
      });
    } catch (error) {
      console.error('❌ Failed to analyze codebase:', error);
    }
  }

  // Test code-related query detection
  static testCodeQueryDetection(): void {
    console.log('🧠 Testing Code Query Detection...');
    
    const testQueries = [
      'How do I create a new React component?',
      'Fix the TypeScript error in my code',
      'What is blockchain technology?',
      'Help me with Redux state management',
      'Explain cryptocurrency trading',
      'How to style with Tailwind CSS?',
      'What are NFTs?'
    ];

    testQueries.forEach(query => {
      // Access the private method through the service instance
      const isCodeRelated = (grokService as any).isCodeRelatedQuery(query);
      console.log(`"${query}" -> ${isCodeRelated ? '💻 Code' : '🔗 Crypto'}`);
    });
  }

  // Test relevant file detection
  static async testRelevantFileDetection(): Promise<void> {
    console.log('📁 Testing Relevant File Detection...');
    
    const testQueries = [
      'chat component issues',
      'redux store problems',
      'grok service integration',
      'UI component styling'
    ];

    for (const query of testQueries) {
      try {
        const relevantFiles = await repoAnalyzer.getRelevantFiles(query);
        console.log(`"${query}" -> Files:`, relevantFiles.map(f => f.name));
      } catch (error) {
        console.error(`Failed to get relevant files for "${query}":`, error);
      }
    }
  }

  // Test the enhanced system prompt
  static async testEnhancedSystemPrompt(): Promise<void> {
    console.log('📝 Testing Enhanced System Prompt...');
    
    try {
      // Get the current codebase context from the service
      const context = grokService.getCodebaseContext();
      if (context) {
        console.log('✅ Grok service has codebase context loaded');
        console.log('📋 Project Summary:', context.summary);
        console.log('🛠️ Technologies:', context.technologies.join(', '));
      } else {
        console.log('⏳ Codebase context still loading...');
        // Refresh context
        await grokService.refreshCodebaseContext();
        const refreshedContext = grokService.getCodebaseContext();
        if (refreshedContext) {
          console.log('✅ Codebase context loaded after refresh');
        }
      }
    } catch (error) {
      console.error('❌ Failed to test system prompt:', error);
    }
  }

  // Run all tests
  static async runAllTests(): Promise<void> {
    console.log('🚀 Running Codebase Context Demo Tests...\n');
    
    await this.testCodebaseAnalysis();
    console.log('\n' + '='.repeat(50) + '\n');
    
    this.testCodeQueryDetection();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await this.testRelevantFileDetection();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await this.testEnhancedSystemPrompt();
    console.log('\n' + '='.repeat(50) + '\n');
    
    console.log('✅ All tests completed!');
  }
}

// Export for easy testing in console
export const testCodebaseContext = CodebaseContextDemo.runAllTests;

// Auto-run tests in development (optional)
if (process.env.NODE_ENV === 'development') {
  // Uncomment the line below to auto-run tests when this file is imported
  // setTimeout(() => CodebaseContextDemo.runAllTests(), 2000);
}
