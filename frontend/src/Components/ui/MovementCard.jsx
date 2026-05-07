import { MapPin, Calendar, Edit2, UserPlus, Loader2 } from "lucide-react";
import SpotlightCard from "./SpotlightCard";
import { useContext } from "react";
import { AuthContext } from "../../Context/AuthContext";
import { Link } from "react-router-dom";

const MovementCard = ({ movement, onEdit, onJoin, requestingId }) => {
  const { user } = useContext(AuthContext);
  const {
    destination,
    startDate,
    endDate,
    vibeTags = [],
    imageUrl,
    status,
    userId,
  } = movement;

  const isOwner = user && movement.userId && (user._id === movement.userId._id || user._id === movement.userId);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <SpotlightCard className="feature-card group overflow-hidden p-0!">
      <div className="flex flex-col h-full">
        {/* Card Image */}
        <div className="relative h-48 w-full overflow-hidden mb-6">
          <img 
            src={imageUrl} 
            alt={destination.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
          <div className="absolute top-4 left-4">
             <div className="flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md text-white rounded-full text-[10px] font-black uppercase tracking-wider">
                <MapPin size={10} />
                {destination.name}
             </div>
          </div>
          <div className={`absolute top-4 right-4 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-tighter ${
              status === "active"
                ? "bg-emerald-500 text-white"
                : "bg-gray-500/50 text-white backdrop-blur-sm"
            }`}>
            {status}
          </div>
        </div>

        <div className="px-6 pb-8 flex flex-col flex-1">
          <h3 className="text-2xl font-display font-black text-gray-900 mb-2 group-hover:text-brand transition-colors duration-300 leading-tight">
            Sync to {destination.name.split(',')[0].trim()}
          </h3>

        <div className="flex items-center gap-3 text-stone-500 mb-6 text-sm font-medium">
          <Calendar size={16} className="text-stone-400" />
          <span>{formatDate(startDate)}</span>
          <div className="h-px w-4 bg-orange-100" />
          <span>{formatDate(endDate)}</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {vibeTags.map((tag, i) => (
            <span
              key={i}
              className="px-2.5 py-1 bg-orange-50 text-stone-600 rounded-lg text-xs font-bold border border-orange-100"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Traveler Info & Actions */}
        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
          <Link
            to={`/user/${userId?._id || userId}`}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="relative">
              <img
                src={userId?.profileImage || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=400&fit=crop"}
                className="w-10 h-10 rounded-xl border-2 border-white shadow-sm object-cover"
                alt={userId?.username}
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
            </div>
            <div>
              <p className="text-xs font-black text-gray-900 leading-none mb-1">
                {userId?.fullname || userId?.username}
              </p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none">
                @{userId?.username || "traveler"}
              </p>
            </div>
          </Link>

          <div className="flex gap-2">
            {isOwner ? (
              <button 
                onClick={() => onEdit(movement)}
                className="flex items-center justify-center w-10 h-10 bg-orange-100 text-stone-900 rounded-xl hover:bg-brand hover:text-white transition-all duration-300"
              >
                <Edit2 size={16} />
              </button>
            ) : (
              onJoin && (
                <button
                  onClick={() => onJoin(movement._id, userId?._id || userId)}
                  disabled={requestingId === movement._id}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-black hover:bg-brand transition-all active:scale-95 shadow-lg shadow-gray-200 disabled:opacity-50"
                >
                  {requestingId === movement._id ? (
                    <Loader2 className="animate-spin" size={14} />
                  ) : (
                    <UserPlus size={14} />
                  )}
                  Join
                </button>
              )
            )}
          </div>
        </div>
        </div>
      </div>
    </SpotlightCard>
  );
};

export default MovementCard;

