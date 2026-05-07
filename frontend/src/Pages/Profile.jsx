import { useState, useContext, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";
import api from "../api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Loader2,
  X,
  ChevronRight,
  Activity,
  Search,
  MapPin,
} from "lucide-react";
import { toast } from "react-toastify";
import PostCard from "../Components/PostCard";
import CommentSection from "../Components/CommentSection";

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, updateUserProfile } = useContext(AuthContext);

  const isOwnProfile = !userId || userId === currentUser?._id;
  const targetId = isOwnProfile ? currentUser?._id : userId;

  const [targetUser, setTargetUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [buddies, setBuddies] = useState([]);
  const [userCommunities, setUserCommunities] = useState([]);
  const [buddyCount, setBuddyCount] = useState(0);
  const [activeTab, setActiveTab] = useState("posts");
  const [activeDropdownPostId, setActiveDropdownPostId] = useState(null);
  const [expandedPostIds, setExpandedPostIds] = useState(new Set());

  // Connection State (for other user profiles)
  const [connectionStatus, setConnectionStatus] = useState("none");
  const [activeRequest, setActiveRequest] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);

  // Self Profile State
  const [showEditModal, setShowEditModal] = useState(false);
  const [showListModal, setShowListModal] = useState(null); // 'buddies', 'expeditions', 'communities'
  const [buddySearch, setBuddySearch] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    fullname: "",
    bio: "",
    hometown: "",
    profileImage: "",
    bannerImage: "",
    vibeTags: "",
    interestTags: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!targetId) return;
      try {
        const [userRes, postsRes, commRes, countRes, buddiesRes] = await Promise.all([
          api.get(`/user/profile/${targetId}`),
          api.get(`/community/posts/user/${targetId}`),
          api.get(
            isOwnProfile
              ? "/community/my-communities"
              : `/community/user-communities/${targetId}`,
          ),
          api.get(`/connection/count/${targetId}`),
          api.get(`/connection/list/${targetId}`),
        ]);

        const profileUser = userRes.data.user;
        setTargetUser(profileUser);
        setPosts(postsRes.data.posts || []);
        setUserCommunities(commRes.data.communities || []);
        setBuddyCount(countRes.data.count || 0);
        setBuddies(buddiesRes.data.buddies || []);

        if (isOwnProfile) {
          // Self Mode
          setFormData({
            username: profileUser.username || "",
            fullname: profileUser.fullname || "",
            bio: profileUser.bio || "",
            hometown: profileUser.hometown || "",
            profileImage: profileUser.profileImage || "",
            bannerImage: profileUser.bannerImage || "",
            vibeTags: profileUser.tags?.vibe?.join(", ") || "",
            interestTags: profileUser.tags?.interests?.join(", ") || "",
          });
        } else if (currentUser) {
          // Other User Mode - Check relationship
          const myConnRes = await api.get("/connection/my");
          const myConnections = myConnRes.data.conn || [];
          const existingConn = myConnections.find(
            (c) => c.senderId._id === userId || c.receiverId._id === userId,
          );

          if (existingConn) {
            setConnectionStatus(existingConn.status);
            setActiveRequest(existingConn);
          } else {
            const pendingRes = await api.get("/connection/pending");
            const incoming = (pendingRes.data.conn || []).find(
              (c) => c.senderId._id === userId,
            );
            if (incoming) {
              setConnectionStatus("pending");
              setActiveRequest(incoming);
            } else {
              setConnectionStatus("none");
              setActiveRequest(null);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching profile data:", err);
        toast.error("Failed to load traveler profile");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [targetId, isOwnProfile, currentUser, userId]);

  const handleLikePost = async (postId) => {
    if (!currentUser) {
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

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const payload = {
        username: formData.username,
        fullname: formData.fullname,
        bio: formData.bio,
        hometown: formData.hometown,
        profileImage: formData.profileImage,
        bannerImage: formData.bannerImage,
        tags: {
          vibe: formData.vibeTags
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s),
          interests: formData.interestTags
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s),
        },
      };

      const response = await api.put("/user/update", payload);
      updateUserProfile(response.data.updateUser);
      toast.success("Profile updated!");
      setShowEditModal(false);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConnect = async () => {
    try {
      setStatusLoading(true);
      await api.post("/connection/request", { receiverId: userId });
      setConnectionStatus("pending");
      toast.success("Sync request sent!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to send request");
    } finally {
      setStatusLoading(false);
    }
  };

  const handleUpdateStatus = async (status) => {
    if (!activeRequest) return;
    try {
      setStatusLoading(true);
      await api.patch("/connection/respond", {
        connectionId: activeRequest._id,
        newStatus: status,
      });
      setConnectionStatus(status);
      if (status === "accepted") setBuddyCount((prev) => prev + 1);
      toast.success(`Request ${status}!`);
    } catch (err) {
      toast.error(err.response?.data?.error || "Action failed");
    } finally {
      setStatusLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-brand" size={40} />
      </div>
    );
  }

  if (!targetUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <h2 className="text-3xl font-display font-black text-gray-900 mb-4">
          Traveler not found
        </h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans py-10">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-12 gap-8 px-4 md:px-8">
          {/* Middle Column (Content Feed) */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {/* Header Card */}
            <div className="p-4 flex flex-col md:flex-row items-center gap-4 relative overflow-hidden bg-white rounded-3xl mb-6">
              <div className="relative shrink-0 z-20 group">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white">
                  <img
                    src={targetUser.profileImage}
                    className="w-full h-full object-cover"
                    alt={targetUser.username}
                  />
                </div>
              </div>

              <div className="flex-1 text-center md:text-left z-10">
                <div className="flex flex-col md:flex-row items-center">
                  <h1 className="text-2xl font-display font-bold">
                    {targetUser.fullname}
                  </h1>
                </div>
                <p className="text-sm font-bold lowercase">{targetUser.username}</p>
              </div>

              <div className="flex gap-3 z-10">
                {isOwnProfile ? (
                  <>
                    <button
                      onClick={() => setShowEditModal(true)}
                      className="px-8 py-3.5 bg-black text-white hover:bg-brand rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95"
                    >
                      Edit Profile
                    </button>
                  </>
                ) : connectionStatus === "accepted" ? (
                  <>
                    <button
                      onClick={() => navigate("/chat")}
                      className="px-8 py-3.5 bg-black text-white hover:bg-brand rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-black/10 active:scale-95"
                    >
                      Message
                    </button>
                  </>
                ) : connectionStatus === "pending" ? (
                  activeRequest?.senderId?._id === userId ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateStatus("accepted")}
                        className="px-8 py-3.5 bg-brand text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-brand/20 active:scale-95 transition-all"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleUpdateStatus("declined")}
                        className="px-8 py-3.5 bg-gray-100 text-gray-500 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
                      >
                        Decline
                      </button>
                    </div>
                  ) : (
                    <button className="px-10 py-3.5 bg-gray-100 text-gray-400 rounded-2xl font-black text-[10px] uppercase tracking-widest cursor-default border border-gray-100">
                      Requested
                    </button>
                  )
                ) : (
                  <button
                    onClick={handleConnect}
                    disabled={statusLoading}
                    className="px-10 py-3.5 bg-black text-white hover:bg-brand rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-black/10 active:scale-95"
                  >
                    {statusLoading ? (
                      <Loader2 className="animate-spin" size={14} />
                    ) : (
                      "Connect"
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Content Feed Section */}
            <div className="space-y-4">
              <div className="flex item-center md:justify-start justify-between gap-4 px-2 z-40 ">
                {[
                  {
                    id: "overview",
                    label: "Overview",
                  },
                  {
                    id: "posts",
                    label: "Posts",
                  },
                  {
                    id: "comments",
                    label: "Comments",
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center justify-center py-2 px-4 text-sm gap-2 rounded-full font-black  ${
                      activeTab === tab.id
                        ? "text-brand bg-black "
                        : "text-black "
                    }`}
                  >
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Feed Items */}
              <AnimatePresence mode="wait">
                {activeTab === "posts" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="grid grid-cols-1 gap-4 "
                  >
                    {posts.length > 0 ? (
                      posts.map((post) => (
                        <div key={post._id} className="space-y-2">
                          <PostCard
                            post={post}
                            currentUser={currentUser}
                            onLike={handleLikePost}
                            onDelete={handleDeletePost}
                            onComment={(id) => {
                              setExpandedPostIds(prev => {
                                const next = new Set(prev);
                                if (next.has(id)) next.delete(id);
                                else next.add(id);
                                return next;
                              });
                            }}
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
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
                        {isOwnProfile ? (
                          <>
                            <Camera
                              size={48}
                              className="mx-auto text-gray-200 mb-6"
                            />
                            <h3 className="text-2xl font-display font-black text-gray-900 mb-2">
                              No expeditions yet
                            </h3>
                            <p className="text-gray-500 font-medium max-w-xs mx-auto italic mb-8">
                              Ready to sync your first travel moment with the
                              Velo community?
                            </p>
                            <Link
                              to="/community"
                              className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-brand transition-all shadow-xl shadow-brand/20"
                            >
                              Create Post
                            </Link>
                          </>
                        ) : (
                          <>
                            <Activity
                              size={48}
                              className="mx-auto text-gray-200 mb-6"
                            />
                            <h3 className="text-2xl font-display font-black text-gray-900 mb-2">
                              No expeditions yet
                            </h3>
                            <p className="text-gray-500 font-medium max-w-xs mx-auto italic">
                              This traveler is still charting their course
                              across the unknown.
                            </p>
                          </>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Column (Info Sidebar) */}
          <div className="hidden lg:block lg:col-span-4 space-y-6">
            <div className="sticky top-4 space-y-6">
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="h-30 relative">
                  <img
                    src={targetUser.bannerImage}
                    alt="User Banner"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 relative">
                  <h3 className="text-2xl font-display font-black text-gray-900 mb-1">
                    {targetUser.fullname || targetUser.username}
                  </h3>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">
                    {isOwnProfile ? "TRAVELLER HUB" : "TRAVELER LOG"}
                  </p>

                  <p className="text-[13px] text-gray-500 font-medium leading-relaxed mb-6 italic">
                    {targetUser.bio ||
                      (isOwnProfile
                        ? "Crafting stories across horizons. Waiting to sync with fellow explorers..."
                        : "This traveler is currently exploring the unknown. Waiting to sync with fellow explorers...")}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div 
                      onClick={() => setShowListModal('buddies')}
                      className="bg-gray-50/80 px-3 py-2 rounded-2xl border border-gray-100/50 cursor-pointer hover:bg-orange-50/50 transition-colors"
                    >
                      <span className="block text-xl font-black text-gray-900 ">
                        {buddyCount}
                      </span>
                      <span className="text-xs font-black">Buddies</span>
                    </div>
                    <div 
                      onClick={() => setShowListModal('expeditions')}
                      className="bg-gray-50/80 px-3 py-2 rounded-2xl border border-gray-100/50 cursor-pointer hover:bg-orange-50/50 transition-colors"
                    >
                      <span className="block text-xl font-black text-gray-900 ">
                        {posts.length}
                      </span>
                      <span className="text-xs font-black">Movements</span>
                    </div>
                    {targetUser.hometown && (
                      <div className="bg-gray-50/80 px-3 py-2 rounded-2xl border border-gray-100/50">
                        <span className="block text-xl font-black text-gray-900 ">
                          <MapPin  className="mt-1"/>
                        </span>
                        <span className="text-xs font-black">
                          {targetUser.hometown}
                        </span>
                      </div>
                    )}
                    <div 
                      onClick={() => setShowListModal('communities')}
                      className="bg-gray-50/80 px-3 py-2 rounded-2xl border border-gray-100/50 cursor-pointer hover:bg-orange-50/50 transition-colors"
                    >
                      {/* mapping user join community icon  */}
                      <div className="flex flex-row items-center">
                        <div className="flex flex-row px-2">
                          {userCommunities?.slice(0, 3).map((community, index) => (
                            <img
                              key={index}
                              src={community.profileImage}
                              alt={community.name}
                              className="-ml-3 w-6 h-6 rounded-full border-2 border-white object-cover"
                            />
                          ))}
                          {userCommunities?.length > 3 && (
                            <div className="-ml-3 w-6 h-6 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[8px] font-black">
                              +{userCommunities.length - 3}
                            </div>
                          )}
                        </div>
                        <span className="block text-xl font-black text-gray-900 ">
                          {userCommunities?.length}
                        </span>
                      </div>

                      <span className="text-xs font-black">Active in</span>
                    </div>
                  </div>

                  <div className="mt-10">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                        Tags/Interests
                      </h4>
                      <div className="w-12 h-px bg-gray-100" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {targetUser.tags?.vibe?.map((tag, i) => (
                        <span
                          key={i}
                          className="px-4 py-1.5 bg-brand text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-brand/20"
                        >
                          {tag}
                        </span>
                      ))}
                      {targetUser.tags?.interests?.map((tag, i) => (
                        <span
                          key={i}
                          className="px-4 py-1.5 bg-gray-900 text-white text-[9px] font-black uppercase tracking-widest rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal (Only Self) */}
      <AnimatePresence>
        {showEditModal && isOwnProfile && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-xl"
              onClick={() => setShowEditModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="text-4xl font-display font-black text-gray-900 mb-2">
                    Edit Profile
                  </h2>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-3 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors border border-gray-100"
                >
                  <X size={24} className="text-gray-400" />
                </button>
              </div>

              <form
                onSubmit={handleUpdate}
                className="space-y-4 h-auto"
              >
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-black text-gray-900 tracking-widest px-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm font-black md:font-black text-gray-900 border-2 border-transparent focus:border-brand focus:bg-white outline-none transition-all lowercase shadow-inner"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-gray-900 tracking-widest px-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.fullname}
                      onChange={(e) =>
                        setFormData({ ...formData, fullname: e.target.value })
                      }
                      className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm font-black md:font-black text-gray-900 border-2 border-transparent focus:border-brand focus:bg-white outline-none transition-all shadow-inner"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-gray-900 tracking-widest px-2">
                      Home
                    </label>
                    <input
                      type="text"
                      value={formData.hometown}
                      onChange={(e) =>
                        setFormData({ ...formData, hometown: e.target.value })
                      }
                      className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm font-black md:font-black text-gray-900 border-2 border-transparent focus:border-brand focus:bg-white outline-none transition-all shadow-inner"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-black text-gray-900 tracking-widest px-2">
                      Avatar URL
                    </label>
                    <input
                      type="url"
                      value={formData.profileImage}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          profileImage: e.target.value,
                        })
                      }
                      className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm font-black md:font-black text-gray-900 border-2 border-transparent focus:border-brand focus:bg-white outline-none transition-all shadow-inner"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-gray-900 tracking-widest px-2">
                      Banner URL
                    </label>
                    <input
                      type="url"
                      value={formData.bannerImage}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bannerImage: e.target.value,
                        })
                      }
                      className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm font-black md:font-black text-gray-900 border-2 border-transparent focus:border-brand focus:bg-white outline-none transition-all shadow-inner"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-gray-900 tracking-widest px-2">
                    Traveler Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm font-black md:font-black text-gray-900 border-2 border-transparent focus:border-brand focus:bg-white outline-none transition-all h-26 resize-none shadow-inner"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-black text-gray-900 tracking-widest px-2">
                      Vibe Core
                    </label>
                    <input
                      type="text"
                      placeholder="Adventurous, Calm..."
                      value={formData.vibeTags}
                      onChange={(e) =>
                        setFormData({ ...formData, vibeTags: e.target.value })
                      }
                      className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm font-black md:font-black text-gray-900 border-2 border-transparent focus:border-brand focus:bg-white outline-none transition-all shadow-inner"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-gray-900 tracking-widest px-2">
                      Interests
                    </label>
                    <input
                      type="text"
                      placeholder="Photography, Hiking..."
                      value={formData.interestTags}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          interestTags: e.target.value,
                        })
                      }
                      className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm font-black md:font-black text-gray-900 border-2 border-transparent focus:border-brand focus:bg-white outline-none transition-all shadow-inner"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isUpdating}
                  className="w-full py-5 bg-stone-900 text-white rounded-xl font-black text-xs tracking-[0.2rem] hover:bg-brand transition-all shadow-2xl shadow-brand/20 disabled:opacity-50 mt-6 active:scale-[0.98]"
                >
                  {isUpdating ? (
                    <Loader2 className="animate-spin mx-auto" size={20} />
                  ) : (
                    "Update Profile"
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* List Modal (Buddies, Expeditions, Communities) */}
      <AnimatePresence>
        {showListModal && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-xl"
              onClick={() => setShowListModal(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col h-162.5 p-2"
            >
              <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-display font-black text-gray-900 capitalize">
                    {showListModal === 'communities' ? 'Active In' : showListModal}.
                  </h2>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    {showListModal === 'buddies' && "Synchronized Network"}
                    {showListModal === 'expeditions' && "Travel Chronicles"}
                    {showListModal === 'communities' && "Joined Hubs"}
                  </p>
                </div>
                <button
                  onClick={() => setShowListModal(null)}
                  className="p-3 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              {showListModal === 'buddies' && (
                <div className="p-4">
                  <div className="relative group">
                    <Search
                      className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-brand transition-colors"
                      size={18}
                    />
                    <input
                      type="text"
                      placeholder="Search network..."
                      value={buddySearch}
                      onChange={(e) => setBuddySearch(e.target.value)}
                      className="w-full bg-gray-50 rounded-2xl px-12 py-4 text-sm font-black text-gray-900 border-2 border-transparent focus:border-brand focus:bg-white outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-y-auto px-4 pb-8 custom-scrollbar">
                <div className="space-y-3">
                  {showListModal === 'buddies' && buddies.map((conn) => {
                    const buddy = conn.senderId?._id === targetId ? conn.receiverId : conn.senderId;
                    if (buddySearch && !buddy?.username?.toLowerCase().includes(buddySearch.toLowerCase()) && !buddy?.fullname?.toLowerCase().includes(buddySearch.toLowerCase())) return null;
                    return (
                      <Link
                        key={conn._id}
                        to={`/user/${buddy?._id}`}
                        onClick={() => setShowListModal(null)}
                        className="flex items-center gap-5 p-2 hover:bg-brand/5 rounded-3xl transition-all group border border-transparent hover:border-brand/10"
                      >
                        <div className="relative">
                          <img src={buddy?.profileImage} className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md" alt={buddy?.username} />
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full shadow-sm" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black text-gray-900 truncate group-hover:text-brand transition-colors tracking-tight">{buddy?.username}</p>
                          <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em] mt-1">{buddy?.fullname || "Traveler"}</p>
                        </div>
                        <ChevronRight size={18} className="text-gray-200 group-hover:text-brand group-hover:translate-x-1 transition-all" />
                      </Link>
                    );
                  })}

                  {showListModal === 'expeditions' && posts.map((post) => (
                    <div key={post._id} className="p-4 bg-gray-50/50 rounded-3xl border border-gray-100 hover:border-brand/20 transition-all group">
                      <div className="flex gap-4">
                        {post.image && (
                          <img src={post.image} className="w-20 h-20 rounded-2xl object-cover shadow-sm" alt="Post" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 line-clamp-2 mb-2">{post.content}</p>
                          <div className="flex items-center gap-2">
                             <span className="text-[9px] font-black text-brand uppercase tracking-widest bg-brand/5 px-2 py-1 rounded-lg">
                                {post.communityIds?.[0]?.name}
                             </span>
                             <span className="text-[9px] font-black text-gray-400 uppercase">
                                {post.likes?.length || 0} Likes
                             </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {showListModal === 'communities' && userCommunities.map((comm) => (
                    <Link
                      key={comm._id}
                      to={`/community/${comm._id}`}
                      onClick={() => setShowListModal(null)}
                      className="flex items-center gap-5 p-2 hover:bg-brand/5 rounded-2xl transition-all group border border-transparent hover:border-brand/10"
                    >
                      <img src={comm.profileImage} className="w-14 h-14 rounded-xl object-cover border-2 border-white shadow-md" alt={comm.name} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-gray-900 truncate group-hover:text-brand transition-colors tracking-tight">v/{comm.name}</p>
                        <p className="text-[10px] text-gray-400 font-black tracking-widest mt-1 truncate">{comm.description}</p>
                      </div>
                      <ChevronRight size={18} className="text-gray-200 group-hover:text-brand group-hover:translate-x-1 transition-all" />
                    </Link>
                  ))}

                  {((showListModal === 'buddies' && buddies.length === 0) || 
                    (showListModal === 'expeditions' && posts.length === 0) || 
                    (showListModal === 'communities' && userCommunities.length === 0)) && (
                    <div className="py-20 text-center">
                      <p className="text-gray-400 font-black text-xs uppercase tracking-widest">No records found</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
