import { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, 
  Heart, 
  Reply, 
  Loader2, 
  CornerDownRight,
  X
} from "lucide-react";
import api from "../api";
import { AuthContext } from "../Context/AuthContext";
import { toast } from "react-toastify";
import { formatRelativeTime } from "../utils/formatTime";

const CommentSection = ({ postId }) => {
  const { user } = useContext(AuthContext);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState(null);



  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/community/post/${postId}/comments`);
      setComments(res.data.comments || []);
    } catch (err) {
      toast.error(err?.response?.data?.message ||"Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

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
        postId: postId,
        content: newComment,
        parentId: replyTo?._id || null
      });
      
      setComments([...comments, res.data.comment]);
      setNewComment("");
      setReplyTo(null);
    } catch (err) {
      toast.error(err?.response?.data?.message ||"Failed to post comment");
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
      toast.error(err?.response?.data?.message ||"Failed to like comment");
    }
  };

  const buildCommentTree = (flatComments) => {
    const map = {};
    const tree = [];
    flatComments.forEach(c => { map[c._id] = { ...c, children: [] }; });
    flatComments.forEach(c => {
      if (c.parentId && map[c.parentId]) map[c.parentId].children.push(map[c._id]);
      else tree.push(map[c._id]);
    });
    return tree;
  };

  const commentTree = buildCommentTree(comments);

  const CommentItem = ({ comment, depth = 0 }) => (
    <div className={`space-y-4 ${depth > 0 ? 'ml-6 mt-3 border-l border-gray-100 pl-4' : 'mb-6'}`}>
      <div className="flex gap-3">
        <img 
          src={comment.userId?.profileImage} 
          className="w-7 h-7 rounded-lg object-cover"
          alt="user"
        />
        <div className="flex-1 min-w-0">
          <div className="bg-gray-50/80 rounded-2xl p-3 border border-gray-100/50">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[11px] font-black text-gray-900">{comment.userId?.username}</span>
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">
                {formatRelativeTime(comment.createdAt)}
              </span>
            </div>
            <p className="text-xs text-gray-600 font-medium leading-relaxed">
              {comment.content}
            </p>
          </div>
          
          <div className="flex items-center gap-4 mt-1.5 px-1">
            <button 
              onClick={() => handleLikeComment(comment._id)}
              className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-widest transition-colors ${comment.likes?.includes(user?._id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
            >
              <Heart size={12} fill={comment.likes?.includes(user?._id) ? "currentColor" : "none"} />
              {comment.likes?.length || 0}
            </button>
            <button 
              onClick={() => setReplyTo(comment)}
              className="flex items-center gap-1 text-[9px] text-gray-400 hover:text-brand font-black uppercase tracking-widest transition-colors"
            >
              <Reply size={12} />
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
    <div className="bg-white border-t border-gray-50 flex flex-col max-h-[500px]">
      {/* Comments List */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
        {loading ? (
          <div className="flex justify-center py-10 opacity-20">
            <Loader2 className="animate-spin text-brand" size={24} />
          </div>
        ) : commentTree.length > 0 ? (
          commentTree.map(comment => <CommentItem key={comment._id} comment={comment} />)
        ) : (
          <div className="text-center py-10">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">No comments yet</p>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-gray-50/30 border-t border-gray-100">
        <AnimatePresence>
          {replyTo && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center justify-between bg-orange-50 px-3 py-1.5 rounded-xl mb-3 border border-orange-100"
            >
              <div className="flex items-center gap-2 text-[9px] font-black text-brand uppercase tracking-widest">
                <CornerDownRight size={12} />
                Replying to {replyTo.userId?.username}
              </div>
              <button onClick={() => setReplyTo(null)} className="text-brand">
                <X size={12} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmitComment} className="flex gap-3">
          <input 
            type="text"
            placeholder={replyTo ? "Reply..." : "Add comment..."}
            className="flex-1 bg-white rounded-xl px-4 py-3 text-xs font-bold text-gray-900 outline-none border border-gray-100 focus:border-brand transition-all"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button 
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center hover:bg-brand transition-all shadow-lg shadow-black/10 disabled:opacity-50"
          >
            {submitting ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CommentSection;
