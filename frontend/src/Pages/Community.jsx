import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import {
  Plus,
  TrendingUp,
  Search,
  Globe,
  Loader2,
  X,
  Image as ImageIcon,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../Context/AuthContext";
import { toast } from "react-toastify";
import CommentSection from "../Components/CommentSection";
import PostCard from "../Components/PostCard";

const Community = () => {
  const [posts, setPosts] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Create Community Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    profileImage: "",
    bannerImage: "",
  });

  // Post Form State
  const [postForm, setPostForm] = useState({
    content: "",
    image: "",
    communityIds: [],
  });

  const [createLoading, setCreateLoading] = useState(false);
  const [expandedPostIds, setExpandedPostIds] = useState(new Set());
  const [activeDropdownPostId, setActiveDropdownPostId] = useState(null);
  const [editingPost, setEditingPost] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsRes, communitiesRes] = await Promise.all([
          api.get("/community/posts/all"),
          api.get("/community/all"),
        ]);
        setPosts(postsRes.data.posts || []);
        setCommunities(communitiesRes.data.communities || []);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const handleClickOutside = () => setActiveDropdownPostId(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);



  const handleCreateCommunity = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate("/login-signup");
      return;
    }

    try {
      setCreateLoading(true);
      const response = await api.post("/community/create", formData);
      setCommunities([response.data.community, ...communities]);
      setShowCreateModal(false);
      setFormData({
        name: "",
        description: "",
        profileImage: "",
        bannerImage: "",
      });
      toast.success("Community created successfully!");
      navigate(`/community/${response.data.community._id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create community");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (postForm.communityIds.length === 0) {
      toast.error("Please select at least one community");
      return;
    }
    try {
      setCreateLoading(true);
      const res = await api.post(`/community/post/create`, {
        communityId: postForm.communityIds,
        content: postForm.content,
        image: postForm.image,
      });

      const newPosts = Array.isArray(res.data.post)
        ? res.data.post
        : [res.data.post];

      // Need to add commentCount: 0 to each new post for the UI
      const formattedPosts = newPosts.map((p) => ({ ...p, commentCount: 0 }));

      setPosts([...formattedPosts, ...posts]);
      setShowPostModal(false);
      setPostForm({ content: "", image: "", communityIds: [] });
      toast.success(
        `Posted to ${postForm.communityIds.length} communities!`,
      );
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to Community post");
    } finally {
      setCreateLoading(false);
    }
  };

  const toggleCommunitySelection = (id) => {
    setPostForm((prev) => {
      const isSelected = prev.communityIds.includes(id);
      return {
        ...prev,
        communityIds: isSelected
          ? prev.communityIds.filter((cid) => cid !== id)
          : [...prev.communityIds, id],
      };
    });
  };

  const handleLikePost = async (postId) => {
    if (!user) {
      toast.error("Please login to like posts");
      return;
    }
    try {
      const res = await api.post(`/community/post/${postId}/like`);
      setPosts(
        posts.map((p) =>
          p._id === postId ? { ...p, likes: res.data.post.likes } : p,
        ),
      );
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to like post");
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
      setPosts(posts.filter((p) => p._id !== postId));
      toast.success("Post deleted");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete post");
    }
  };

  const handleUpdatePost = async (e) => {
    e.preventDefault();
    try {
      setCreateLoading(true);
      const res = await api.put(`/community/post/${editingPost._id}/update`, {
        content: postForm.content,
        image: postForm.image,
      });
      setPosts(
        posts.map((p) =>
          p._id === editingPost._id ? { ...p, ...res.data.post } : p,
        ),
      );
      setEditingPost(null);
      setPostForm({ content: "", image: "" });
      toast.success("Post updated!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update post");
    } finally {
      setCreateLoading(false);
    }
  };

  const filteredPosts = posts.filter(
    (post) =>
      post.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.communityIds?.some((c) =>
        c.name?.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
  );

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
    <div className="min-h-screen pb-20 pt-20 md:pt-10 px-4 md:px-8 lg:px-40 font-sans">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-8 max-w-4xl">
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-display font-black text-gray-900 tracking-tight mb-4">
                Community <span className="text-gradient">Feed.</span>
              </h1>
              <p className="text-gray-500 font-medium">
                Explore what's happening across all Velo communities.
              </p>
            </div>

            <div className="relative group">
              <Search
                className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand transition-colors"
                size={20}
              />
              <input
                type="text"
                placeholder="Search posts or communities..."
                className="w-full bg-white border border-gray-100 rounded-2xl py-4 pl-16 pr-6 text-gray-900 font-bold focus:border-brand outline-none transition-all "
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="space-y-6">
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post, index) => (
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
                        setPostForm({ content: p.content, image: p.image });
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
                          <CommentSection
                            postId={post._id}
                            communityName={post.communityIds?.[0]?.name}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))
              ) : (
                <div className="py-20 text-center bg-white rounded-2xl border-2 border-dashed border-gray-100">
                  <Globe size={48} className="mx-auto text-gray-200 mb-4" />
                  <p className="text-gray-400 font-bold">
                    No public posts found.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="w-full lg:w-80 space-y-8">
            {user && (
              <div className="bg-white rounded-2xl p-4 border border-gray-100 space-y-4">
                <h3 className="text-xl font-display font-black text-gray-900 mb-6">
                  Your Space
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setShowPostModal(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 sm:py-2 bg-brand text-white rounded-xl font-black hover:bg-black transition-all shadow-xl shadow-brand/10 text-xs tracking-widest"
                  >
                    Create Post
                  </button>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 sm:py-2 bg-black text-white rounded-xl font-black hover:bg-brand transition-all shadow-xl shadow-black/10 text-xs tracking-widest"
                  >
                    Create Community
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl p-4 border border-gray-100 sticky top-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-brand">
                  <TrendingUp size={20} />
                </div>
                <h3 className="text-xl font-display font-black text-gray-900">
                  Popular Hubs
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
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
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

              <button
                onClick={() => navigate("/movements")}
                className="w-full mt-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest border-t border-gray-50 hover:text-gray-900 transition-colors"
              >
                View All Movements
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {(showPostModal || editingPost) && (
            <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
                onClick={() => {
                  setShowPostModal(false);
                  setEditingPost(null);
                  setPostForm({ content: "", image: "" });
                }}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden p-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-display font-black text-gray-900">
                    {editingPost ? "Edit Post" : "Create Post"}
                  </h2>
                  <button
                    onClick={() => {
                      setShowPostModal(false);
                      setEditingPost(null);
                      setPostForm({ content: "", image: "", communityIds: [] });
                    }}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={24} className="text-gray-400" />
                  </button>
                </div>

                <form
                  onSubmit={editingPost ? handleUpdatePost : handleCreatePost}
                  className="space-y-8"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-gray-400 tracking-wideest ml-1">
                        Select Community ({postForm.communityIds.length})
                      </label>
                      {postForm.communityIds.length > 0 && !editingPost && (
                        <button
                          type="button"
                          onClick={() =>
                            setPostForm({ ...postForm, communityIds: [] })
                          }
                          className="text-xs font-black text-brand tracking-wideest hover:underline"
                        >
                          Clear Selection
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-40 overflow-y-auto pr-2 scrollbar-hide">
                      {editingPost ? (
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-2xl border-2 border-brand col-span-full">
                          <img
                            src={editingPost.communityIds?.[0]?.profileImage}
                            className="w-6 h-6 rounded-lg object-cover"
                          />
                          <span className="text-xs font-black text-gray-900">
                            v/
                            {editingPost.communityIds
                              ?.map((c) => c.name)
                              .join(" / ")}
                          </span>
                        </div>
                      ) : (
                        communities.map((comm) => (
                          <button
                            key={comm._id}
                            type="button"
                            onClick={() => toggleCommunitySelection(comm._id)}
                            className={`flex items-center gap-2 p-3 rounded-2xl border-2 transition-all text-left group ${
                              postForm.communityIds.includes(comm._id)
                                ? "border-brand bg-orange-50 shadow-sm"
                                : "border-gray-50 bg-gray-50/50 hover:bg-gray-100"
                            }`}
                          >
                            <img
                              src={comm.profileImage}
                              className="w-6 h-6 rounded-lg object-cover"
                              alt={comm.name}
                            />
                            <div className="flex-1 min-w-0">
                              <span className="text-[10px] font-black truncate block">
                                v/{comm.name}
                              </span>
                              <span className="text-[8px] text-gray-400 font-bold uppercase tracking-tighter">
                                {comm.members?.length} Members
                              </span>
                            </div>
                            {postForm.communityIds.includes(comm._id) && (
                              <div className="w-4 h-4 bg-brand rounded-full flex items-center justify-center">
                                <Plus
                                  size={10}
                                  className="text-white rotate-45"
                                />
                              </div>
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-black text-gray-400 tracking-widest ml-1">
                      Description
                    </label>
                    <textarea
                      placeholder="What's on your mind?"
                      className="w-full bg-gray-50 rounded-xl p-4 min-h-30 font-bold text-gray-900 outline-none border-2 border-transparent focus:border-brand focus:bg-white transition-all text-lg shadow-inner"
                      value={postForm.content}
                      onChange={(e) =>
                        setPostForm({ ...postForm, content: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-black text-gray-400 tracking-widest ml-1">
                      URL
                    </label>
                    <div className="relative">
                      <ImageIcon
                        className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400"
                        size={20}
                      />
                      <input
                        type="url"
                        placeholder="Paste URL here..."
                        className="w-full bg-gray-50 rounded-xl py-4 pl-16 pr-6 text-gray-900 font-bold focus:border-brand outline-none transition-all shadow-inner text-sm"
                        value={postForm.image}
                        onChange={(e) =>
                          setPostForm({ ...postForm, image: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={
                      createLoading ||
                      !postForm.content.trim() ||
                      (!editingPost && postForm.communityIds.length === 0)
                    }
                    className="w-full py-4 bg-black text-white rounded-xl font-black text-sm uppercase tracking-[0.2em] hover:bg-brand transition-all shadow-2xl shadow-black/10 disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {createLoading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : editingPost ? (
                      "Update Post"
                    ) : (
                      `Post to ${postForm.communityIds.length} Community`
                    )}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showCreateModal && (
            <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                onClick={() => setShowCreateModal(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-2xl bg-white rounded-2xl p-8 shadow-2xl overflow-hidden"
              >
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h2 className="text-3xl font-display font-black text-gray-900">
                      Build Your Community
                    </h2>
                    <p className="text-gray-500 font-medium">
                      Create a space for people with shared interests.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="p-3 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleCreateCommunity} className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 tracking-widest px-2">
                        Community Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Hiking Enthusiasts"
                        className="w-full bg-gray-50 rounded-xl p-4 font-bold text-gray-900 border-2 border-transparent focus:border-brand focus:bg-white outline-none transition-all"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 tracking-widest px-2">
                        Description
                      </label>
                      <input
                        type="text"
                        placeholder="What is this community about?"
                        className="w-full bg-gray-50 rounded-xl p-4 font-bold text-gray-900 border-2 border-transparent focus:border-brand focus:bg-white outline-none transition-all"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 tracking-widest px-2">
                        Icon URL
                      </label>
                      <div className="relative">
                        <ImageIcon
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                          size={18}
                        />
                        <input
                          type="text"
                          placeholder="Paste image URL..."
                          className="w-full bg-gray-50 rounded-xl py-4 pl-12 pr-5 font-bold text-gray-900 border-2 border-transparent focus:border-brand focus:bg-white outline-none transition-all"
                          value={formData.profileImage}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              profileImage: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 tracking-widest px-2">
                        Banner URL
                      </label>
                      <div className="relative">
                        <ImageIcon
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                          size={18}
                        />
                        <input
                          type="text"
                          placeholder="Paste image URL..."
                          className="w-full bg-gray-50 rounded-xl py-4 pl-12 pr-5 font-bold text-gray-900 border-2 border-transparent focus:border-brand focus:bg-white outline-none transition-all"
                          value={formData.bannerImage}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              bannerImage: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={createLoading}
                    className="w-full bg-black text-white py-4 rounded-xl font-black text-lg shadow-2xl shadow-black/20 flex items-center justify-center gap-3 hover:bg-brand transition-all disabled:opacity-50"
                  >
                    {createLoading ? (
                      <Loader2 className="animate-spin" size={24} />
                    ) : (
                      <Plus size={24} />
                    )}
                    Launch Community
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

export default Community;
