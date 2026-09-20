"use client";
import React from 'react';

export default function ProtectedVideo({ src, poster }: { src: string, poster?: string }) {
  return (
    <div 
      style={{ position: 'relative', width: '100%', backgroundColor: '#000' }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <video 
        controls 
        autoPlay 
        controlsList="nodownload"
        disablePictureInPicture
        style={{ width: "100%", display: "block", aspectRatio: "16/9" }}
        poster={poster}
      >
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
