import React, { useState, useRef, useEffect } from 'react';
import './ChatWidget.css';
import { useSignalR } from '../../hooks/useSignalR';
import apiSlice from '../../store/api';
import { useChatContext } from '../../contexts/ChatContext';

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: Date;
  editedAt?: Date;
  isDeleted: boolean;
  isRead: boolean;
  readAt?: Date;
}

interface Conversation {
  id: string;
  user1Id: string;
  user2Id: string;
  createdAt: Date;
  lastMessageAt?: Date;
  lastMessageId?: string;
  lastMessage?: Message;
  messages: Message[];
}

interface User {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
}

const ChatWidget: React.FC = () => {
  const { 
    isOpen, 
    setIsOpen, 
    targetUserId, 
    targetUserName, 
    closeChatWidget 
  } = useChatContext();
  
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // API hooks
  const { data: conversationsData, isLoading: conversationsLoading } = apiSlice.useGetConversationQuery({});
  const [sendMessage] = apiSlice.useSendMessageMutation();

  const currentUserId = "user1";
  
  // Use API data or fallback to empty array
  const conversations: Conversation[] = conversationsData || [];
  
  const [users, setUsers] = useState<User[]>([
    { id: "user1", name: "Bạn", avatar: "👤", isOnline: true },
    { id: "user2", name: "Nguyễn Thị Lan", avatar: "👩", isOnline: true },
    { id: "user3", name: "Trần Văn Nam", avatar: "👨", isOnline: false },
    { id: "user4", name: "Lê Thị Hương", avatar: "👩‍💼", isOnline: true },
  ]);

  // Effect to handle opening chat with specific user
  useEffect(() => {
    if (targetUserId && targetUserName && isOpen) {
      // Update user name if it has changed
      setUsers(prevUsers => {
        const existingUserIndex = prevUsers.findIndex(u => u.id === targetUserId);
        if (existingUserIndex !== -1 && prevUsers[existingUserIndex].name !== targetUserName) {
          const updatedUsers = [...prevUsers];
          updatedUsers[existingUserIndex] = {
            ...updatedUsers[existingUserIndex],
            name: targetUserName
          };
          return updatedUsers;
        } else if (existingUserIndex === -1) {
          return [...prevUsers, {
            id: targetUserId,
            name: targetUserName,
            avatar: "👤",
            isOnline: true
          }];
        }
        return prevUsers;
      });

      // First, try to find existing conversation from API data
      const existingConversation = conversations.find(conv => 
        (conv.user1Id === currentUserId && conv.user2Id === targetUserId) ||
        (conv.user1Id === targetUserId && conv.user2Id === currentUserId)
      );

      if (existingConversation) {
        setSelectedConversation(existingConversation.id);
        return;
      }

      // If no existing conversation, we'll create one when the user sends the first message
      // For now, just set a temporary conversation ID to enable the message input
      const tempConversationId = `temp_${currentUserId}_${targetUserId}`;
      setSelectedConversation(tempConversationId);
    }
  }, [targetUserId, targetUserName, isOpen, conversations]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      if (selectedConversation?.startsWith('temp_')) {
        const receiverId = selectedConversation.split('_')[2];
        await sendMessage({
          receiverId: receiverId,
          content: newMessage,
          isDeleted: false,
          isRead: false
        });
      } else if (selectedConversation) {
        await sendMessage({
          conversationId: selectedConversation,
          content: newMessage
        });
      }
      
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <>
      {/* Floating Chat Button - This is the main chat bubble */}
      <button
        onClick={() => isOpen ? closeChatWidget() : setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white rounded-full shadow-lg z-50 transition-all duration-300 flex items-center justify-center ${
          isOpen ? 'rotate-180' : 'hover:scale-110'
        }`}
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Chat Widget Panel */}
      <div className={`fixed bottom-24 right-6 w-[32rem] h-[38rem] bg-white rounded-lg shadow-2xl border border-gray-200 z-40 transition-all duration-300 ${
        isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
      } ${isMobile ? 'w-[calc(100vw-2rem)] right-4' : ''}`}>
        
        <div className="h-full flex">
          {/* Conversations List */}
          <div className="w-full border-r border-green-200 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-green-200 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-tl-lg">
              <h3 className="font-semibold text-lg">Tin nhắn</h3>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto">
              {conversationsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                </div>
              ) : conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-lg font-medium mb-2">Chưa có cuộc trò chuyện</p>
                  <p className="text-sm text-center px-4">Nhấn vào nút "Chat" bên cạnh bình luận để bắt đầu trò chuyện với người dùng</p>
                </div>
              ) : (
                conversations.map((conversation, index) => (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation.id)}
                    className="p-4 border-b border-green-100 hover:bg-green-50 cursor-pointer transition-all duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-200 to-emerald-300 rounded-full flex items-center justify-center text-lg">
                        👤
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">User {conversation.user2Id}</h4>
                        <p className="text-sm text-gray-600 truncate mt-1">
                          {conversation.messages && conversation.messages.length > 0 
                            ? conversation.messages[conversation.messages.length - 1].content 
                            : 'No messages'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Selected Conversation Messages Area */}
          {selectedConversation && (
            <div className="w-3/5 flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-green-200 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-tr-lg">
                <h4 className="font-semibold">
                  {selectedConversation.startsWith('temp_') 
                    ? targetUserName || 'New Chat'
                    : `Chat with User`}
                </h4>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-green-50 to-emerald-50">
                {/* Messages would go here */}
                <div className="text-center text-gray-500 py-8">
                  {selectedConversation.startsWith('temp_') 
                    ? 'Send a message to start the conversation!'
                    : 'Loading messages...'}
                </div>
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-green-200 bg-white rounded-br-lg">
                <div className="relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Nhập tin nhắn..."
                    className="w-full px-4 py-3 pr-12 border border-green-300 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-gradient-to-br from-amber-500 to-yellow-600 text-white rounded-full hover:from-amber-600 hover:to-yellow-700 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-110"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ChatWidget; 