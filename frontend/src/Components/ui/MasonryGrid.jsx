import { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const MasonryGrid = ({ images }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Dynamically determine grid columns based on image count
  const totalImages = images.length;
  const cols = totalImages > 12 ? 4 : totalImages > 6 ? 3 : 2;

  // Generate grid positions using a simple "packing" algorithm
  const gridPositions = useMemo(() => {
    const grid = []; // 2D array to track occupied cells
    const positions = [];

    // Pre-defined patterns for visual variety
    const patterns = [
      { r: 2, c: 1 }, // Tall
      { r: 1, c: 1 }, // Square
      { r: 1, c: 2 }, // Wide
      { r: 1, c: 1 }, // Square
      { r: 1, c: 1 }, // Tall
      { r: 1, c: 1 }, // Square
      { r: 1, c: 2 }, // Wide
      { r: 2, c: 1 }, // Square
    ];

    const isFree = (r, c, wr, wc) => {
      for (let i = r; i < r + wr; i++) {
        for (let j = c; j < c + wc; j++) {
          if (j >= cols) return false; // Column overflow
          if (grid[i] && grid[i][j]) return false;
        }
      }
      return true;
    };

    const markOccupied = (r, c, wr, wc) => {
      for (let i = r; i < r + wr; i++) {
        if (!grid[i]) grid[i] = new Array(cols).fill(false);
        for (let j = c; j < c + wc; j++) {
          grid[i][j] = true;
        }
      }
    };

    images.forEach((_, i) => {
      const pattern = patterns[i % patterns.length];
      let spanRow = pattern.r;
      let spanCol = pattern.c;

      // Adjust spans if they are too big for the current column count
      if (spanCol > cols) spanCol = cols;
      if (totalImages <= 4) {
        spanRow = 1;
        spanCol = 1;
      } // Keep it simple for few images

      let r = 0;
      let c = 0;
      let found = false;

      while (!found) {
        for (let currentCol = 0; currentCol <= cols - spanCol; currentCol++) {
          if (isFree(r, currentCol, spanRow, spanCol)) {
            c = currentCol;
            found = true;
            break;
          }
        }
        if (!found) r++;
      }

      markOccupied(r, c, spanRow, spanCol);
      positions.push({ row: r, col: c, spanRow, spanCol });
    });

    return positions;
  }, [images, cols, totalImages]);

  const physicalRows = useMemo(() => {
    return Math.max(...gridPositions.map((p) => p.row + p.spanRow), 1);
  }, [gridPositions]);

  // Dynamic grid template calculations for the "expansion" effect
  const getColTemplate = (hoveredIdx) => {
    if (hoveredIdx === null) return `repeat(${cols}, 1fr)`;

    const pos = gridPositions[hoveredIdx];
    const fractions = Array(cols).fill(1);

    // Expand hovered column(s)
    for (let i = pos.col; i < pos.col + pos.spanCol; i++) {
      fractions[i] = 1.4;
    }

    // Shrink others
    fractions.forEach((_, i) => {
      if (i < pos.col || i >= pos.col + pos.spanCol) fractions[i] = 0.8;
    });

    return fractions.map((f) => `${f}fr`).join(" ");
  };

  const getRowTemplate = (hoveredIdx) => {
    if (hoveredIdx === null) return `repeat(${physicalRows}, 1fr)`;

    const pos = gridPositions[hoveredIdx];
    const fractions = Array(physicalRows).fill(1);

    // Expand hovered row(s)
    for (let i = pos.row; i < pos.row + pos.spanRow; i++) {
      fractions[i] = 1.3;
    }

    // Shrink others
    fractions.forEach((_, i) => {
      if (i < pos.row || i >= pos.row + pos.spanRow) fractions[i] = 0.85;
    });

    return fractions.map((f) => `${f}fr`).join(" ");
  };

  return (
    <motion.div 
      className="grid gap-4 w-full overflow-visible"
      style={{ 
        height: `${Math.max(650, physicalRows * 180)}px`,
        maxHeight: "80vh",
      }}
      animate={{
        gridTemplateColumns: getColTemplate(hoveredIndex),
        gridTemplateRows: getRowTemplate(hoveredIndex),
      }}
      transition={{ 
        type: "spring", 
        stiffness: 220, 
        damping: 28, 
        mass: 0.6,
        layout: { duration: 0.4 }
      }}
    >
      {images.map((image, idx) => {
        const isHovered = hoveredIndex === idx;
        const pos = gridPositions[idx];

        return (
          <motion.div
            key={image.id || idx}
            onHoverStart={() => setHoveredIndex(idx)}
            onHoverEnd={() => setHoveredIndex(null)}
            className="relative rounded-3xl overflow-hidden cursor-pointer bg-slate-50 group border border-orange-100/30 shadow-sm hover:shadow-2xl transition-shadow duration-500"
            style={{
              gridColumnStart: pos.col + 1,
              gridColumnEnd: `span ${pos.spanCol}`,
              gridRowStart: pos.row + 1,
              gridRowEnd: `span ${pos.spanRow}`,
            }}
            layout
            transition={{
              type: "spring",
              stiffness: 220,
              damping: 28,
              mass: 0.6
            }}
          >
            <motion.img
              src={image.url}
              alt={image.title}
              initial={false}
              animate={{
                opacity: hoveredIndex !== null && !isHovered ? 0.4 : 1,
                filter: hoveredIndex !== null && !isHovered ? "grayscale(100%)" : "grayscale(0%)",
                scale: isHovered ? 1.1 : 1,
              }}
              transition={{ duration: 0.5, ease: "circOut" }}
              className="w-full h-full object-cover"
            />
            
            <motion.div 
              className="absolute inset-0 bg-linear-gradient-to-t from-black/90 via-black/20 to-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-[10px] font-black text-orange-400 uppercase tracking-[0.2em] mb-2">{image.location}</p>
                <h4 className="text-xl font-display font-black text-white leading-tight">{image.title}</h4>
              </div>
            </motion.div>

            {/* Corner Indicators */}
            <AnimatePresence>
              {isHovered && (
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
                   animate={{ opacity: 1, scale: 1, rotate: 0 }}
                   exit={{ opacity: 0, scale: 0.5, rotate: 20 }}
                   className="absolute top-5 left-5 w-10 h-10 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-2xl"
                 >
                   <Sparkles size={20} className="text-white" />
                 </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default MasonryGrid;
