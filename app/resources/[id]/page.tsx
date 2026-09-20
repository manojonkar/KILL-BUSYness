"use client";
import React from 'react';
import { resourcesData } from '@/lib/resourcesData';
import ProgressiveGate from '@/components/ProgressiveGate';
import Link from 'next/link';

const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="m15 18-6-6 6-6"/></svg>
);

export default function ResourceVideoPage({ params }: { params: { id: string } }) {
  const resource = resourcesData.find(r => r.id.toString() === params.id);

  if (!resource) {
    return <div className="min-h-screen flex items-center justify-center text-white bg-[#071022]">Resource not found.</div>;
  }

  return (
    <div className="min-h-screen bg-[#071022] text-slate-200 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/resources" className="inline-flex items-center text-slate-400 hover:text-white mb-8 transition-colors">
          <BackIcon />
          Back to Executive Briefings
        </Link>
        
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{resource.title}</h1>
        </div>

        <ProgressiveGate videoId={resource.id}>
          <div className="bg-black rounded-xl overflow-hidden shadow-2xl border border-slate-700 relative">
            <div className="absolute inset-0 z-10 pointer-events-none" onContextMenu={(e) => e.preventDefault()} />
            <video 
              className="w-full aspect-video z-0 relative"
              controls 
              controlsList="nodownload"
              disablePictureInPicture
              onContextMenu={(e) => e.preventDefault()}
            >
              <source src={resource.videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          <div className="mt-8 text-center text-slate-400 text-sm border-t border-slate-800 pt-6">
            <p>Confidential Executive Briefing. Downloading and redistribution is disabled.</p>
          </div>
        </ProgressiveGate>
      </div>
    </div>
  );
}
