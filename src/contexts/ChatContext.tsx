import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface ChatContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  targetUserId: string | null;
  targetUserName: string | null;
  openChatWithUser: (userId: string, userName: string) => void;
  closeChatWidget: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [targetUserId, setTargetUserId] = useState<string | null>(null);
  const [targetUserName, setTargetUserName] = useState<string | null>(null);

  const openChatWithUser = (userId: string, userName: string) => {
    setTargetUserId(userId);
    setTargetUserName(userName);
    setIsOpen(true);
  };

  const closeChatWidget = () => {
    setIsOpen(false);
    // Don't clear targetUserId immediately to allow smooth closing animation
    setTimeout(() => {
      setTargetUserId(null);
      setTargetUserName(null);
    }, 300);
  };

  return (
    <ChatContext.Provider value={{
      isOpen,
      setIsOpen,
      targetUserId,
      targetUserName,
      openChatWithUser,
      closeChatWidget
    }}>
      {children}
    </ChatContext.Provider>
  );
}; 