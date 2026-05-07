import MovementCard from "./MovementCard";
import { motion } from "framer-motion";

const MovementsFeed = ({ movements = [], loading = false, onEdit, onDelete, onJoin, requestingId }) => {
  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 py-12">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="h-100 bg-gray-50 animate-pulse rounded-3xl border border-gray-100"
          />
        ))}
      </div>
    );
  }

  if (movements.length === 0) {
    return (
      <div className="py-20 text-center glass rounded-3xl border-dashed border-2 border-gray-200">
        <h3 className="text-2xl font-display font-black text-gray-900 mb-2">
          No movements found
        </h3>
        <p className="text-gray-500 max-w-sm mx-auto">
          No active movements found in this section. Start a journey or explore others!
        </p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 py-12">
      {movements.map((movement, index) => (
        <motion.div
          key={movement._id || index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
        >
          <MovementCard 
            movement={movement} 
            onEdit={onEdit} 
            onDelete={onDelete}
            onJoin={onJoin}
            requestingId={requestingId}
          />
        </motion.div>
      ))}
    </div>
  );
};


export default MovementsFeed;
