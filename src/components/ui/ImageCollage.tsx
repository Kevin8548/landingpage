// src/components/ui/ImageCollage.tsx
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

interface ImageCollageProps {
  imageBack: string | string[];
  imageFront: string | string[];
  altBack?: string;
  altFront?: string;
  priority?: boolean;
  intervalMs?: number;
}

function useRotatingImage(source: string | string[], intervalMs: number) {
  const images = Array.isArray(source) ? source : [source];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [images.length, intervalMs]);

  return images[index];
}

export function ImageCollage({
  imageBack,
  imageFront,
  altBack = "",
  altFront = "",
  priority = false,
  intervalMs = 5000,
}: ImageCollageProps) {
  const currentBack = useRotatingImage(imageBack, intervalMs);
  // Ligero desfase para que no cambien las dos fotos al mismo tiempo
  const currentFront = useRotatingImage(imageFront, intervalMs + 1200);

  return (
    <div className="relative w-full max-w-lg aspect-square" style={{ willChange: "transform" }}>
      <AnimatePresence mode="wait">
        <motion.img
          key={currentBack}
          src={currentBack}
          alt={altBack}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="absolute top-0 left-0 w-[90%] rounded-xl object-cover"
          style={{
            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.2), 0 8px 10px -6px rgba(0,0,0,0.2)",
            transform: "translateZ(0)",
          }}
        />
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.img
          key={currentFront}
          src={currentFront}
          alt={altFront}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="absolute bottom-0 right-0 w-[75%] rounded-xl object-cover"
          style={{
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.4)",
            transform: "translateZ(0)",
          }}
        />
      </AnimatePresence>
    </div>
  );
}