import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import apiSlice from '../../store/api';
import { useChatContext } from '../../contexts/ChatContext';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { useSignalR } from '../../hooks/useSignalR';
import { timeAgo } from '../../utils/timeAgo';
import defaultAvatar from '../../constants/defaultAvatar';

interface ChatMessage {
  id?: string;
  conversationId?: string;
  senderId?: string;
  receiverId: string;
  content: string;
  createdAt?: string;
  isDeleted: boolean;
  isRead: boolean;
}

interface Conversation {
  id: string;
  user1Id: string;
  user2Id: string;
  createdAt: string;
  lastMessageAt?: string;
  lastMessageId?: string | null;
  lastMessage?: string | null;
  messages: ChatMessage[];
}

/** Backend can create multiple rows per user pair; show one thread per peer (latest activity wins). */
function dedupeConversationsByParticipantPair(list: Conversation[]): Conversation[] {
  const byPair = new Map<string, Conversation>();
  const recency = (c: Conversation) =>
    new Date(c.lastMessageAt ?? c.createdAt).getTime();
  for (const conv of list) {
    const pairKey = [conv.user1Id, conv.user2Id].sort().join('|');
    const prev = byPair.get(pairKey);
    if (!prev || recency(conv) >= recency(prev)) {
      byPair.set(pairKey, conv);
    }
  }
  return Array.from(byPair.values()).sort((a, b) => recency(b) - recency(a));
}

/** Must match the hub method name from ChatHub.SendAsync(...) on the server (often `ReceiveMessage`). */
const CHAT_SIGNALR_RECEIVE_METHOD = 'ReceiveMessage';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);
  const currentUserId = user.id;

  // Gateway requires Bearer JWT for /chat/*; skip until logged in to avoid 401 noise.
  const hasJwt = Boolean(localStorage.getItem('jwt')?.trim());

  const { onMessage: onChatHubMessage } = useSignalR({
    hub: 'chat',
    accessTokenFactory: () => localStorage.getItem('jwt'),
    method: CHAT_SIGNALR_RECEIVE_METHOD,
  });

  const refreshChatQueries = useCallback(() => {
    dispatch(
      apiSlice.util.invalidateTags([{ type: 'Conversation' }, { type: 'Messages' }])
    );
  }, [dispatch]);

  /** Real-time: other users' sends do not hit our mutations — refetch when hub pushes (see FEATURES_AND_API chat hub). */
  useEffect(() => {
    if (!hasJwt) return;
    const cleanup = onChatHubMessage(() => {
      refreshChatQueries();
    });
    return cleanup;
  }, [hasJwt, onChatHubMessage, refreshChatQueries]);

  const { data: conversationsData, isLoading: conversationsLoading } = apiSlice.useGetConversationQuery(
    {},
    {
      skip: !hasJwt,
      pollingInterval: hasJwt && isOpen ? 8000 : 0,
    }
  );
  const { data: messagesData, isLoading: messagesLoading } = apiSlice.useGetMessagesQuery(
    selectedConversation!,
    {
      skip:
        !hasJwt ||
        !selectedConversation ||
        selectedConversation.startsWith('temp_'),
      pollingInterval:
        hasJwt &&
        isOpen &&
        selectedConversation &&
        !selectedConversation.startsWith('temp_')
          ? 5000
          : 0,
    }
  );
  const [sendMessage] = apiSlice.useSendMessageMutation();

  const conversations = useMemo(
    () => dedupeConversationsByParticipantPair(conversationsData ?? []),
    [conversationsData]
  );

  const getOtherUserId = (conv: Conversation) => {
    return conv.user1Id === currentUserId ? conv.user2Id : conv.user1Id;
  };

  const getOtherUserName = (userId: string) => {
    return userId;
  };

  useEffect(() => {
    if (targetUserId && targetUserName && isOpen) {
      const existingConversation = conversations.find(conv => 
        (conv.user1Id === currentUserId && conv.user2Id === targetUserId) ||
        (conv.user1Id === targetUserId && conv.user2Id === currentUserId)
      );

      if (existingConversation) {
        setSelectedConversation(existingConversation.id);
      } else {
        setSelectedConversation(`temp_${currentUserId}_${targetUserId}`);
      }
    }
  }, [targetUserId, targetUserName, isOpen, conversations, currentUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesData]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = newMessage.trim();
    if (!text || !selectedConversation) return;

    let receiverId: string | undefined;
    if (selectedConversation.startsWith('temp_')) {
      receiverId = targetUserId ?? selectedConversation.split('_')[2];
    } else {
      const conv = conversations.find((c) => c.id === selectedConversation);
      receiverId = conv ? getOtherUserId(conv) : undefined;
    }

    if (!receiverId?.trim()) return;

    try {
      await sendMessage({
        receiverId,
        content: text,
      });
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const messages: ChatMessage[] = messagesData || [];

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => isOpen ? closeChatWidget() : setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-12 h-12 bg-brand-600 hover:bg-brand-700 text-white rounded-full shadow-lg z-50 transition-all duration-200 flex items-center justify-center cursor-pointer ${
          isOpen ? '' : 'hover:scale-105'
        }`}
      >
        {isOpen ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 6 21a5.969 5.969 0 0 0 1.936-1.094A3.61 3.61 0 0 1 6.768 18.5c-1.414-1.457-2.268-3.376-2.268-5.5 0-4.556 4.03-8.25 9-8.25S21 7.444 21 12Z" />
          </svg>
        )}
      </button>

      {/* Chat Panel */}
      <div className={`fixed bottom-20 right-6 w-96 h-[32rem] bg-white rounded-2xl shadow-dropdown border border-surface-200 z-40 transition-all duration-200 overflow-hidden ${
        isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95 pointer-events-none'
      } ${isMobile ? 'w-[calc(100vw-2rem)] right-4' : ''}`}>
        
        <div className="h-full flex flex-col">
          {/* Panel Header */}
          <div className="px-4 py-3 border-b border-surface-100 flex items-center justify-between shrink-0">
            {selectedConversation ? (
              <>
                <button 
                  onClick={() => setSelectedConversation(null)} 
                  className="p-1.5 rounded-lg hover:bg-surface-100 transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4 text-surface-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                  </svg>
                </button>
                <h3 className="font-semibold text-sm text-surface-900">
                  {selectedConversation.startsWith('temp_') 
                    ? targetUserName || 'Tin nhắn mới'
                    : (() => {
                        const conv = conversations.find(c => c.id === selectedConversation);
                        if (conv) return getOtherUserName(getOtherUserId(conv));
                        return 'Tin nhắn';
                      })()
                  }
                </h3>
                <div className="w-7" />
              </>
            ) : (
              <h3 className="font-semibold text-sm text-surface-900">Tin nhắn</h3>
            )}
          </div>

          {/* Content */}
          {!selectedConversation ? (
            <div className="flex-1 overflow-y-auto">
              {conversationsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-6">
                  <div className="w-16 h-16 bg-surface-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-surface-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 6 21a5.969 5.969 0 0 0 1.936-1.094A3.61 3.61 0 0 1 6.768 18.5c-1.414-1.457-2.268-3.376-2.268-5.5 0-4.556 4.03-8.25 9-8.25S21 7.444 21 12Z" />
                    </svg>
                  </div>
                  <p className="font-medium text-sm text-surface-700 mb-1">Chưa có cuộc trò chuyện</p>
                  <p className="text-xs text-surface-400 leading-relaxed">Nhấn vào nút "Chat" bên cạnh bình luận để bắt đầu</p>
                </div>
              ) : (
                conversations.map((conversation) => {
                  const otherUserId = getOtherUserId(conversation);
                  const otherUserName = getOtherUserName(otherUserId);
                  return (
                    <button
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-50 transition-colors cursor-pointer border-b border-surface-50"
                    >
                      <img
                        className="w-10 h-10 rounded-full object-cover shrink-0"
                        src={defaultAvatar}
                        alt=""
                      />
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-surface-900 truncate">{otherUserName}</p>
                          {conversation.lastMessageAt && (
                            <span className="text-[10px] text-surface-400 shrink-0 ml-2">{timeAgo(conversation.lastMessageAt)}</span>
                          )}
                        </div>
                        <p className="text-xs text-surface-400 truncate mt-0.5">
                          {conversation.lastMessage?.trim()
                            ? conversation.lastMessage
                            : 'Nhấn để xem tin nhắn'}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messagesLoading && !selectedConversation.startsWith('temp_') ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-surface-400">
                    <p className="text-sm">Gửi tin nhắn để bắt đầu cuộc trò chuyện!</p>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isMine = msg.senderId === currentUserId;
                    const msgKey =
                      msg.id ??
                      `msg-${index}-${msg.createdAt ?? ''}-${msg.content?.slice(0, 24) ?? ''}`;
                    return (
                      <div key={msgKey} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-sm ${
                          isMine
                            ? 'bg-brand-600 text-white rounded-br-md'
                            : 'bg-surface-100 text-surface-800 rounded-bl-md'
                        }`}>
                          <p>{msg.content}</p>
                          {msg.createdAt && (
                            <p className={`text-[10px] mt-1 ${isMine ? 'text-white/60' : 'text-surface-400'}`}>
                              {timeAgo(msg.createdAt)}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-surface-100 shrink-0">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 px-4 py-2 bg-surface-50 border border-surface-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 transition-all placeholder:text-surface-400"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="p-2 bg-brand-600 hover:bg-brand-700 text-white rounded-full disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                    </svg>
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ChatWidget;
