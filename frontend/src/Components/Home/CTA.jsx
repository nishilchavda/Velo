import { MoveRight } from "lucide-react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../Context/AuthContext";
import { useContext } from "react";

const CTA = () => {
  const { user } = useContext(AuthContext);
  const avatars = [
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=60",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=60",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=60",
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=60",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=60",
  ];

  return (
    <section className="py-24">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="relative bg-stone-950 rounded-3xl p-12 md:p-20 overflow-hidden text-center shadow-2xl">
          {/* Decorative blobs */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand/30 blur-[100px] rounded-full" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-accent/20 blur-[80px] rounded-full" />

          <div className="relative z-10">
            <div className="flex justify-center mb-8">
              <div className="flex -space-x-3">
                {avatars.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt="Community member"
                    className="w-12 h-12 rounded-full border-3 border-stone-950 object-cover"
                  />
                ))}
                <div className="w-12 h-12 rounded-full border-3 border-stone-950 bg-brand flex items-center justify-center text-white text-xs font-bold">
                  +2k
                </div>
              </div>
            </div>

            <h2 className="text-3xl md:text-5xl font-display font-extrabold text-white leading-tight tracking-tight mb-5 max-w-2xl mx-auto">
              Your next adventure is waiting. <br className="hidden md:block" />
              <span className="text-brand">Don't go alone.</span>
            </h2>

            <p className="text-gray-400 text-lg max-w-lg mx-auto mb-10 leading-relaxed">
              Join thousands of travelers who are already sharing their journeys. 
              It's free to start — and the friendships are priceless.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to={!user ? "/login-signup" : "/create-movement"}>
              <button className="btn-primary text-base px-10 py-4">
                Create Your First Movement <MoveRight size={18} />
              </button>
              </Link>            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
