import React from "react";

interface ImageCollageProps {
  imageBack: string;
  imageFront: string;
  altBack?: string;
  altFront?: string;
}

export function ImageCollage({
  imageBack,
  imageFront,
  altBack = "",
  altFront = "",
}: ImageCollageProps) {
  return (
    <div className="relative w-full max-w-md aspect-square">
      <img
        src={imageBack}
        alt={altBack}
        className="absolute top-0 left-0 w-[85%] rounded-xl shadow-lg object-cover"
      />
      <img
        src={imageFront}
        alt={altFront}
        className="absolute bottom-0 right-0 w-[70%] rounded-xl shadow-2xl object-cover"
      />
    </div>
  );
}