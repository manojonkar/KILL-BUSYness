"use client";
import React, { useState, useEffect } from 'react';

export default function ProgressiveGate({ children, videoId }: { children: React.ReactNode, videoId: number }) {
  const [level, setLevel] = useState<number | null>(null);
  const [unlockedVideos, setUnlockedVideos] = useState<number[]>([]);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    const savedLevel = parseInt(localStorage.getItem('hpo_profiling_level') || '0');
    const savedUnlocked = JSON.parse(localStorage.getItem('hpo_unlocked_videos') || '[]');
    const savedData = JSON.parse(localStorage.getItem('hpo_profile_data') || '{}');
    
    setLevel(savedLevel);
    setUnlockedVideos(savedUnlocked);
    setFormData(savedData);
  }, []);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newUnlocked = [...unlockedVideos, videoId];
    setUnlockedVideos(newUnlocked);
    localStorage.setItem('hpo_unlocked_videos', JSON.stringify(newUnlocked));

    const nextLevel = (level || 0) + 1;
    setLevel(nextLevel);
    localStorage.setItem('hpo_profiling_level', nextLevel.toString());
    localStorage.setItem('hpo_profile_data', JSON.stringify(formData));
    
    // Here we could also sync 'formData' to Supabase/Resend
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (level === null) return <div className="p-8 text-center text-white">Loading Security...</div>;

  // If already unlocked this specific video, or if they have completed all 4 levels of profiling
  if (unlockedVideos.includes(videoId) || level >= 4) {
    return <>{children}</>;
  }

  return (
    <div className="max-w-xl mx-auto bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700 mt-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Unlock This Resource</h2>
        <p className="text-slate-400">
          {level === 0 && "To access this executive briefing, please introduce yourself."}
          {level === 1 && "Welcome back! To unlock your next resource, we need a little more context."}
          {level === 2 && "Almost there. Understanding your scale helps us tailor our insights."}
          {level === 3 && "Final step! Tell us about the challenges you are facing."}
        </p>
      </div>

      <form onSubmit={handleUnlock} className="space-y-4">
        {level === 0 && (
          <>
            <input required type="text" name="name" placeholder="Full Name" onChange={handleChange} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white" />
            <input required type="email" name="email" placeholder="Official Work Email" onChange={handleChange} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white" />
            <input required type="text" name="company" placeholder="Company Name" onChange={handleChange} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white" />
          </>
        )}

        {level === 1 && (
          <>
            <input required type="text" name="jobTitle" placeholder="Job Title (e.g., CEO, Director)" onChange={handleChange} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white" />
            <input required type="text" name="industry" placeholder="Industry" onChange={handleChange} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white" />
          </>
        )}

        {level === 2 && (
          <>
            <select required name="companySize" onChange={handleChange} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white">
              <option value="">Select Company Size...</option>
              <option value="1-50">1 - 50 Employees</option>
              <option value="51-200">51 - 200 Employees</option>
              <option value="201-1000">201 - 1,000 Employees</option>
              <option value="1000+">1,000+ Employees</option>
            </select>
            <select required name="turnover" onChange={handleChange} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white">
              <option value="">Select Annual Turnover...</option>
              <option value="<1M">Less than </option>
              <option value="1M-10M"> - </option>
              <option value="10M-50M"> - </option>
              <option value="50M+">+</option>
            </select>
          </>
        )}

        {level === 3 && (
          <>
            <textarea required name="challenge" placeholder="What is the biggest strategic bottleneck your company is facing right now?" rows={4} onChange={handleChange} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white" />
          </>
        )}

        <button type="submit" className="w-full bg-[#0E9C74] hover:bg-[#0b7a5a] text-white font-bold py-3 px-4 rounded-lg transition-colors">
          Unlock Resource &rarr;
        </button>
      </form>
    </div>
  );
}
