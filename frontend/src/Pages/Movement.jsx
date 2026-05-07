import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import MovementsFeed from "../Components/ui/MovementsFeed";
import CreateMovementModal from "../Components/ui/CreateMovementModal";

import { Plus, Search, Filter, Compass, Route } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../Context/AuthContext";
import { toast } from "react-toastify";

const Movement = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [view, setView] = useState("explore"); // 'explore' or 'mine'
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState(null);
  const [requestingId, setRequestingId] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleEdit = (movement) => {
    setSelectedMovement(movement);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMovement(null);
  };

  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleDelete = async (movementId) => {
    if (!window.confirm("Are you sure you want to delete this movement?"))
      return;

    try {
      await api.delete(`/movement/delete/${movementId}`);
      toast.success("Movement deleted successfully!");
      triggerRefresh();
    } catch (err) {
      console.error("Error deleting movement:", err);
      toast.error(err.response?.data?.error || "Failed to delete movement");
    }
  };

  useEffect(() => {
    const fetchMovements = async () => {
      try {
        setLoading(true);
        const endpoint = view === "mine" ? "/movement/all" : "/movement/global";
        const response = await api.get(endpoint);
        setMovements(
          view === "mine" ? response.data.mov || [] : response.data.movs || [],
        );
      } catch (err) {
        console.error("Error fetching movements:", err);
        if (err.response?.status === 401 && view === "mine") {
          navigate("/login-signup");
          return;
        }
        toast.error(`Failed to load ${view} movements.`);
      } finally {
        setLoading(false);
      }
    };

    fetchMovements();
  }, [view, navigate, refreshTrigger]);

  const handleJoinRequest = async (movementId, receiverId) => {
    if (!user) {
      navigate("/login-signup");
      return;
    }
    try {
      setRequestingId(movementId);
      await api.post("/connection/request", { movementId, receiverId });
      toast.success("Sync request sent! Wait for traveler approval.");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to send request");
    } finally {
      setRequestingId(null);
    }
  };

  const filteredMovements = movements.filter((mov) => {
    const destName = mov.destination?.name?.toLowerCase() || "";
    const tags = mov.vibeTags?.map((t) => t.toLowerCase()) || [];
    const query = searchQuery.toLowerCase();
    return destName.includes(query) || tags.some((tag) => tag.includes(query));
  });

  return (
    <div className="min-h-screen bg-white pt-20 md:pt-12 pb-20 px-4 md:px-10 font-sans">
      <div className="container mx-auto max-w-7xl">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-6 md:mb-12">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-display font-black text-gray-900 tracking-tight leading-none mb-6">
              {view === "mine" ? (
                <>
                  Your active <span className="text-gradient">movements.</span>
                </>
              ) : (
                <>
                  Discover{" "}
                  <span className="text-gradient">Movements.</span>
                </>
              )}
            </h1>
            <p className="text-sm md:text-lg text-gray-500 font-medium leading-relaxed">
              {view === "mine"
                ? "Track your upcoming trips, coordinate with buddies, and manage your travel schedule in one place."
                : "Explore active movements, Connect with travelers heading your way and start your journey."}
            </p>
          </div>

          <div className="flex flex-row items-center justify-between gap-2">
            <div className="bg-gray-100 p-1 rounded-2xl flex items-center relative">
              <button
                onClick={() => setView("explore")}
                className={`relative z-10 flex items-center gap-2 px-4 sm:px-6 py-3 rounded-xl text-sm font-black transition-colors ${
                  view === "explore"
                    ? "text-gray-900"
                    : "text-gray-400 hover:text-gray-500"
                }`}
              >
                <Compass size={18} />
                Explore
                {view === "explore" && (
                  <motion.div
                    layoutId="toggle-bg"
                    className="absolute inset-0 bg-white rounded-xl shadow-md -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
              <button
                onClick={() => {
                  if (!user) {
                    navigate("/login-signup");
                    return;
                  }
                  setView("mine");
                }}
                className={`relative z-10 flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black transition-colors ${
                  view === "mine"
                    ? "text-gray-900"
                    : "text-gray-400 hover:text-gray-500"
                }`}
              >
                <Route size={18} />
                Mine
                {view === "mine" && (
                  <motion.div
                    layoutId="toggle-bg"
                    className="absolute inset-0 bg-white rounded-xl shadow-md -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            </div>

            <button
              onClick={() => {
                if (!user) {
                  navigate("/login-signup");
                  return;
                }
                setSelectedMovement(null);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 md:px-8 py-3.5 bg-black text-white rounded-2xl font-black hover:bg-brand transition-all active:scale-95 shadow-xl shadow-black/10"
            >
              <Plus size={20} />
              <span className="hidden md:block">Movement</span>
            </button>
          </div>
        </div>

        {/* Search Bar (Only for Explore or always visible?) */}
        <div className="flex flex-row gap-4">
          <div className="relative flex-1 group">
            <Search
              className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand transition-colors"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by destination or vibes..."
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-14 pr-6 text-gray-900 font-bold focus:border-black focus:bg-white outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-4 bg-white border border-gray-100 text-gray-900 rounded-2xl font-black hover:border-black transition-all active:scale-95 shadow-sm">
            <Filter size={18} />
            <span className="hidden md:block">Filters</span>
          </button>
        </div>

        {/* Main Feed */}
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <MovementsFeed
              movements={filteredMovements}
              loading={loading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onJoin={view === "explore" ? handleJoinRequest : null}
              requestingId={requestingId}
            />
          </motion.div>
        </AnimatePresence>

        {/* Create Movement Modal */}
        <CreateMovementModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onCreated={triggerRefresh}
          initialData={selectedMovement}
        />
      </div>
    </div>
  );
};

export default Movement;
