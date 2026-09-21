"use client";
import React, { useState, useEffect } from 'react';

export default function ProgressiveGate({ children, videoId }: { children: React.ReactNode, videoId: string | number }) {
  const [level, setLevel] = useState<number | null>(null);
  const [unlockedVideos, setUnlockedVideos] = useState<string[]>([]);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedLevel = parseInt(localStorage.getItem('hpo_profiling_level') || '0');
    const savedUnlocked = JSON.parse(localStorage.getItem('hpo_unlocked_videos') || '[]');
    const savedData = JSON.parse(localStorage.getItem('hpo_profile_data') || '{}');
    
    setLevel(savedLevel);
    setUnlockedVideos(savedUnlocked);
    setFormData(savedData);
  }, []);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Save lead to backend database
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, source: videoId })
      });
    } catch (err) {
      console.error("Failed to save lead", err);
    }

    const newUnlocked = [...unlockedVideos, String(videoId)];
    setUnlockedVideos(newUnlocked);
    localStorage.setItem('hpo_unlocked_videos', JSON.stringify(newUnlocked));

    const nextLevel = (level || 0) + 1;
    setLevel(nextLevel);
    localStorage.setItem('hpo_profiling_level', nextLevel.toString());
    localStorage.setItem('hpo_profile_data', JSON.stringify(formData));
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (level === null) return <div style={{ padding: '40px', textAlign: 'center', color: '#fff' }}>Loading Security Clearance...</div>;

  if (unlockedVideos.includes(String(videoId)) || level >= 4) {
    return <>{children}</>;
  }

  return (
    <div style={{ maxWidth: '500px', margin: '40px auto', background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '32px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.4rem', color: '#f8fafc', marginBottom: '8px' }}>Security Clearance Required</h3>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
          {level === 0 && "Please enter your name and email to unlock this Executive Briefing."}
          {level === 1 && "Please provide your role to unlock the next briefing."}
          {level === 2 && "Please provide your company size to continue."}
          {level === 3 && "Please provide your industry to achieve full clearance."}
        </p>
      </div>

      <form onSubmit={handleUnlock} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {level === 0 && (
          <>
            <input required name="name" type="text" placeholder="Full Name" value={formData.name || ''} onChange={handleChange} style={{ padding: '12px', borderRadius: '6px', border: '1px solid #334155', background: '#1e293b', color: 'white' }} />
            <input required name="email" type="email" placeholder="Work Email" value={formData.email || ''} onChange={handleChange} style={{ padding: '12px', borderRadius: '6px', border: '1px solid #334155', background: '#1e293b', color: 'white' }} />
          </>
        )}
        {level === 1 && (
          <input required name="role" type="text" placeholder="Job Title (e.g. CEO, Director)" value={formData.role || ''} onChange={handleChange} style={{ padding: '12px', borderRadius: '6px', border: '1px solid #334155', background: '#1e293b', color: 'white' }} />
        )}
        {level === 2 && (
          <select required name="companySize" value={formData.companySize || ''} onChange={handleChange} style={{ padding: '12px', borderRadius: '6px', border: '1px solid #334155', background: '#1e293b', color: 'white' }}>
            <option value="" disabled>Select Company Size</option>
            <option value="1-10">1-10 Employees</option>
            <option value="11-50">11-50 Employees</option>
            <option value="51-200">51-200 Employees</option>
            <option value="201-500">201-500 Employees</option>
            <option value="500+">500+ Employees</option>
          </select>
        )}
        {level === 3 && (
          <input required name="industry" type="text" placeholder="Industry" value={formData.industry || ''} onChange={handleChange} style={{ padding: '12px', borderRadius: '6px', border: '1px solid #334155', background: '#1e293b', color: 'white' }} />
        )}
        
        <button disabled={loading} type="submit" style={{ padding: '14px', background: '#0E9C74', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' }}>
          {loading ? "Unlocking..." : "Unlock Briefing"}
        </button>
      </form>
    </div>
  );
}
