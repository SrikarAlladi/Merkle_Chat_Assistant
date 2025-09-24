import React, { useState, useRef, useCallback, useEffect } from 'react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { useBreakpoint } from '../hooks/useMediaQuery';
import { useAppDispatch, useAppSelector, addUserMessage, enqueueMessage, processMessageQueue } from '../store';

interface ThreeSectionInputProps {}

const ThreeSectionInput: React.FC<ThreeSectionInputProps> = () => {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector((state) => state.chat.isLoading);
  const isProcessingQueue = useAppSelector((state) => state.chat.isProcessingQueue);
  const connectionStatus = useAppSelector((state) => state.chat.connectionStatus);
  const { isMobile } = useBreakpoint();

  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  // Format states for button highlighting
  const [formatStates, setFormatStates] = useState({
    bold: false,
    italic: false,
    underline: false,
  });

  // Execute formatting command
  const executeCommand = useCallback((command: string, value?: string) => {
    if (!editorRef.current) return;
    
    editorRef.current.focus();
    document.execCommand(command, false, value);
    updateFormatStates();
    handleContentChange();
  }, []);

  // Update format states based on current selection
  const updateFormatStates = useCallback(() => {
    if (!editorRef.current) return;

    setFormatStates({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
    });
  }, []);

  // Handle content changes
  const handleContentChange = useCallback(() => {
    if (!editorRef.current) return;
    
    const content = editorRef.current.innerHTML;
    const textContent = editorRef.current.textContent || '';
    
    // Convert HTML to plain text for now (can be enhanced to support markdown)
    setMessage(textContent);
  }, []);

  // Convert HTML to markdown for storage
  const htmlToMarkdown = (html: string): string => {
    let markdown = html;
    
    // Convert HTML tags to markdown
    markdown = markdown.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
    markdown = markdown.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
    markdown = markdown.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
    markdown = markdown.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');
    markdown = markdown.replace(/<u[^>]*>(.*?)<\/u>/gi, '__$1__');
    
    // Handle headings
    markdown = markdown.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1');
    markdown = markdown.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1');
    markdown = markdown.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1');
    
    // Handle lists
    markdown = markdown.replace(/<ul[^>]*>(.*?)<\/ul>/gis, (match, content) => {
      return content.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
    });
    
    markdown = markdown.replace(/<ol[^>]*>(.*?)<\/ol>/gis, (match, content) => {
      let counter = 1;
      return content.replace(/<li[^>]*>(.*?)<\/li>/gi, () => `${counter++}. $1\n`);
    });
    
    // Handle blockquotes
    markdown = markdown.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '> $1');
    
    // Clean up HTML tags and entities
    markdown = markdown.replace(/<br\s*\/?>/gi, '\n');
    markdown = markdown.replace(/<div[^>]*>/gi, '\n');
    markdown = markdown.replace(/<\/div>/gi, '');
    markdown = markdown.replace(/<p[^>]*>/gi, '');
    markdown = markdown.replace(/<\/p>/gi, '\n');
    markdown = markdown.replace(/&nbsp;/g, ' ');
    markdown = markdown.replace(/&amp;/g, '&');
    markdown = markdown.replace(/&lt;/g, '<');
    markdown = markdown.replace(/&gt;/g, '>');
    markdown = markdown.replace(/&quot;/g, '"');
    
    // Remove any remaining HTML tags
    markdown = markdown.replace(/<[^>]*>/g, '');
    
    // Clean up extra whitespace
    markdown = markdown.replace(/\n\s*\n/g, '\n\n');
    markdown = markdown.trim();
    
    return markdown;
  };

  const handleSend = useCallback(() => {
    if (message.trim() && !isLoading && connectionStatus !== 'disconnected') {
      const messageText = message.trim();
      
      // Add user message immediately
      dispatch(addUserMessage(messageText));
      
      // Add to queue and process
      dispatch(enqueueMessage(messageText));
      if (!isProcessingQueue) {
        dispatch(processMessageQueue());
      }
      
      // Clear the editor
      if (editorRef.current) {
        editorRef.current.innerHTML = '';
        setMessage('');
      }
    }
  }, [message, isLoading, connectionStatus, isProcessingQueue, dispatch]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const ctrlKey = isMac ? e.metaKey : e.ctrlKey;

    // Handle keyboard shortcuts
    if (ctrlKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          executeCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          executeCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          executeCommand('underline');
          break;
      }
    }

    // Handle Enter key
    if (e.key === 'Enter' && !isComposing) {
      if (e.shiftKey) {
        // Shift+Enter: Insert line break
        e.preventDefault();
        executeCommand('insertHTML', '<br>');
      } else {
        // Enter: Send message
        e.preventDefault();
        handleSend();
      }
    }
  }, [executeCommand, handleSend, isComposing]);

  // Handle emoji selection
  const handleEmojiSelect = useCallback((emoji: any) => {
    if (!editorRef.current) return;
    
    editorRef.current.focus();
    executeCommand('insertText', emoji.native);
    setShowEmojiPicker(false);
  }, [executeCommand]);

  // Handle file attachment
  const handleFileAttachment = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'image/*,video/*,audio/*,.pdf,.doc,.docx,.txt';
    
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) {
        console.log('Files selected:', files);
        // TODO: Handle file attachments
      }
    };
    
    input.click();
  }, []);

  // Format button component
  const FormatButton: React.FC<{
    command: string;
    icon: React.ReactNode;
    title: string;
    active?: boolean;
    value?: string;
  }> = ({ command, icon, title, active = false, value }) => (
    <button
      type="button"
      onClick={() => executeCommand(command, value)}
      className={`p-2 rounded hover:bg-gray-100 transition-colors ${
        active ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:text-gray-900'
      }`}
      title={title}
    >
      {icon}
    </button>
  );

  const isDisabled = isLoading || connectionStatus === 'disconnected';

  // Add placeholder styling
  useEffect(() => {
    const styleId = 'rich-text-editor-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .rich-text-editor[contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #9CA3AF;
          pointer-events: none;
        }
        .rich-text-editor h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 0.67em 0;
        }
        .rich-text-editor h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.75em 0;
        }
        .rich-text-editor h3 {
          font-size: 1.17em;
          font-weight: bold;
          margin: 0.83em 0;
        }
        .rich-text-editor blockquote {
          border-left: 4px solid #d1d5db;
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: #6b7280;
        }
        .rich-text-editor pre {
          background-color: #f3f4f6;
          padding: 1rem;
          border-radius: 0.375rem;
          overflow-x: auto;
          font-family: 'Courier New', monospace;
        }
        .rich-text-editor ul, .rich-text-editor ol {
          padding-left: 2rem;
          margin: 0.5rem 0;
        }
        .rich-text-editor li {
          margin: 0.25rem 0;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        
        {/* Section 1: Formatting Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-xl">
          {/* Left side - Paragraph dropdown and formatting buttons */}
          <div className="flex items-center space-x-3">
            <select 
              className="text-sm border-none bg-transparent text-gray-700 focus:outline-none cursor-pointer"
              onChange={(e) => {
                const value = e.target.value;
                if (value === 'p') {
                  executeCommand('formatBlock', 'div');
                } else {
                  executeCommand('formatBlock', value);
                }
              }}
              defaultValue="p"
            >
              <option value="p">Paragraph</option>
              <option value="h1">Heading 1</option>
              <option value="h2">Heading 2</option>
              <option value="h3">Heading 3</option>
            </select>
            
            {/* Text formatting buttons - right beside dropdown */}
            <div className="flex items-center space-x-1">
            <FormatButton
              command="bold"
              active={formatStates.bold}
              title="Bold"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
                  <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
                </svg>
              }
            />
            
            <FormatButton
              command="italic"
              active={formatStates.italic}
              title="Italic"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="19" y1="4" x2="10" y2="4"/>
                  <line x1="14" y1="20" x2="5" y2="20"/>
                  <line x1="15" y1="4" x2="9" y2="20"/>
                </svg>
              }
            />
            
            <FormatButton
              command="underline"
              active={formatStates.underline}
              title="Underline"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/>
                  <line x1="4" y1="21" x2="20" y2="21"/>
                </svg>
              }
            />

            <div className="w-px h-6 bg-gray-300 mx-2" />

            <FormatButton
              command="insertUnorderedList"
              title="Bullet List"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="8" y1="6" x2="21" y2="6"/>
                  <line x1="8" y1="12" x2="21" y2="12"/>
                  <line x1="8" y1="18" x2="21" y2="18"/>
                  <line x1="3" y1="6" x2="3.01" y2="6"/>
                  <line x1="3" y1="12" x2="3.01" y2="12"/>
                  <line x1="3" y1="18" x2="3.01" y2="18"/>
                </svg>
              }
            />
            
            <FormatButton
              command="insertOrderedList"
              title="Numbered List"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="10" y1="6" x2="21" y2="6"/>
                  <line x1="10" y1="12" x2="21" y2="12"/>
                  <line x1="10" y1="18" x2="21" y2="18"/>
                  <path d="M4 6h1v4"/>
                  <path d="M4 10h2"/>
                  <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/>
                </svg>
              }
            />

            <FormatButton
              command="formatBlock"
              value="blockquote"
              title="Quote"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/>
                  <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>
                </svg>
              }
            />

            <FormatButton
              command="formatBlock"
              value="pre"
              title="Code Block"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="16,18 22,12 16,6"/>
                  <polyline points="8,6 2,12 8,18"/>
                </svg>
              }
            />

            <FormatButton
              command="image"
              title="Image"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21,15 16,10 5,21"/>
                </svg>
              }
            />
            </div>
          </div>

          {/* Right side - Empty for balance */}
          <div className="w-16"></div>
        </div>

        {/* Section 2: Rich Text Input Area */}
        <div className="px-4 py-4">
          <div
            ref={editorRef}
            contentEditable={!isDisabled}
            className="w-full min-h-[60px] max-h-48 overflow-y-auto outline-none text-gray-900 text-base leading-relaxed rich-text-editor"
            style={{
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap'
            }}
            onInput={handleContentChange}
            onKeyDown={handleKeyDown}
            onMouseUp={updateFormatStates}
            onKeyUp={updateFormatStates}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            data-placeholder="Ask me anything ..."
            suppressContentEditableWarning={true}
          />
        </div>

        {/* Section 3: Actions - Attach, Emoji, Send */}
        <div className="flex items-center justify-between px-4 pb-4">
          {/* Left side - Attachment Button */}
          <button
            type="button"
            onClick={handleFileAttachment}
            className="p-2 hover:bg-gray-100 rounded text-gray-600 hover:text-gray-900 transition-colors"
            title="Attach File"
            disabled={isDisabled}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
            </svg>
          </button>

          {/* Right side - Emoji and Send buttons */}
          <div className="flex items-center space-x-3">
            {/* Emoji picker */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 hover:bg-gray-100 rounded text-gray-600 hover:text-gray-900 transition-colors"
                title="Add Emoji"
                disabled={isDisabled}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                  <line x1="9" y1="9" x2="9.01" y2="9"/>
                  <line x1="15" y1="9" x2="15.01" y2="9"/>
                </svg>
              </button>

              {showEmojiPicker && (
                <div className="absolute bottom-full right-0 mb-2 z-50">
                  <Picker
                    data={data}
                    onEmojiSelect={handleEmojiSelect}
                    theme="light"
                    previewPosition="none"
                    skinTonePosition="none"
                  />
                </div>
              )}
            </div>

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={!message.trim() || isDisabled}
              className={`
                w-12 h-12 md:w-auto md:px-4 md:py-2 md:h-10
                flex items-center justify-center rounded-lg
                ${message.trim() && !isDisabled 
                  ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-md' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }
                transition-all duration-200 ease-in-out
                md:space-x-2
              `}
              type="button"
              aria-label="Send message"
            >
              {isLoading ? (
                <div className="animate-spin">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 11-6.219-8.56"/>
                  </svg>
                </div>
              ) : (
                <>
                  <span className="hidden md:inline text-sm font-medium">Send</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Click outside to close emoji picker */}
        {showEmojiPicker && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowEmojiPicker(false)}
          />
        )}
      </div>
  );
};

export default ThreeSectionInput;
