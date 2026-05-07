import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ArrowRight } from "lucide-react";
import MasonryGrid from "../ui/MasonryGrid";
import { AuthContext } from "../../Context/AuthContext";
import { Link } from "react-router-dom";
import { useContext } from "react";

const Hero = () => {
  const { user } = useContext(AuthContext);
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const containerRef = useRef(null);
  const descRef = useRef(null);
  const btnsRef = useRef(null);
  const rightRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(
      titleRef.current,
      { y: 80, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, delay: 0.3 }
    )
      .fromTo(
        descRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        "-=0.6"
      )
      .fromTo(
        btnsRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7 },
        "-=0.5"
      )
      .fromTo(
        rightRef.current,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1 },
        "-=0.8"
      );
  }, []);

const gridImages = [
  { id: 1, url: "https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&q=80&w=600", title: "Bali Sync", location: "Uluwatu, Indonesia" },
  { id: 2, url: "https://images.unsplash.com/photo-1539635278303-d4002c07eae3?auto=format&fit=crop&q=80&w=600", title: "Alpine Hike", location: "Zermatt, Switzerland" },
  { id: 3, url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=600", title: "Mountain Reflection", location: "Lofoten, Norway" },
  { id: 4, url: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=600", title: "Desert Road Trip", location: "Arizona, USA" },
  { id: 5, url: "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&q=80&w=600", title: "Jungle Mist", location: "Bali, Indonesia" },
  { id: 6, url: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&q=80&w=600", title: "Green Valleys", location: "Tyrol, Austria" },
  { id: 7, url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=600", title: "Starry Night", location: "Matterhorn, Switzerland" },
  { id: 8, url: "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&q=80&w=600", title: "Trekking Peaks", location: "Patagonia, Chile" },
];

  return (
    <section
      ref={heroRef}
      className="relative min-h-full md:min-h-screen flex items-center py-24 md:py-10 overflow-hidden bg-white"
    >
      
      {/* Subtle Warm & Orange gradient background */}
      <div className="absolute inset-0 bg-linear-to-br from-orange-50/50 via-white to-orange-50/50 -z-10" />
      <div className="absolute top-0 right-0 w-150 h-150 bg-brand/5 blur-[150px] rounded-full -z-10 animate-pulse-soft" />

      <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-7xl" ref={containerRef}>
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column: Text Content */}
          <div className="text-left">
            {/* Social proof badge */}

            <div ref={titleRef} className="mb-6">
              <h1 className="text-5xl md:text-7xl font-display font-black text-slate-900 tracking-tight leading-[1.1]">
                Find your crew.<br />
                <span className="text-gradient">Share the journey.</span>
              </h1>
            </div>

            <p
              ref={descRef}
              className="text-sm md:text-xl text-slate-500 mb-6 md:mb-10 max-w-lg leading-relaxed font-medium"
            >
              Velo connects travelers heading the same direction. 
              Create a movement, match with fellow explorers, and turn 
              every trip into a shared adventure.
            </p>

            <div ref={btnsRef} className="flex flex-wrap items-center gap-4 mb-10 md:mb-12">
              <Link to={!user ? "/login-signup" : "/movements"}>
              <button className="btn-primary text-base px-8 py-4 cursor-pointer">
                Start a Movement <ArrowRight size={18} />
              </button>
              </Link>
              
              <Link to={ "/movements"}>
              <button className="btn-secondary text-base cursor-pointer">
                Explore Movements <ArrowRight size={18} />
              </button></Link>
            </div>

            {/* Quick stats */}
            <div className="flex items-center gap-8 border-t border-orange-100 pt-10">
              <div>
                <span className="text-2xl md:text-3xl font-display font-black text-stone-900">42k+</span>
                <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mt-1">Shared trips</p>
              </div>
              <div className="w-px h-10 bg-orange-100" />
              <div>
                <span className="text-2xl md:text-3xl font-display font-black text-stone-900">120</span>
                <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mt-1">Countries</p>
              </div>
              <div className="w-px h-10 bg-orange-100" />
              <div>
                <span className="text-2xl md:text-3xl font-display font-black text-stone-900">4.9★</span>
                <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mt-1">Rating</p>
              </div>
            </div>
          </div>

          {/* Right Column: Masonry Grid */}
          <div ref={rightRef} className="hidden lg:block relative">
            <div className="absolute inset-0 bg-brand/5 blur-[100px] rounded-4xl scale-125 -z-10" />
            <MasonryGrid images={gridImages} />
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-brand/5 blur-[100px] rounded-full -z-10" />
    </section>
  );
};

export default Hero;

