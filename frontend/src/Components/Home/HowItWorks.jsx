import { motion } from "framer-motion";
import { UserPlus, Search, PlaneTakeoff, ArrowRight } from "lucide-react";
import TiltedCard from "../ui/TiltedCard";

const HowItWorks = () => {
  const steps = [
    {
      icon: <UserPlus className="w-6 h-6" />,
      title: "Create your Movement",
      desc: "Post your trip details — where you're going, when, and what kind of vibe you're looking for.",
      img: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=800",
      color: "text-orange-600",
      bg: "bg-orange-100"
    },
    {
      icon: <Search className="w-6 h-6" />,
      title: "Get Matched",
      desc: "Our community finds travelers heading your way. Review profiles and find your perfect travel crew.",
      img: "https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&q=80&w=800",
      color: "text-amber-600",
      bg: "bg-amber-100"
    },
    {
      icon: <PlaneTakeoff className="w-6 h-6" />,
      title: "Travel Together",
      desc: "Connect, coordinate your plans, and share the journey. Your next adventure starts with a sync.",
      img: "https://images.unsplash.com/photo-1539635278303-d4002c07eae3?auto=format&fit=crop&q=80&w=800",
      color: "text-brand",
      bg: "bg-orange-100"
    }
  ];

  return (
    <section className="py-24 bg-orange-50/20">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="inline-block text-brand text-sm font-bold mb-4 bg-brand/5 px-4 py-1.5 rounded-full">
            Simple as 1-2-3
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-extrabold text-gray-900 leading-tight tracking-tight mb-5">
            How Velo works
          </h2>
          <p className="text-gray-500 text-lg leading-relaxed font-medium">
            Join the community, find your sync, and never travel alone again.
          </p>
        </div>

        <div className="space-y-24">
          {steps.map((step, i) => (
            <div 
              key={i} 
              className={`flex flex-col ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-12 md:gap-20`}
            >
              <div className="flex-1 w-full">
                <TiltedCard
                  imageSrc={step.img}
                  altText={step.title}
                  captionText={step.title}
                  containerHeight="400px"
                  imageHeight="400px"
                  imageWidth="100%"
                  rotateAmplitude={10}
                  scaleOnHover={1.05}
                />
              </div>

              <div className="flex-1 text-left">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-display font-black text-lg`}>
                    {i + 1}
                  </div>
                  <div className="h-px flex-1 bg-gray-200" />
                </div>
                
                <div className={`w-14 h-14 ${step.bg} ${step.color} rounded-2xl flex items-center justify-center mb-6 shadow-sm`}>
                  {step.icon}
                </div>
                
                <h3 className="text-3xl font-display font-extrabold text-gray-900 mb-4 tracking-tight">
                  {step.title}
                </h3>
                <p className="text-gray-500 text-lg leading-relaxed mb-8 font-medium">
                  {step.desc}
                </p>
                
                <button className="flex items-center gap-2 text-brand font-bold hover:gap-4 transition-all duration-300">
                  Learn more about this step <ArrowRight size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
