import { useState, useEffect, useRef, useContext } from "react";
import { AuthContext } from "../Context/AuthContext";
import api from "../api";
import { io } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, 
  Search, 
  MoreVertical, 
  Phone, 
  Video, 
  Loader2, 
  MessageSquare, 
  ChevronLeft,
  Users,
} from "lucide-react";

const Chat = ({ setHideMobileNav }) => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("personal"); // personal, community
  
  const [buddies, setBuddies] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null); // Will hold either buddy info or community info
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [socket, setSocket] = useState(null);
  const scrollRef = useRef();
  
  // Manage Mobile Nav Visibility
  useEffect(() => {
    if (setHideMobileNav) {
      setHideMobileNav(!!selectedChat);
    }
    return () => {
      if (setHideMobileNav) setHideMobileNav(false);
    };
  }, [selectedChat, setHideMobileNav]);

  // Initialize Socket
  useEffect(() => {
    const socketURL = import.meta.env.VITE_API_URL || "http://localhost:3001";
    const newSocket = io(socketURL);

    
    newSocket.on("connect", () => {
      setSocket(newSocket);
    });

    return () => {
        newSocket.close();
        setSocket(null);
    };
  }, [user]);


  // Fetch Data (Buddies and Communities)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [connRes, commRes] = await Promise.all([
          api.get("/connection/my"),
          api.get("/community/my-communities")
        ]);
        setBuddies(connRes.data.conn || []);
        setCommunities(commRes.data.communities || []);
      } catch (err) {
        console.error("Error fetching chat data:", err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [user]);

  // Handle Socket Messages
  useEffect(() => {
    if (!socket) return;

    // Personal Messages
    socket.on("receive_message", (message) => {
        if (selectedChat?.type === "personal" && message.connectionId === selectedChat.connectionId) {
            setMessages((prev) => [...prev, message]);
        }
    });

    // Community Messages
    socket.on("receive_community_message", (message) => {
        if (selectedChat?.type === "community" && message.communityId === selectedChat._id) {
            setMessages((prev) => [...prev, message]);
        }
    });

    return () => {
        socket.off("receive_message");
        socket.off("receive_community_message");
    };
  }, [socket, selectedChat]);

  // Scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleBuddySelect = async (conn) => {
    const buddyData = conn.senderId?._id === user?._id ? conn.receiverId : conn.senderId;
    setSelectedChat({ 
        ...buddyData, 
        connectionId: conn._id, 
        type: "personal" 
    });
    
    // Join socket room
    socket?.emit("join_chat", conn._id);

    // Fetch History
    try {
      const response = await api.get(`/chat/history/${conn._id}`);
      setMessages(response.data || []);
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  };

  const handleCommunitySelect = async (comm) => {
    setSelectedChat({ 
        ...comm, 
        type: "community" 
    });
    
    // Join socket room
    socket?.emit("join_community", comm._id);

    // Fetch History
    try {
      const response = await api.get(`/community/messages/${comm._id}`);
      setMessages(response.data.messages || []);
    } catch (err) {
      console.error("Error fetching community history:", err);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat || !socket) return;

    if (selectedChat.type === "personal") {
        const messageData = {
          connectionId: selectedChat.connectionId,
          senderId: user._id,
          content: newMessage,
        };
        socket.emit("send_message", messageData);
    } else {
        const messageData = {
          communityId: selectedChat._id,
          senderId: user._id,
          content: newMessage,
        };
        socket.emit("send_community_message", messageData);
    }
    setNewMessage("");
  };

  const isImage = (url) => {
    if (typeof url !== 'string') return false;
    return (url.match(/\.(jpeg|jpg|gif|png|webp)$/) != null) || url.startsWith('https://images.unsplash.com');
  };

  const filteredItems = activeTab === "personal" 
    ? buddies.filter(conn => {
        const buddy = conn.senderId?._id === user?._id ? conn.receiverId : conn.senderId;
        return buddy?.username?.toLowerCase().includes(searchQuery.toLowerCase());
      })
    : communities.filter(comm => 
        comm.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-white md:bg-orange-50/20 font-sans overflow-hidden">
        <div className="container mx-auto h-screen flex bg-white shadow-2xl md:border md:border-orange-100/50 overflow-hidden relative">
        
        {/* Sidebar */}
        <div className={`w-full md:w-80 lg:w-96 border-r border-orange-100/50 flex flex-col transition-all duration-300 ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-6 border-b border-orange-100/50">
                <div className="flex items-center justify-center md:items-center md:justify-start ">
                    <h2 className="text-2xl font-display font-black text-stone-900 mb-6 flex items-center gap-3">
                    Messages
                </h2>
                </div>
                
                {/* Toggle */}
                <div className="bg-gray-50 p-1 rounded-2xl flex items-center relative border border-gray-100 mb-6">
                    <button 
                        onClick={() => { setActiveTab("personal"); setSelectedChat(null); }}
                        className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${
                            activeTab === "personal" ? "text-brand" : "text-gray-400 hover:text-gray-900"
                        }`}
                    >
                        <MessageSquare size={14} />
                        Personal
                        {activeTab === "personal" && (
                            <motion.div
                                layoutId="activeTabChat"
                                className="absolute inset-0 bg-white rounded-xl shadow-sm border border-gray-100 -z-10"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                    </button>
                    <button 
                        onClick={() => { setActiveTab("community"); setSelectedChat(null); }}
                        className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${
                            activeTab === "community" ? "text-brand" : "text-gray-400 hover:text-gray-900"
                        }`}
                    >
                        <Users size={14} />
                        Community
                        {activeTab === "community" && (
                            <motion.div
                                layoutId="activeTabChat"
                                className="absolute inset-0 bg-white rounded-xl shadow-sm border border-gray-100 -z-10"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                    </button>
                </div>


                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-brand transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder={activeTab === 'personal' ? "Search buddies..." : "Search communities..."} 
                        className="w-full bg-orange-50/50 border-2 border-orange-100/50 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-stone-900 focus:border-brand focus:bg-white outline-none transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 opacity-20">
                        <Loader2 className="animate-spin" size={32} />
                    </div>
                ) : filteredItems.length > 0 ? filteredItems.map((item) => {
                    const isPersonal = activeTab === "personal";
                    const buddy = isPersonal ? (item.senderId?._id === user?._id ? item.receiverId : item.senderId) : null;
                    const isActive = isPersonal 
                        ? selectedChat?.connectionId === item._id 
                        : selectedChat?._id === item._id;
                    
                    return (
                        <button 
                            key={item._id}
                            onClick={() => isPersonal ? handleBuddySelect(item) : handleCommunitySelect(item)}
                            className={`w-full flex items-center gap-4 p-2 rounded-2xl transition-all group ${isActive ? 'bg-brand text-white shadow-xl shadow-brand/20' : 'hover:bg-gray-50'}`}
                        >
                            <div className="relative shrink-0">
                                <img 
                                    src={isPersonal ? (buddy?.profileImage) : item.profileImage} 
                                    className={`w-12 h-12 rounded-full object-cover border-2 ${isActive ? 'border-white' : 'border-transparent shadow-sm'}`} 
                                    alt="profile"
                                />
                                {isPersonal && (
                                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 ${isActive ? 'bg-white border-brand' : 'bg-emerald-500 border-white shadow-sm'}`} />
                                )}
                            </div>
                            <div className="flex-1 text-left overflow-hidden">
                                <p className={`text-sm font-black truncate ${isActive ? 'text-white' : 'text-gray-900'}`}>
                                    {isPersonal ? buddy?.username : item.name}
                                </p>
                                <p className={`text-[10px] font-bold capitalize tracking-widest mt-0.5 truncate ${isActive ? 'text-brand-50' : 'text-gray-400'}`}>
                                    {isPersonal ? "Ready to explore" : `${item.members?.length || 0} sync members`}
                                </p>
                            </div>
                        </button>
                    )
                }) : (
                    <div className="py-20 text-center px-6">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                            {activeTab === 'personal' ? <MessageSquare size={32} /> : <Users size={32} />}
                        </div>
                        <p className="text-sm font-bold text-gray-400">
                            {activeTab === 'personal' 
                                ? "No buddies found. Connect with more travelers to start chatting!" 
                                : "You haven't joined any communities yet. Explore and join some!"}
                        </p>
                    </div>
                )}
            </div>
        </div>

        {/* Chat Window */}
        <div className={`flex-1 flex flex-col bg-white transition-all duration-300 ${!selectedChat ? 'hidden md:flex' : 'flex'}`}>
            {selectedChat ? (
                <>
                    {/* Chat Header */}
                    <div className="p-6  md:px-8 md:py-6 border-b border-gray-100 flex items-center justify-between bg-white z-10 shadow-sm shadow-gray-50">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setSelectedChat(null)} className="md:hidden p-2 -ml-2 text-gray-400 hover:text-gray-900">
                                <ChevronLeft size={24} />
                            </button>
                            <div className="relative">
                                <img 
                                    src={selectedChat.profileImage || `https://i.pravatar.cc/100?u=${selectedChat._id}`} 
                                    className="w-12 h-12 rounded-2xl object-cover shadow-sm border-2 border-white"
                                    alt="chat target"
                                />
                                {selectedChat.type === 'personal' && (
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
                                )}
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-gray-900 leading-none mb-1">
                                    {selectedChat.type === 'personal' ? selectedChat.username : selectedChat.name}
                                </h3>
                                <p className={`text-[10px] font-bold capitalize tracking-widest flex items-center gap-1.5 ${selectedChat.type === 'personal' ? 'text-emerald-500' : 'text-brand'}`}>
                                    {selectedChat.type === 'personal' ? (
                                        <><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Online Now</>
                                    ) : (
                                        <><Users size={12} /> Community Chat</>
                                    )}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {selectedChat.type === 'personal' && (
                                <>
                                    <button className="p-3 text-gray-400 hover:text-brand hover:bg-brand/10 rounded-2xl transition-all hidden sm:flex"><Phone size={20} /></button>
                                    <button className="p-3 text-gray-400 hover:text-brand hover:bg-brand/10 rounded-2xl transition-all hidden sm:flex"><Video size={20} /></button>
                                </>
                            )}
                            <button className="p-3 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-2xl transition-all"><MoreVertical size={20} /></button>
                        </div>
                    </div>

                    {/* Messages Body */}
                    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 bg-orange-50/20">
                        <AnimatePresence>
                            {messages.map((msg, i) => {
                                const sender = msg.senderId?._id || msg.senderId;
                                const isOwn = sender === user._id;
                                return (
                                    <motion.div 
                                        key={msg._id || i}
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'} gap-3`}
                                    >
                                        {!isOwn && selectedChat.type === "community" && (
                                            <img 
                                                src={msg.senderId?.profileImage} 
                                                className="w-8 h-8 rounded-full object-cover mt-1"
                                                alt="sender"
                                            />
                                        )}
                                        <div className={`max-w-[80%] md:max-w-[70%] ${isOwn ? 'order-1' : 'order-2'}`}>
                                            {!isOwn && selectedChat.type === "community" && (
                                                <p className="text-[9px] font-black text-gray-400 lowercase tracking-widest mb-1 ml-1">
                                                    {msg.senderId?.username}
                                                </p>
                                            )}
                                            <div className={`px-4 py-2 rounded-3xl text-sm font-medium shadow-sm overflow-hidden ${
                                                isOwn 
                                                ? 'bg-brand text-white rounded-tr-none shadow-xl shadow-brand/20' 
                                                : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                                            }`}>
                                                {isImage(msg.content) ? (
                                                    <img 
                                                        src={msg.content} 
                                                        alt="shared" 
                                                        className="max-w-full rounded-2xl cursor-pointer hover:opacity-90 transition-opacity"
                                                        onClick={() => window.open(msg.content, '_blank')}
                                                    />
                                                ) : (
                                                    msg.content
                                                )}
                                            </div>
                                            <p className={`text-[9px] font-black text-gray-400 tracking-widest mt-2 px-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </AnimatePresence>
                        <div ref={scrollRef} />
                    </div>

                    {/* Message Input */}
                    <div className="p-4 bg-white border-t border-gray-100">
                        <form onSubmit={handleSendMessage} className="flex items-center gap-4">
                            <div className="relative flex-1 group">
                                <input 
                                    type="text" 
                                    placeholder={selectedChat.type === 'personal' ? "Type your message..." : `Message v/${selectedChat.name}...`} 
                                    className="w-full bg-gray-50 border-2 border-transparent rounded-4xl py-4 px-6 text-sm font-bold text-gray-900 focus:border-brand focus:bg-white outline-none transition-all shadow-inner"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                />
                            </div>
                            <button 
                                type="submit"
                                disabled={!newMessage.trim()}
                                className="w-14 h-14 bg-gray-900 text-white rounded-full flex items-center justify-center hover:bg-brand transition-all active:scale-90 shadow-xl shadow-gray-200 disabled:opacity-50 disabled:grayscale"
                            >
                                <Send size={22} className="rotate-[-10deg] translate-x-0.5" />
                            </button>
                        </form>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-gray-50/20">
                    <div className="relative mb-8">
                        <div className="w-32 h-32 bg-brand/5 rounded-full flex items-center justify-center text-brand animate-pulse">
                            <img src="/logo.png" typeof="svg" alt="" className="bg-transparent" />
                        </div>
                    </div>
                    <h3 className="text-3xl font-display font-black text-gray-900 mb-4 tracking-tight">Velo Chat</h3>
                    <p className="text-gray-500 max-w-sm mx-auto font-medium leading-relaxed italic">
                        Select a traveler buddy or a community hub to start synchronizing your journey and sharing experiences.
                    </p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
