import { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Send, 
  Heart, 
  Reply, 
  Loader2, 
  MessageSquare,
  CornerDownRight
} from "lucide-react";
import api from "../api";
import { AuthContext } from "../Context/AuthContext";
import { toast } from "react-toastify";
import { formatRelativeTime } from "../utils/formatTime";

const CommentModal = ({ post, onClose }) => {
  const { user } = useContext(AuthContext);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState(null); // stores the comment object we are replying to

  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/community/post/${post._id}/comments`);
      setComments(res.data.comments || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [post._id]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to comment");
      return;
    }
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      const res = await api.post("/community/post/comment", {
        postId: post._id,
        content: newComment,
        parentId: replyTo?._id || null
      });
      
      setComments([...comments, res.data.comment]);
      setNewComment("");
      setReplyTo(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId) => {
    if (!user) {
      toast.error("Please login to like comments");
      return;
    }
    try {
      const res = await api.post(`/community/comment/${commentId}/like`);
      setComments(comments.map(c => c._id === commentId ? { ...c, likes: res.data.comment.likes } : c));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to like comment");
    }
  };

  // Helper to build a nested tree structure for comments
  const buildCommentTree = (flatComments) => {
    const map = {};
    const tree = [];
    
    flatComments.forEach(c => {
      map[c._id] = { ...c, children: [] };
    });
    
    flatComments.forEach(c => {
      if (c.parentId && map[c.parentId]) {
        map[c.parentId].children.push(map[c._id]);
      } else {
        tree.push(map[c._id]);
      }
    });
    
    return tree;
  };

  const commentTree = buildCommentTree(comments);

  const CommentItem = ({ comment, depth = 0 }) => (
    <div className={`space-y-4 ${depth > 0 ? 'ml-8 mt-4 border-l-2 border-gray-50 pl-6' : 'mb-8'}`}>
      <div className="flex gap-4">
        <img 
          src={comment.userId?.profileImage} 
          className="w-8 h-8 rounded-xl object-cover shadow-sm border border-gray-100"
          alt={comment.userId?.username}
        />
        <div className="flex-1">
          <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100/50 group">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-black text-gray-900">{comment.userId?.username}</span>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                {formatRelativeTime(comment.createdAt)}
              </span>
            </div>
            <p className="text-sm text-gray-600 font-medium leading-relaxed">
              {comment.content}
            </p>
          </div>
          
          <div className="flex items-center gap-4 mt-2 px-2">
            <button 
              onClick={() => handleLikeComment(comment._id)}
              className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-colors ${comment.likes?.includes(user?._id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
            >
              <Heart size={14} fill={comment.likes?.includes(user?._id) ? "currentColor" : "none"} />
              {comment.likes?.length || 0}
            </button>
            <button 
              onClick={() => setReplyTo(comment)}
              className="flex items-center gap-1.5 text-[10px] text-gray-400 hover:text-brand font-black uppercase tracking-widest transition-colors"
            >
              <Reply size={14} />
              Reply
            </button>
          </div>
        </div>
      </div>
      
      {comment.children && comment.children.map(child => (
        <CommentItem key={child._id} comment={child} depth={depth + 1} />
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-display font-black text-gray-900">Comments</h2>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
              Discussing on v/{post.communityIds?.[0]?.name}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50/20">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-20">
              <Loader2 className="animate-spin text-brand" size={40} />
            </div>
          ) : commentTree.length > 0 ? (
            commentTree.map(comment => <CommentItem key={comment._id} comment={comment} />)
          ) : (
            <div className="text-center py-20">
              <MessageSquare size={48} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-400 font-bold">No comments yet. Be the first to share your thoughts!</p>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 bg-white border-t border-gray-100">
          <AnimatePresence>
            {replyTo && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex items-center justify-between bg-orange-50 px-4 py-2 rounded-xl mb-3 border border-orange-100"
              >
                <div className="flex items-center gap-2 text-[10px] font-black text-brand uppercase tracking-widest">
                  <CornerDownRight size={14} />
                  Replying to {replyTo.userId?.username}
                </div>
                <button onClick={() => setReplyTo(null)} className="text-brand hover:text-brand-dark transition-colors">
                  <X size={14} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmitComment} className="flex gap-4">
            <input 
              type="text"
              placeholder={replyTo ? "Write your reply..." : "Add a comment..."}
              className="flex-1 bg-gray-50 rounded-2xl px-6 py-4 font-bold text-gray-900 outline-none border-2 border-transparent focus:border-brand focus:bg-white transition-all shadow-inner"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              autoFocus
            />
            <button 
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center hover:bg-brand transition-all shadow-xl shadow-black/10 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default CommentModal;
