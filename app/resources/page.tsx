import React from 'react';
import Link from 'next/link';
import { resourcesData } from '@/lib/resourcesData';
import { PlayCircle } from 'lucide-react';

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-[#071022] text-slate-200 py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Executive Briefings</h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            A library of highly focused, 2-minute strategic insights designed to help leaders transition from an Extractive, BUSY organization to a Generative, High-Performance Organization.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resourcesData.map((resource) => (
            <Link key={resource.id} href={/resources/ + resource.id}>
              <div className="group bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-[#0E9C74] p-6 rounded-xl transition-all cursor-pointer h-full flex flex-col justify-between">
                <div>
                  <div className="text-[#0E9C74] mb-3">
                    <PlayCircle size={32} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 leading-tight">{resource.title}</h3>
                </div>
                <div className="mt-6 flex items-center text-sm font-medium text-slate-400 group-hover:text-white transition-colors">
                  Unlock Briefing &rarr;
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
