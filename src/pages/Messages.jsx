import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowLeft, Search as SearchIcon, MoreVertical, MessageSquare } from 'lucide-react';
import io from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';
import { fetchChats, accessChat, fetchMessages, sendMessage, searchUsers, getUserFollowing } from '../services/api';
import toast from 'react-hot-toast';

const ENDPOINT = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api/v1', '') : 'http://localhost:8000';
var socket, selectedChatCompare;

export const Messages = () => {
  const { user } = useAuth();
  
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const [suggestedUsers, setSuggestedUsers] = useState([]);

  const messagesEndRef = useRef(null);

  // Initialize Socket.IO
  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit('setup', user);
    socket.on('connected', () => setSocketConnected(true));
    socket.on('typing', () => setIsTyping(true));
    socket.on('stop typing', () => setIsTyping(false));

    return () => {
      socket.disconnect();
    };
  }, [user]);

  // Load Chats and Suggested Users
  useEffect(() => {
    loadChats();
    if (user?._id) {
      loadSuggestedUsers();
    }
  }, [user]);

  const loadSuggestedUsers = async () => {
    try {
      const data = await getUserFollowing(user._id);
      const validUsers = (data.data?.users || []).filter(u => u !== null && u !== undefined);
      setSuggestedUsers(validUsers);
    } catch (error) {
      console.error('Failed to load suggested users', error);
    }
  };

  const loadChats = async () => {
    try {
      setLoadingChats(true);
      const response = await fetchChats();
      setChats(response.data || response);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load chats');
    } finally {
      setLoadingChats(false);
    }
  };

  // Load Messages when chat is selected
  useEffect(() => {
    const fetchChatMessages = async () => {
      if (!selectedChat) return;
      try {
        setLoadingMessages(true);
        const response = await fetchMessages(selectedChat._id);
        setMessages(response.data || response);
        socket.emit('join chat', selectedChat._id);
      } catch (error) {
        console.error(error);
        toast.error('Failed to load messages');
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchChatMessages();
    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  // Socket Message Listener
  useEffect(() => {
    socket.on('message received', (newMessageReceived) => {
      if (!selectedChatCompare || selectedChatCompare._id !== newMessageReceived.chat._id) {
        // Notification logic could go here
        loadChats(); // Update latest message in chat list
      } else {
        setMessages([...messages, newMessageReceived]);
      }
    });
  });

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (!query) {
      setSearchResults([]);
      return;
    }
    
    try {
      setIsSearching(true);
      const data = await searchUsers(query);
      setSearchResults(data.data?.result || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAccessChat = async (userId) => {
    try {
      const response = await accessChat(userId);
      const newChat = response.data || response;
      
      // If chat already exists in state, just select it, else append
      if (!chats.find(c => c._id === newChat._id)) {
        setChats([newChat, ...chats]);
      }
      setSelectedChat(newChat);
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message || 'Error fetching the chat');
    }
  };

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit('typing', selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit('stop typing', selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  const handleSendMessage = async (e) => {
    if (e.key === 'Enter' && newMessage) {
      socket.emit('stop typing', selectedChat._id);
      setTyping(false);
      
      try {
        const content = newMessage;
        setNewMessage(''); // Clear immediately for better UX
        
        const response = await sendMessage(selectedChat._id, content);
        const savedMessage = response.data || response;
        
        socket.emit('new message', savedMessage);
        setMessages([...messages, savedMessage]);
        loadChats(); // Update chat list latest message
      } catch (error) {
        console.error(error);
        toast.error('Failed to send message');
      }
    }
  };

  const sendClick = async () => {
    if (newMessage) {
      socket.emit('stop typing', selectedChat._id);
      setTyping(false);
      
      try {
        const content = newMessage;
        setNewMessage('');
        
        const response = await sendMessage(selectedChat._id, content);
        const savedMessage = response.data || response;
        
        socket.emit('new message', savedMessage);
        setMessages([...messages, savedMessage]);
        loadChats();
      } catch (error) {
        console.error(error);
        toast.error('Failed to send message');
      }
    }
  };

  const getChatName = (chat) => {
    if (!chat || !chat.users) return '';
    if (chat.isGroupChat) return chat.chatName;
    const otherUser = chat.users.find(u => u._id !== user._id);
    return otherUser ? otherUser.name : 'Unknown User';
  };

  const getChatImage = (chat) => {
    if (!chat || !chat.users) return '';
    if (chat.isGroupChat) return 'https://via.placeholder.com/150?text=Group';
    const otherUser = chat.users.find(u => u._id !== user._id);
    return otherUser ? otherUser.profileImage : '';
  };

  return (
    <div className="flex h-[calc(100vh-56px)] md:h-screen w-full bg-bg-primary overflow-hidden">
      
      {/* ── Left Sidebar: Chat List ───────────────────────────────────── */}
      <div className={`w-full md:w-[350px] lg:w-[400px] flex flex-col border-r border-border-subtle bg-bg-secondary ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-border-subtle bg-bg-primary">
          <h2 className="text-xl font-bold mb-4 text-text-primary">Messages</h2>
          
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full bg-bg-elevated border border-border-default rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-all text-text-primary placeholder:text-text-tertiary"
            />
          </div>
        </div>

        {!searchQuery && suggestedUsers.length > 0 && (
          <div className="px-4 py-3 border-b border-border-subtle overflow-x-auto no-scrollbar whitespace-nowrap bg-bg-primary">
            {suggestedUsers.map(su => (
              <div 
                key={su._id} 
                onClick={() => handleAccessChat(su._id)}
                className="inline-flex flex-col items-center justify-center mr-4 cursor-pointer group w-14 align-top"
                title={su.name}
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-accent-400 to-accent-600 p-[2px] mb-1">
                  <div className="bg-bg-primary w-full h-full rounded-full p-[2px]">
                    <img src={su.profileImage} alt={su.name} className="w-full h-full rounded-full object-cover group-hover:opacity-80 transition-opacity" />
                  </div>
                </div>
                <span className="text-[11px] font-medium text-text-secondary group-hover:text-text-primary truncate w-full text-center">
                  {su?.name?.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto no-scrollbar">
          {searchQuery ? (
            // Search Results
            <div className="p-2 space-y-1">
              {isSearching ? (
                <div className="p-4 text-center text-text-tertiary text-sm">Searching...</div>
              ) : searchResults.length > 0 ? (
                searchResults.map(resultUser => (
                  <div
                    key={resultUser._id}
                    onClick={() => handleAccessChat(resultUser._id)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-bg-elevated cursor-pointer transition-colors"
                  >
                    <img src={resultUser.profileImage} alt={resultUser.name} className="w-12 h-12 rounded-full object-cover" />
                    <div>
                      <p className="font-semibold text-text-primary text-sm">{resultUser.name}</p>
                      <p className="text-xs text-text-tertiary">{resultUser.email}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-text-tertiary text-sm">No users found</div>
              )}
            </div>
          ) : (
            // Chat List
            <div className="p-2 space-y-1">
              {loadingChats ? (
                [1, 2, 3, 4].map(i => (
                  <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                    <div className="w-12 h-12 rounded-full bg-bg-elevated"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-bg-elevated rounded w-1/2"></div>
                      <div className="h-3 bg-bg-elevated rounded w-3/4"></div>
                    </div>
                  </div>
                ))
              ) : chats.length > 0 ? (
                chats.map(chat => (
                  <div
                    key={chat._id}
                    onClick={() => setSelectedChat(chat)}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${selectedChat?._id === chat._id ? 'bg-accent-500/10 border border-accent-500/20' : 'hover:bg-bg-elevated border border-transparent'}`}
                  >
                    <img src={getChatImage(chat)} alt={getChatName(chat)} className="w-12 h-12 rounded-full object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <p className="font-semibold text-text-primary text-sm truncate">{getChatName(chat)}</p>
                      </div>
                      {chat.latestMessage && (
                        <p className={`text-xs truncate ${chat.latestMessage.sender._id !== user._id && !chat.latestMessage.read ? 'text-text-primary font-medium' : 'text-text-tertiary'}`}>
                          {chat.latestMessage.sender._id === user._id ? 'You: ' : ''}
                          {chat.latestMessage.content}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-text-tertiary">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">No conversations yet.<br/>Search for a user to start chatting.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Right Side: Active Chat ─────────────────────────────────────── */}
      <div className={`flex-1 flex flex-col bg-bg-primary relative ${!selectedChat ? 'hidden md:flex' : 'flex'}`}>
        {!selectedChat ? (
          <div className="flex-1 flex flex-col items-center justify-center text-text-tertiary p-8">
            <div className="w-24 h-24 rounded-full bg-bg-elevated flex items-center justify-center mb-6">
              <Send size={40} className="text-text-muted" />
            </div>
            <h3 className="text-2xl font-bold text-text-primary mb-2">Your Messages</h3>
            <p className="text-center max-w-md">Send private photos and messages to a friend or group.</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="h-16 border-b border-border-subtle flex items-center px-4 bg-bg-primary/90 backdrop-blur-md sticky top-0 z-10">
              <button 
                onClick={() => setSelectedChat(null)}
                className="md:hidden p-2 -ml-2 mr-2 text-text-tertiary hover:text-text-primary rounded-xl transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              
              <div className="flex items-center gap-3 flex-1 cursor-pointer">
                <img src={getChatImage(selectedChat)} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <h3 className="font-bold text-sm text-text-primary">{getChatName(selectedChat)}</h3>
                </div>
              </div>
              
              <button className="p-2 text-text-tertiary hover:text-text-primary rounded-xl transition-colors">
                <MoreVertical size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-bg-secondary/30">
              {loadingMessages ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-500"></div>
                </div>
              ) : (
                <>
                  {messages.map((m, i) => {
                    const isSender = m.sender._id === user._id;
                    const showAvatar = !isSender && (i === messages.length - 1 || messages[i + 1].sender._id !== m.sender._id);
                    
                    return (
                      <div key={m._id} className={`flex ${isSender ? 'justify-end' : 'justify-start'} mb-1`}>
                        <div className="flex items-end gap-2 max-w-[75%] md:max-w-[65%]">
                          {!isSender && showAvatar && (
                            <img src={m.sender.profileImage} alt={m.sender.name} className="w-6 h-6 rounded-full object-cover shrink-0 mb-1" />
                          )}
                          {!isSender && !showAvatar && <div className="w-6 shrink-0" />}
                          
                          <div className={`px-4 py-2.5 rounded-2xl text-[15px] ${
                            isSender 
                              ? 'bg-accent-500 text-white rounded-br-sm' 
                              : 'bg-bg-elevated text-text-primary rounded-bl-sm border border-border-subtle'
                          }`}>
                            <p className="leading-relaxed whitespace-pre-wrap break-words">{m.content}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {isTyping && (
                    <div className="flex justify-start mb-1">
                      <div className="flex items-end gap-2">
                        <div className="w-6 shrink-0" />
                        <div className="px-4 py-3 bg-bg-elevated rounded-2xl rounded-bl-sm border border-border-subtle flex gap-1">
                          <span className="w-1.5 h-1.5 bg-text-tertiary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                          <span className="w-1.5 h-1.5 bg-text-tertiary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                          <span className="w-1.5 h-1.5 bg-text-tertiary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input Area */}
            <div className="p-3 md:p-4 bg-bg-primary border-t border-border-subtle">
              <div className="flex items-end gap-2 bg-bg-elevated border border-border-default focus-within:border-accent-500/50 focus-within:ring-1 focus-within:ring-accent-500/50 rounded-2xl p-1 transition-all">
                <textarea
                  value={newMessage}
                  onChange={typingHandler}
                  onKeyDown={handleSendMessage}
                  placeholder="Message..."
                  className="flex-1 max-h-32 min-h-[44px] bg-transparent text-text-primary text-[15px] placeholder:text-text-tertiary resize-none py-2.5 px-3 focus:outline-none"
                  rows={1}
                />
                <button 
                  onClick={sendClick}
                  disabled={!newMessage.trim()}
                  className="p-2 mb-0.5 mr-0.5 bg-accent-500 hover:bg-accent-600 disabled:bg-accent-500/50 disabled:cursor-not-allowed text-white rounded-xl transition-colors shrink-0"
                >
                  <Send size={20} className="ml-0.5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
