import { useState, useEffect, useContext, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api";
import { 
  TrendingUp,
  Loader2, 
  X, 
  Image as ImageIcon,
  Edit,
  Trash,
  Settings,
  Users,
  ChevronRight,
  Video
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../Context/AuthContext";
import { toast } from "react-toastify";
import CommentSection from "../Components/CommentSection";
import PostCard from "../Components/PostCard";

const CommunityDetail = () => {
  const { communityId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [communities, setCommunities] = useState([]); // For popular communities sidebar
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);

  // Post Creation
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [postImage, setPostImage] = useState("");
  const [postVideo, setPostVideo] = useState("");
  const [creatingPostLoading, setCreatingPostLoading] = useState(false);
  const [activeDropdownPostId, setActiveDropdownPostId] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [expandedPostIds, setExpandedPostIds] = useState(new Set());

  // Community Management
  const [showEditCommunityModal, setShowEditCommunityModal] = useState(false);
  const [activeCommunityDropdown, setActiveCommunityDropdown] = useState(false);
  const [communityForm, setCommunityForm] = useState({ name: "", description: "", profileImage: "", bannerImage: "" });
  const [communityLoading, setCommunityLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [commRes, postsRes, allCommRes] = await Promise.all([
        api.get(`/community/get/${communityId}`),
        api.get(`/community/posts/${communityId}`),
        api.get("/community/all"),
      ]);
      setCommunity(commRes.data.community);
      setPosts(postsRes.data.posts || []);
      setCommunities(allCommRes.data.communities || []);

      if (
        user &&
        commRes.data.community.members.some((m) => m._id === user._id)
      ) {
        setIsMember(true);
      }
    } catch (err) {
      console.error("Error fetching community data:", err);
      toast.error("Failed to load community.");
      navigate("/community");
    } finally {
      setLoading(false);
    }
  }, [communityId, user, navigate]);

  useEffect(() => {
    fetchData();

    const handleClickOutside = () => setActiveDropdownPostId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [fetchData]);

  const handleJoin = async () => {
    if (!user) {
      toast.error("Please login to join this community");
      navigate("/login-signup");
      return;
    }
    try {
      setLoading(true);
      await api.post(`/community/join/${communityId}`);
      setIsMember(true);
      toast.success(`Welcome to ${community.name}!`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to join community");
    }
  };

  const handleLeave = async () => {
    try {
      setLoading(true);
      await api.post(`/community/leave/${communityId}`);
      setIsMember(false);
      toast.info(`You've left ${community.name}`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to leave community");
    }
  };


  const handleUpdateCommunity = async (e) => {
    e.preventDefault();
    try {
      setCommunityLoading(true);
      const res = await api.put(`/community/update/${communityId}`, communityForm);
      setCommunity(res.data.community);
      setShowEditCommunityModal(false);
      toast.success("Community updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update community");
    } finally {
      setCommunityLoading(false);
    }
  };

  const handleDeleteCommunity = async () => {
    if (!window.confirm("Are you sure? This will delete ALL posts and messages in this community permanently.")) return;
    try {
      await api.delete(`/community/delete/${communityId}`);
      toast.success("Community deleted permanently");
      navigate("/community");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete community");
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postContent.trim() && !postImage) return;

    try {
      setCreatingPostLoading(true);
      const response = await api.post("/community/post/create", {
        communityId,
        content: postContent,
        image: postImage,
        video: postVideo,
      });
      setPosts([response.data.post, ...posts]);
      setPostContent("");
      setPostImage("");
      setPostVideo("");
      setIsCreatingPost(false);
      toast.success("Shared with the community!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to share post.");
    } finally {
      setCreatingPostLoading(false);
    }
  };

  const toggleComments = (postId) => {
    setExpandedPostIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) newSet.delete(postId);
      else newSet.add(postId);
      return newSet;
    });
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await api.delete(`/community/post/${postId}/delete`);
      setPosts(posts.filter(p => p._id !== postId));
      toast.success("Post deleted");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete post");
    }
  };

  const handleUpdatePost = async (e) => {
    e.preventDefault();
    try {
      setCreatingPostLoading(true);
      const res = await api.put(`/community/post/${editingPost._id}/update`, {
        content: postContent,
        image: postImage,
        video: postVideo
      });
      setPosts(posts.map(p => p._id === editingPost._id ? { ...p, ...res.data.post } : p));
      setEditingPost(null);
      setIsCreatingPost(false);
      setPostContent("");
      setPostImage("");
      setPostVideo("");
      toast.success("Post updated!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update post");
    } finally {
      setCreatingPostLoading(false);
    }
  };

  const handleLikePost = async (postId) => {
    if (!user) {
      toast.error("Please login to like posts");
      return;
    }
    try {
      const res = await api.post(`/community/post/${postId}/like`);
      setPosts(posts.map(p => p._id === postId ? { ...p, likes: res.data.post.likes } : p));
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to like post");
    }
  };

  // Popular communities logic
  const popularCommunities = [...communities]
    .sort((a, b) => (b.members?.length || 0) - (a.members?.length || 0))
    .slice(0, 5);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-brand" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pt-10 pb-20 px-4 md:px-8 lg:px-40 font-sans">
      <div className="container mx-auto max-w-7xl">
        {/* Community Banner */}
        <div className="relative bg-white rounded-3xl mb-8 border border-gray-100">
          <div className="h-48 md:h-64 w-full relative rounded-t-3xl overflow-hidden">
            <img
              src={community?.bannerImage}
              className="w-full h-full object-cover"
              alt="Banner"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
          </div>

          <div className="px-8 pb-8 -mt-12 relative z-10 flex flex-col md:flex-row md:items-end gap-6">
            <div className="w-32 h-32 rounded-4xl border-4 border-white overflow-hidden bg-white">
              <img
                src={community?.profileImage}
                className="w-full h-full object-cover"
                alt="Profile"
              />
            </div>

            <div className="flex-1 pb-2">
              <h1 className="text-4xl md:text-5xl font-display font-blacktext-gray-900 mb-2 drop-shadow-sm">
                v/{community?.name}
              </h1>

              <div className="flex items-center gap-4 text-gray-400 font-bold text-sm">
                <span className="flex items-center gap-1.5">
                  <Users size={16} /> {community?.members?.length} Members
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {!isMember ? (
                <button
                  onClick={handleJoin}
                  className="px-6 py-2 bg-black text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-brand transition-all shadow-lg shadow-black/10"
                >
                  Join Community
                </button>
              ) : (
                <button
                  onClick={handleLeave}
                  className="px-6 py-2 bg-gray-100 text-gray-500 rounded-full text-xs font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-600 transition-all border border-gray-200"
                >
                  Leave
                </button>
              )}

              {user && community?.creatorId?._id === user._id && (
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveCommunityDropdown(!activeCommunityDropdown);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900"
                  >
                    <Settings size={20} />
                  </button>

                  <AnimatePresence>
                    {activeCommunityDropdown && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 z-100 overflow-hidden"
                      >
                        <button
                          onClick={() => {
                            setCommunityForm({
                              name: community.name,
                              description: community.description,
                              profileImage: community.profileImage,
                              bannerImage: community.bannerImage
                            });
                            setShowEditCommunityModal(true);
                            setActiveCommunityDropdown(false);
                          }}
                          className="w-full flex items-center gap-3 px-6 py-4 text-xs font-black text-gray-700 hover:bg-gray-50 transition-all text-left uppercase tracking-widest"
                        >
                          <Edit size={16} className="text-blue-500" />
                          Edit Community
                        </button>
                        <button
                          onClick={() => {
                            handleDeleteCommunity();
                            setActiveCommunityDropdown(false);
                          }}
                          className="w-full flex items-center gap-3 px-6 py-4 text-xs font-black text-red-600 hover:bg-red-50 transition-all text-left border-t border-gray-50 uppercase tracking-widest"
                        >
                          <Trash size={16} />
                          Delete Community
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Center Content */}
          <div className="flex-1 space-y-8">
            <div className="space-y-8 max-w-3xl">

              {!isMember && !user && (
                <div className="bg-orange-50 rounded-[2.5rem] p-8 text-center border border-orange-100 mb-8">
                  <p className="text-orange-900 font-bold mb-4">
                    You are viewing this community as a guest.
                  </p>
                  <Link
                    to="/login-signup"
                    className="text-brand font-black uppercase tracking-widest text-xs hover:underline"
                  >
                    Login to join the conversation
                  </Link>
                </div>
              )}

              {/* Posts List */}
              <AnimatePresence>
                {posts.length > 0 ? (
                  posts.map((post, index) => (
                    <motion.div
                      key={post._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <PostCard
                        post={post}
                        currentUser={user}
                        onLike={handleLikePost}
                        onComment={toggleComments}
                        onEdit={(p) => {
                          setEditingPost(p);
                          setPostContent(p.content);
                          setPostImage(p.image);
                          setPostVideo(p.video || "");
                          setIsCreatingPost(true);
                        }}
                        onDelete={handleDeletePost}
                        activeDropdownPostId={activeDropdownPostId}
                        setActiveDropdownPostId={setActiveDropdownPostId}
                      />

                      <AnimatePresence>
                        {expandedPostIds.has(post._id) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <CommentSection postId={post._id} communityName={post.communityIds?.[0]?.name} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))
                ) : (
                  <div className="py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
                    <p className="text-gray-400 font-bold">
                      No posts in this community yet.
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-full lg:w-80 space-y-8">
            {/* Community Stats */}
            <div className="bg-white rounded-3xl p-4 border border-gray-100 ">
              <h3 className="text-xl font-display font-black text-gray-900 mb-6">
                About Community
              </h3>
              <p className="text-gray-500 font-medium mb-6 leading-relaxed">
                {community?.description}
              </p>
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-gray-50">
                  <span className="text-sm font-black text-gray-400 tracking-widest">
                    Members
                  </span>
                  <span className="text-sm font-black text-gray-900">
                    {community?.members?.length}
                  </span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-gray-50">
                  <span className="text-sm font-black text-gray-400 tracking-widest">
                    Founded
                  </span>
                  <span className="text-sm font-black text-gray-900">
                    {new Date(community?.createdAt).getFullYear()}
                  </span>
                </div>
              </div>
            </div>

            {/* Popular Communities */}
            <div className="bg-white rounded-3xl p-4 border border-gray-100 sticky top-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-brand">
                  <TrendingUp size={20} />
                </div>
                <h3 className="text-xl font-display font-black text-gray-900">
                  Popular Communities
                </h3>
              </div>

              <div className="space-y-6">
                {popularCommunities.map((comm) => (
                  <Link
                    key={comm._id}
                    to={`/community/${comm._id}`}
                    className="flex items-center gap-4 group"
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-50 shrink-0">
                      <img
                        src={comm.profileImage}
                        className="w-full h-full object-cover transition-transform"
                        alt={comm.name}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-gray-900 truncate group-hover:text-brand transition-colors">
                        v/{comm.name}
                      </p>
                      <p className="text-[10px] text-gray-400 font-bold tracking-widest">
                        {comm.members?.length || 0} members
                      </p>
                    </div>
                    <ChevronRight
                      size={16}
                      className="text-gray-300 group-hover:text-brand transition-all group-hover:translate-x-1"
                    />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Create Post Modal */}
        <AnimatePresence>
          {isCreatingPost && (
            <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                onClick={() => setIsCreatingPost(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-lg bg-white rounded-[3rem] p-10 shadow-2xl"
              >
                <div className="flex items-center justify-between mb-10">
                  <h2 className="text-3xl font-display font-black text-gray-900">
                    {editingPost ? "Edit Post" : "Share Something"}
                  </h2>
                  <button
                    onClick={() => {
                      setIsCreatingPost(false);
                      setEditingPost(null);
                      setPostContent("");
                      setPostImage("");
                      setPostVideo("");
                    }}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={24} className="text-gray-400" />
                  </button>
                </div>
                <form onSubmit={editingPost ? handleUpdatePost : handleCreatePost} className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                      Post Community
                    </label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-2xl border-2 border-brand w-fit">
                      <img src={community?.profileImage} className="w-6 h-6 rounded-lg object-cover" />
                      <span className="text-xs font-black">v/{community?.name}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                      Message Content
                    </label>
                    <textarea
                      placeholder="What's on your mind?"
                      className="w-full bg-gray-50 rounded-3xl p-8 min-h-50 font-bold text-gray-900 outline-none border-2 border-transparent focus:border-brand focus:bg-white transition-all text-lg shadow-inner"
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                      Visual Asset (URL)
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative">
                        <ImageIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="url"
                          placeholder="Image URL..."
                          className="w-full bg-gray-50 rounded-2xl py-4 pl-14 pr-4 text-gray-900 font-bold focus:border-brand outline-none transition-all shadow-inner text-xs"
                          value={postImage}
                          onChange={(e) => setPostImage(e.target.value)}
                        />
                      </div>
                      <div className="relative">
                        <Video className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="url"
                          placeholder="Video URL..."
                          className="w-full bg-gray-50 rounded-2xl py-4 pl-14 pr-4 text-gray-900 font-bold focus:border-brand outline-none transition-all shadow-inner text-xs"
                          value={postVideo}
                          onChange={(e) => setPostVideo(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={creatingPostLoading || !postContent.trim()}
                    className="w-full py-5 bg-black text-white rounded-3xl font-black text-sm uppercase tracking-[0.2em] hover:bg-brand transition-all shadow-2xl shadow-black/10 disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {creatingPostLoading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      editingPost ? "Update Post" : "Broadcast Post"
                    )}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Edit Community Modal */}
        <AnimatePresence>
          {showEditCommunityModal && (
            <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
                onClick={() => setShowEditCommunityModal(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden p-4"
              >
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-3xl font-display font-black text-gray-900">
                    Edit Community
                  </h2>
                  <button
                    onClick={() => setShowEditCommunityModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={24} className="text-gray-400" />
                  </button>
                </div>

                <form onSubmit={handleUpdateCommunity} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Community Name</label>
                      <input 
                        type="text" 
                        value={communityForm.name} 
                        onChange={(e) => setCommunityForm({...communityForm, name: e.target.value})}
                        className="w-full bg-gray-50 rounded-xl px-6 py-4 font-bold text-gray-900 border-2 border-transparent focus:border-brand outline-none transition-all"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Avatar URL</label>
                      <input 
                        type="url" 
                        value={communityForm.profileImage} 
                        onChange={(e) => setCommunityForm({...communityForm, profileImage: e.target.value})}
                        className="w-full bg-gray-50 rounded-xl px-6 py-4 font-bold text-gray-900 border-2 border-transparent focus:border-brand outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Banner Image URL</label>
                    <input 
                      type="url" 
                      value={communityForm.bannerImage} 
                      onChange={(e) => setCommunityForm({...communityForm, bannerImage: e.target.value})}
                      className="w-full bg-gray-50 rounded-xl px-6 py-4 font-bold text-gray-900 border-2 border-transparent focus:border-brand outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">About the Community</label>
                    <textarea 
                      value={communityForm.description} 
                      onChange={(e) => setCommunityForm({...communityForm, description: e.target.value})}
                      className="w-full bg-gray-50 rounded-xl px-6 py-4 font-bold text-gray-900 border-2 border-transparent focus:border-brand outline-none transition-all h-32 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={communityLoading}
                    className="w-full py-5 bg-black text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-brand transition-all shadow-xl shadow-black/10 disabled:opacity-50"
                  >
                    {communityLoading ? <Loader2 className="animate-spin mx-auto" size={20} /> : "Save Changes"}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CommunityDetail;
