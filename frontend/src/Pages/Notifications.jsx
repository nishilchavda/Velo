import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import {
  Heart,
  MessageSquare,
  UserPlus,
  Check,
  ChevronRight,
  Bell,
  Loader2,
  Reply
} from "lucide-react";
import { motion } from "framer-motion";
import { AuthContext } from "../Context/AuthContext";
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import { formatRelativeTime } from "../utils/formatTime";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await api.get("/notification");
        setNotifications(response.data.notifications || []);
        
        // Mark all as read when opening the page
        await api.put("/notification/mark-all-read");
      } catch (err) {
        console.error("Error fetching notifications:", err);
        toast.error(err.response?.data?.message || "Failed to load activity.");
      } finally {
        setLoading(false);
      }
    };

    if (!user) {
      navigate("/login-signup");
      return;
    }
    fetchNotifications();

    const socketURL = import.meta.env.VITE_API_URL || "http://localhost:3001";
    const socket = io(socketURL);
    socket.emit("join_user", user._id);

    socket.on("new_notification", (notif) => {
      setNotifications(prev => [notif, ...prev]);
    });

    return () => socket.close();
  }, [user, navigate]);

  const handleAcceptRequest = async (senderId, notifId) => {
    try {
      const response = await api.get("/connection/pending");
      const pending = response.data.conn || [];
      const conn = pending.find(c => c.senderId._id === senderId);
      
      if (!conn) {
        toast.error("Request no longer exists");
        return;
      }

      await api.patch("/connection/respond", {
        connectionId: conn._id,
        newStatus: "accepted"
      });
      
      toast.success("Buddy Synchronized!");
      setNotifications(prev => prev.map(n => 
        n._id === notifId ? { ...n, type: 'connection_accept', isRead: true } : n
      ));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to accept request");
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notification/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error("Error marking read:", err);
    }
  };

  const getNotificationContent = (notif) => {
    switch (notif.type) {
      case "like_post":
        return {
          icon: <Heart size={16} className="text-red-500 fill-red-500" />,
          text: "liked your post",
          link: `/community/post/${notif.postId?._id}`,
          context: notif.postId?.content
        };
      case "comment_post":
        return {
          icon: <MessageSquare size={16} className="text-blue-500" />,
          text: "commented on your post",
          link: `/community/post/${notif.postId?._id}`,
          context: notif.commentId?.content
        };
      case "reply_comment":
        return {
          icon: <Reply size={16} className="text-purple-500" />,
          text: "replied to your comment",
          link: `/community/post/${notif.postId?._id}`,
          context: notif.commentId?.content
        };
      case "like_comment":
        return {
          icon: <Heart size={16} className="text-pink-500" />,
          text: "liked your comment",
          link: `/community/post/${notif.postId?._id}`,
          context: notif.commentId?.content
        };
      case "connection_request":
        return {
          icon: <UserPlus size={16} className="text-brand" />,
          text: "wants to connect with you",
          link: "/notifications", // Could be a separate tab or special handling
          context: notif.movementId ? `Sync for ${notif.movementId?.destination?.name || 'Movement'}` : "Social Request"
        };
      case "connection_accept":
        return {
          icon: <Check size={16} className="text-emerald-500" />,
          text: "accepted your connection request",
          link: `/user/${notif.senderId?._id}`,
          context: "New Buddy"
        };
      default:
        return {
          icon: <Bell size={16} className="text-gray-400" />,
          text: "sent you a notification",
          link: "#"
        };
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-brand" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30 py-6 px-4 md:px-10 font-sans">
      <div className="container mx-auto max-w-5xl">
        <div className="flex items-center justify-center mb-10">
          <h1 className="text-2xl mb:text-4xl font-display font-black text-gray-900 tracking-tight">
            Notifications
          </h1>
        </div>

        <div className="space-y-1">
          {notifications.length > 0 ? (
            notifications.map((notif, index) => {
              const content = getNotificationContent(notif);
              return (
                <motion.div
                  key={notif._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => markAsRead(notif._id)}
                  className={`group flex items-center gap-4 p-4 rounded-3xl transition-all cursor-pointer ${notif.isRead ? "opacity-70 hover:bg-white/80" : "bg-white shadow-sm border border-gray-100 hover:shadow-md"}`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={notif.senderId?.profileImage}
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-sm"
                      alt={notif.senderId?.username}
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full shadow-md flex items-center justify-center border border-gray-50">
                      {content.icon}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 leading-snug">
                      <span className="font-black hover:underline cursor-pointer">
                        {notif.senderId?.username}
                      </span>{" "}
                      <span className="font-medium text-gray-600">{content.text}</span>
                      <span className="ml-2 text-[10px] font-bold text-gray-400 uppercase">
                        {formatRelativeTime(notif.createdAt)}
                      </span>
                    </p>
                    {content.context && (
                       <p className="text-xs text-gray-400 mt-1 truncate font-medium">
                         "{content.context}"
                       </p>
                    )}
                  </div>

                  {!notif.isRead && (
                    <div className="w-2 h-2 bg-brand rounded-full shadow-lg shadow-brand/40" />
                  )}
                  
                  {notif.type === "connection_request" ? (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAcceptRequest(notif.senderId?._id, notif._id);
                      }}
                      className="px-6 py-2 bg-black text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-brand transition-all shadow-xl shadow-black/10 active:scale-95 whitespace-nowrap"
                    >
                      Accept
                    </button>
                  ) : (
                    <Link 
                      to={content.link}
                      className="opacity-0 group-hover:opacity-100 p-2 hover:bg-gray-50 rounded-xl transition-all"
                    >
                      <ChevronRight size={18} className="text-gray-300" />
                    </Link>
                  )}
                </motion.div>
              );
            })
          ) : (
            <div className="py-20 text-center">
              <div className="w-20 h-20 bg-white rounded-4xl shadow-sm flex items-center justify-center mx-auto mb-6 text-gray-200 border border-gray-100">
                <Bell size={40} />
              </div>
              <h3 className="text-2xl font-display font-black text-gray-900 mb-2">
                No Activity Yet
              </h3>
              <p className="text-gray-500 max-w-xs mx-auto font-medium">
                When someone likes or comments on your posts, you'll see it here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
