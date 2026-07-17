import React from "react";

interface ImageCollageProps {
  imageBack: string;
  imageFront: string;
  altBack?: string;
  altFront?: string;
  priority?: boolean;
}

export function ImageCollage({
  imageBack,
  imageFront,
  altBack = "",
  altFront = "",
  priority = false,
}: ImageCollageProps) {
  return (
    <div className="relative w-full max-w-lg aspect-square" style={{ willChange: "transform" }}>
      <img
        src={imageBack}
        alt={altBack}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        className="absolute top-0 left-0 w-[90%] rounded-xl object-cover"
        style={{
          boxShadow: "0 10px 25px -5px rgba(0,0,0,0.2), 0 8px 10px -6px rgba(0,0,0,0.2)",
          transform: "translateZ(0)",
        }}
      />
      <img
        src={imageFront}
        alt={altFront}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        className="absolute bottom-0 right-0 w-[75%] rounded-xl object-cover"
        style={{
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.4)",
          transform: "translateZ(0)",
        }}
      />
    </div>
  );
}