import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { IMessage } from '../types/chat';
import 'material-icons/iconfont/material-icons.css';

interface SimpleMarkdownMessageProps {
  message: IMessage;
}

interface CodeBlockProps {
  children: string;
  language?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ children, language = '' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  if (!language) {
    return (
      <code className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-mono">
        {children}
      </code>
    );
  }

  return (
    <div className="relative group my-4">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center space-x-1"
        title="Copy code"
      >
        {copied ? (
          <>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20,6 9,17 4,12"></polyline>
            </svg>
            <span>Copied!</span>
          </>
        ) : (
          <>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5,15H4a2,2,0,0,1-2-2V4A2,2,0,0,1,4,2H15a2,2,0,0,1,2,2V5"></path>
            </svg>
            <span>Copy</span>
          </>
        )}
      </button>
      <SyntaxHighlighter
        style={oneDark}
        language={language}
        PreTag="div"
        customStyle={{
          margin: 0,
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
        }}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
};

// Simple markdown parser for basic formatting
const parseSimpleMarkdown = (text: string): JSX.Element => {
  const lines = text.split('\n');
  const elements: JSX.Element[] = [];
  let currentIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Code blocks (```)
    if (line.startsWith('```')) {
      const language = line.substring(3).trim();
      const codeLines: string[] = [];
      i++; // Skip the opening ```
      
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      
      elements.push(
        <CodeBlock key={currentIndex++} language={language}>
          {codeLines.join('\n')}
        </CodeBlock>
      );
      continue;
    }

    // Headers
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={currentIndex++} className="text-xl font-bold text-gray-900 mb-3 mt-4 first:mt-0">
          {line.substring(2)}
        </h1>
      );
      continue;
    }
    
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={currentIndex++} className="text-lg font-semibold text-gray-900 mb-2 mt-3 first:mt-0">
          {line.substring(3)}
        </h2>
      );
      continue;
    }
    
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={currentIndex++} className="text-base font-semibold text-gray-900 mb-2 mt-3 first:mt-0">
          {line.substring(4)}
        </h3>
      );
      continue;
    }

    // Blockquotes
    if (line.startsWith('> ')) {
      elements.push(
        <blockquote key={currentIndex++} className="border-l-4 border-blue-500 pl-4 italic my-4 text-gray-700 bg-blue-50 py-2 rounded-r">
          {line.substring(2)}
        </blockquote>
      );
      continue;
    }

    // Lists
    if (line.startsWith('- ') || line.startsWith('• ')) {
      const listItems: string[] = [line.substring(2)];
      i++;
      
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('• '))) {
        listItems.push(lines[i].substring(2));
        i++;
      }
      i--; // Back up one since the loop will increment
      
      elements.push(
        <ul key={currentIndex++} className="list-disc list-inside space-y-1 my-2">
          {listItems.map((item, idx) => (
            <li key={idx} className="text-gray-700">{formatInlineText(item)}</li>
          ))}
        </ul>
      );
      continue;
    }

    // Numbered lists
    if (/^\d+\.\s/.test(line)) {
      const listItems: string[] = [line.replace(/^\d+\.\s/, '')];
      i++;
      
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        listItems.push(lines[i].replace(/^\d+\.\s/, ''));
        i++;
      }
      i--; // Back up one since the loop will increment
      
      elements.push(
        <ol key={currentIndex++} className="list-decimal list-inside space-y-1 my-2">
          {listItems.map((item, idx) => (
            <li key={idx} className="text-gray-700">{formatInlineText(item)}</li>
          ))}
        </ol>
      );
      continue;
    }

    // Regular paragraphs
    if (line.trim()) {
      elements.push(
        <p key={currentIndex++} className="text-gray-700 mb-2 last:mb-0">
          {formatInlineText(line)}
        </p>
      );
    } else {
      // Empty line - add spacing
      elements.push(<div key={currentIndex++} className="h-2" />);
    }
  }

  return <div className="space-y-1">{elements}</div>;
};

// Format inline text (bold, italic, code, links)
const formatInlineText = (text: string): JSX.Element => {
  const parts: (string | JSX.Element)[] = [];
  let currentText = text;
  let keyIndex = 0;

  // Inline code (`code`)
  currentText = currentText.replace(/`([^`]+)`/g, (match, code) => {
    const placeholder = `__CODE_${keyIndex}__`;
    parts.push(
      <code key={`code-${keyIndex++}`} className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm font-mono">
        {code}
      </code>
    );
    return placeholder;
  });

  // Bold (**text**)
  currentText = currentText.replace(/\*\*(.*?)\*\*/g, (match, text) => {
    const placeholder = `__BOLD_${keyIndex}__`;
    parts.push(
      <strong key={`bold-${keyIndex++}`} className="font-semibold text-gray-900">
        {text}
      </strong>
    );
    return placeholder;
  });

  // Italic (*text*)
  currentText = currentText.replace(/\*(.*?)\*/g, (match, text) => {
    const placeholder = `__ITALIC_${keyIndex}__`;
    parts.push(
      <em key={`italic-${keyIndex++}`} className="italic text-gray-700">
        {text}
      </em>
    );
    return placeholder;
  });

  // Links ([text](url))
  currentText = currentText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
    const placeholder = `__LINK_${keyIndex}__`;
    parts.push(
      <a 
        key={`link-${keyIndex++}`}
        href={url} 
        className="text-blue-600 hover:text-blue-800 underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        {text}
      </a>
    );
    return placeholder;
  });

  // Split by placeholders and reconstruct
  const finalParts: (string | JSX.Element)[] = [];
  const placeholderRegex = /__(?:CODE|BOLD|ITALIC|LINK)_\d+__/g;
  const textParts = currentText.split(placeholderRegex);
  const placeholders = currentText.match(placeholderRegex) || [];

  for (let i = 0; i < textParts.length; i++) {
    if (textParts[i]) {
      finalParts.push(textParts[i]);
    }
    if (i < placeholders.length) {
      const placeholderIndex = parseInt(placeholders[i].match(/\d+/)?.[0] || '0');
      finalParts.push(parts[placeholderIndex]);
    }
  }

  return <>{finalParts}</>;
};

const SimpleMarkdownMessage: React.FC<SimpleMarkdownMessageProps> = ({ message }) => {
  const formatTimestamp = (timestamp: string) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(timestamp));
  };

  const isUser = message.sender === 'user';
  const messageClasses = isUser
    ? 'bg-white text-blue-600 self-end rounded-br-none bg-rgb(240 246 255)'
    : 'bg-transparent text-white-500 md:text-black self-start rounded-bl-none';

  const avatar = isUser ? (
    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
      U
    </div>
  ) : (
    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2L2 7L12 12L22 7L12 2Z" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 17L12 22L22 17" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 12L12 17L22 12" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );

  return (
    <div className={`text-xs sm:text-base flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && avatar}
      <div className={`flex flex-col max-w-3xl p-4 rounded-xl shadow-md ${messageClasses}`}>
        {!message.isLoading && (
          <>
            {isUser ? (
              <div className="text-blue-400 whitespace-pre-wrap flex flex-col">
                <span>{message.text}</span>
              </div>
            ) : (
              <div className="prose prose-sm max-w-none">
                {parseSimpleMarkdown(message.text)}
              </div>
            )}
            <div className='flex items-center gap-2 mt-2 text-gray-500'>
            {isUser && <span className='material-icons text-md'>colorize</span>}
            <span className={`text-xs mt-2 text-gray-500 self-end`}>
              {formatTimestamp(message.timestamp)}
            </span>
            </div>
          </>
        )}
      </div>
      {isUser && avatar}
    </div>
  );
};

export default SimpleMarkdownMessage;
