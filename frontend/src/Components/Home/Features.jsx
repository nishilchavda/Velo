import { Users, Route, MessageSquare, Shield, Globe, Zap } from "lucide-react";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SpotlightCard from "../ui/SpotlightCard";
import TrueFocus from "../ui/TrueFocus";

gsap.registerPlugin(ScrollTrigger);

const Features = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".feature-card", 
        { y: 60, opacity: 0 },
        {
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 85%",
          },
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: "power4.out"
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const features = [
    {
      icon: <Users size={24} />,
      title: "People-first matching",
      desc: "We match you with travelers based on personality, vibe tags, and travel style — not just destination.",
      iconBg: "bg-orange-100 text-brand",
    },
    {
      icon: <Route size={24} />,
      title: "Create movements",
      desc: "Going somewhere? Create a movement and let others join. It's like starting a group trip, open to the world.",
      iconBg: "bg-orange-100 text-brand",
    },
    {
      icon: <MessageSquare size={24} />,
      title: "Chat & coordinate",
      desc: "Built-in group chat for every movement. Plan stops, split costs, share moments — all in one thread.",
      iconBg: "bg-accent/20 text-brand",
    },
    {
      icon: <Zap size={24} />,
      title: "Real-time sync",
      desc: "See who's near you, who's heading your way, and get instant notifications when trips align.",
      iconBg: "bg-amber-100 text-brand",
    },
    {
      icon: <Shield size={24} />,
      title: "Verified profiles",
      desc: "Every Velo member is verified. Travel with confidence knowing your co-travelers are real people.",
      iconBg: "bg-orange-100 text-brand",
    },
    {
      icon: <Globe size={24} />,
      title: "Global community",
      desc: "From weekend road trips to cross-continent backpacking — our community spans 120+ countries.",
      iconBg: "bg-orange-100 text-brand",
    },
  ];

  return (
    <section ref={sectionRef} className="py-24 relative overflow-hidden bg-white">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="inline-block text-accent text-sm font-bold mb-4 bg-accent/5 px-4 py-1.5 rounded-full">
            Why travelers love Velo
          </span>
          <TrueFocus 
            sentence="Everything you need to travel together"
            manualMode={false}
            blurAmount={3}
            borderColor="#ea580c"
            glowColor="rgba(234, 88, 12, 0.1)"
            animationDuration={0.6}
            pauseBetweenAnimations={1}
            className="text-3xl md:text-5xl font-display font-extrabold text-gray-900 leading-tight tracking-tight mb-5"
          />
          <p className="text-gray-500 text-lg leading-relaxed mt-6">
            Velo is a social platform designed from the ground up to help 
            travelers connect, create shared journeys, and build lasting friendships on the road.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <SpotlightCard
              key={index}
              className="feature-card group"
            >
              <>
                <div className={`w-14 h-14 rounded-2xl ${feature.iconBg} flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-500`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-display font-extrabold text-gray-900 mb-3 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-gray-500 leading-relaxed text-sm font-medium">
                  {feature.desc}
                </p>
              </>
            </SpotlightCard>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
