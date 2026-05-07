import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const TrueFocus = ({
  sentence = 'True Focus',
  separator = ' ',
  manualMode = false,
  blurAmount = 5,
  borderColor = '#ff5a1f',
  glowColor = 'rgba(255, 90, 31, 0.3)',
  animationDuration = 0.5,
  pauseBetweenAnimations = 1,
  className = ""
}) => {
  const words = sentence.split(separator);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastActiveIndex, setLastActiveIndex] = useState(null);
  const containerRef = useRef(null);
  const wordRefs = useRef([]);
  const [focusRect, setFocusRect] = useState({ x: 0, y: 0, width: 0, height: 0 });

  useEffect(() => {
    if (!manualMode) {
      const interval = setInterval(
        () => {
          setCurrentIndex(prev => (prev + 1) % words.length);
        },
        (animationDuration + pauseBetweenAnimations) * 1000
      );

      return () => clearInterval(interval);
    }
  }, [manualMode, animationDuration, pauseBetweenAnimations, words.length]);

  useEffect(() => {
    if (currentIndex === null || currentIndex === -1) return;

    if (!wordRefs.current[currentIndex] || !containerRef.current) return;

    const parentRect = containerRef.current.getBoundingClientRect();
    const activeRect = wordRefs.current[currentIndex].getBoundingClientRect();

    setFocusRect({
      x: activeRect.left - parentRect.left,
      y: activeRect.top - parentRect.top,
      width: activeRect.width,
      height: activeRect.height
    });
  }, [currentIndex, words.length]);

  const handleMouseEnter = index => {
    if (manualMode) {
      setLastActiveIndex(index);
      setCurrentIndex(index);
    }
  };

  const handleMouseLeave = () => {
    if (manualMode) {
      setCurrentIndex(lastActiveIndex);
    }
  };

  return (
    <div className={`relative flex flex-wrap justify-center items-center gap-[0.5em] outline-hidden select-none ${className}`} ref={containerRef}>
      {words.map((word, index) => {
        const isActive = index === currentIndex;
        return (
          <span
            key={index}
            ref={el => (wordRefs.current[index] = el)}
            className={`relative font-extrabold cursor-pointer select-none outline-hidden`}
            style={{
              filter: isActive ? `blur(0px)` : `blur(${blurAmount}px)`,
              transition: `filter ${animationDuration}s ease`
            }}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
          >
            {word}
          </span>
        );
      })}

      <motion.div
        className="absolute top-0 left-0 pointer-events-none box-content border-none"
        animate={{
          x: focusRect.x,
          y: focusRect.y,
          width: focusRect.width,
          height: focusRect.height,
          opacity: currentIndex >= 0 ? 1 : 0
        }}
        transition={{
          duration: animationDuration
        }}
      >
        <span 
          className="absolute w-3 h-3 border-2 border-r-0 border-b-0 -top-1.5 -left-1.5 rounded-[2px]" 
          style={{ borderColor, filter: `drop-shadow(0px 0px 4px ${glowColor})` }}
        />
        <span 
          className="absolute w-3 h-3 border-2 border-l-0 border-b-0 -top-1.5 -right-1.5 rounded-[2px]" 
          style={{ borderColor, filter: `drop-shadow(0px 0px 4px ${glowColor})` }}
        />
        <span 
          className="absolute w-3 h-3 border-2 border-r-0 border-t-0 -bottom-1.5 -left-1.5 rounded-[2px]" 
          style={{ borderColor, filter: `drop-shadow(0px 0px 4px ${glowColor})` }}
        />
        <span 
          className="absolute w-3 h-3 border-2 border-l-0 border-t-0 -bottom-1.5 -right-1.5 rounded-[2px]" 
          style={{ borderColor, filter: `drop-shadow(0px 0px 4px ${glowColor})` }}
        />
      </motion.div>
    </div>
  );
};

export default TrueFocus;
