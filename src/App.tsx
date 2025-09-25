import React, { useEffect } from 'react';
import { Provider } from 'react-redux'; 
import ChatHeader from './components/ChatHeader';
import EmptyState from './components/EmptyState'; 
import ThreeSectionInput from './components/ThreeSectionInput';
import EnhancedChatMessages from './components/EnhancedChatMessages'; 
import ResponsiveSidebar from './components/ResponsiveSidebar';
import { MobileMenuProvider, useMobileMenu } from './context/MobileMenuContext';
import { useBreakpoint } from './hooks/useMediaQuery';
import { useSidebarSwipe } from './hooks/useSwipeGesture';
import { store, useAppSelector, useAppDispatch, initializeChatSession } from './store';
import { messagePersistence } from './utils/messagePersistence';
import "./app.css";

const ChatArea: React.FC = () => {
  const messages = useAppSelector((state) => state.chat.messages);

  return (
    <>
      {messages.length === 0 ? (
        <EmptyState />
      ) : (
        <EnhancedChatMessages />
      )}
    </>
  );
};

const AppContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const messages = useAppSelector((state) => state.chat.messages);
  const sessionId = useAppSelector((state) => state.chat.sessionId);
  const { isMobile } = useBreakpoint();
  const { openMenu } = useMobileMenu();
  console.log(isMobile)

  // Swipe gesture for opening sidebar on mobile only
  const { touchHandlers } = useSidebarSwipe(
    openMenu,
    () => { }, // Close handled by sidebar itself
    isMobile
  );

  useEffect(() => {
    // Initialize chat session on app start
    dispatch(initializeChatSession());

    // Load persisted messages if available
    if (messagePersistence.isStorageAvailable()) {
      const storedData = messagePersistence.loadMessages();
      if (storedData && storedData.messages.length > 0) {
        // TODO: Dispatch action to restore messages
        console.log('Loaded persisted messages:', storedData.messages.length);
      }
    }
  }, [dispatch]);

  // Save messages to localStorage when they change
  useEffect(() => {
    if (messages.length > 0 && messagePersistence.isStorageAvailable()) {
      messagePersistence.saveMessages(messages, sessionId || undefined);
    }
  }, [messages, sessionId]);

  return (
    <div className="root-container grid md:grid-cols-[2fr_6fr] gap-[1rem] h-[100vh] p-[10px] box-border bg-gradient-to-r from-[#1D4ED8] to-[#7c3aed]">
      {!isMobile && <div className='hidden md:flex flex-col gap-[10px]'>
        <ResponsiveSidebar />
      </div>}
      <div className="flex flex-col h-full gap-[10px] w-full overflow-x-hidden">
        <ChatHeader />
        <ChatArea />
        <ThreeSectionInput />
      </div>
    </div>
  ) 
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <MobileMenuProvider>
        <AppContent />
      </MobileMenuProvider>
    </Provider>
  );
};

export default App;