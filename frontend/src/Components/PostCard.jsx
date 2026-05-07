import { Link } from "react-router-dom";
import { useRef, useEffect } from "react";
import { Heart, MessageSquare, MoreVertical, Edit2, Trash2 } from "lucide-react";
import { formatRelativeTime } from "../utils/formatTime";

const PostCard = ({ 
  post, 
  currentUser, 
  onLike, 
  onComment, 
  onEdit, 
  onDelete,
  activeDropdownPostId,
  setActiveDropdownPostId
}) => {
  const isOwner = currentUser?._id === (post.userId?._id || post.userId);
  const isLiked = post.likes?.includes(currentUser?._id);

  // Refs for dropdown and button
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (activeDropdownPostId !== post._id) return;
    const handleClickOutside = (event) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setActiveDropdownPostId?.(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeDropdownPostId, post._id, setActiveDropdownPostId]);

  return (
    <div className="hover:bg-orange-50/30 rounded-2xl transition-all duration-300 md:p-4 p-2 group relative">
      <div className="p-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to={`/user/${post.userId?._id || post.userId}`}>
            <img
              src={post.userId?.profileImage}
              className="w-10 h-10 rounded-full object-cover border border-white shadow-sm"
              alt={post.userId?.username}
            />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-1">
              {post.communityIds?.map((comm, i) => (
                <div key={comm._id} className="flex items-center gap-1">
                  <Link
                    to={`/community/${comm._id}`}
                    className="text-[10px] lowercase font-black text-gray-900 hover:text-brand transition-colors tracking-wider"
                  >
                    v/{comm.name}
                  </Link>
                  {i < post.communityIds.length - 1 && <span className="text-gray-800 text-xs">&</span>}
                </div>
              )) || (
                <p className="text-[10px] font-black text-gray-900 tracking-wider">v/communities</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* adding username */}
              <Link to={`/user/${post.userId?._id || post.userId}`}>
                <p className="text-[8px] font-black text-gray-900 lowercase tracking-wider">
                 by @{post.userId?.username}
                </p>
              </Link>
            </div>
            <p className="text-[9px] text-gray-400 font-bold uppercase">
              {formatRelativeTime(post.createdAt)}
            </p>
          </div>
        </div>

        {/* Post Actions Menu */}
        <div className="relative">
          <button
            ref={buttonRef}
            onClick={(e) => {
              e.stopPropagation();
              setActiveDropdownPostId?.(activeDropdownPostId === post._id ? null : post._id);
            }}
            className="p-2 text-gray-300 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-100"
          >
            <MoreVertical size={18} />
          </button>

          {activeDropdownPostId === post._id && (
            <div
              ref={dropdownRef}
              className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 overflow-hidden"
            >
              {isOwner && (
                <>
                  <button
                    onClick={() => onEdit?.(post)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-orange-50 hover:text-brand transition-colors"
                  >
                    <Edit2 size={16} /> Edit Broadcast
                  </button>
                  <button
                    onClick={() => onDelete?.(post._id)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={16} /> Delete Forever
                  </button>
                </>
              )}
              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                <MoreVertical size={16} /> Share Sync
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 mt-2">
        <p className="font-semibold leading-relaxed  line-clamp-3 mb-4 px-2 text-gray-800">
          {post.content}
        </p>
        {post.image && (
          <div className="overflow-hidden aspect-auto md:aspect-4/3 bg-white border border-gray-200 rounded-xl">
            <img
              src={post.image}
              className="w-full h-full object-contain"
              alt="Post content"
            />
          </div>
        )}
        {post.video && (
          <div className="overflow-hidden aspect-video bg-black border border-gray-200 rounded-xl mt-2">
            <video
              src={post.video}
              controls
              className="w-full h-full object-contain"
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-6 mt-4">
        <button 
          onClick={() => onLike?.(post._id)}
          className="flex items-center gap-2 rounded-xl px-4 py-2 bg-gray-100/50 hover:bg-orange-50 transition-colors group/like"
        >
          <Heart
            size={18}
            className={`${isLiked ? "fill-brand text-brand" : "text-gray-400 group-hover/like:text-brand"}`}
          />
          <span className={`text-[11px] font-black tracking-widest ${isLiked ? "text-brand" : "text-gray-600"}`}>
            {post.likes?.length || 0}
          </span>
        </button>
        <button 
          onClick={() => onComment?.(post._id)}
          className="flex items-center gap-2 rounded-xl px-3 py-2 bg-gray-100/50 hover:bg-orange-50 transition-colors group/comment"
        >
          <MessageSquare size={18} className="text-gray-400 group-hover/comment:text-brand" />
          <span className="text-[11px] font-black tracking-widest text-gray-600 group-hover/comment:text-brand">
            {post.commentCount || 0}
          </span>
        </button>
      </div>
    </div>
  );
};

export default PostCard;
