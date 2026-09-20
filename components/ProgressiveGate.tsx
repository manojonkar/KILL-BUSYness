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
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (level === null) return <div style={{ padding: '40px', textAlign: 'center', color: '#fff' }}>Loading Security Clearance...</div>;

  if (unlockedVideos.includes(videoId) || level >= 4) {
    return <>{children}</>;
  }

  const inputStyle = {
    width: '100%',
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '8px',
    padding: '16px',
    color: '#f8fafc',
    fontSize: '1rem',
    marginBottom: '16px',
    boxSizing: 'border-box' as const,
    fontFamily: 'inherit'
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto 0', backgroundColor: '#1e293b', padding: '40px', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)', border: '1px solid #334155' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', marginBottom: '12px' }}>Secure Resource Access</h2>
        <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: 1.5 }}>
          {level === 0 && "To access this executive briefing, please introduce yourself."}
          {level === 1 && "Welcome back! To unlock your next resource, we need a little more context."}
          {level === 2 && "Almost there. Understanding your scale helps us tailor our insights."}
          {level === 3 && "Final step! Tell us about the challenges you are facing."}
        </p>
      </div>

      <form onSubmit={handleUnlock}>
        {level === 0 && (
          <>
            <input required type="text" name="name" placeholder="Full Name" onChange={handleChange} style={inputStyle} />
            <input required type="email" name="email" placeholder="Official Work Email" onChange={handleChange} style={inputStyle} />
            <input required type="text" name="company" placeholder="Company Name" onChange={handleChange} style={inputStyle} />
          </>
        )}

        {level === 1 && (
          <>
            <input required type="text" name="jobTitle" placeholder="Job Title (e.g., CEO, Director)" onChange={handleChange} style={inputStyle} />
            <input required type="text" name="industry" placeholder="Industry" onChange={handleChange} style={inputStyle} />
          </>
        )}

        {level === 2 && (
          <>
            <select required name="companySize" onChange={handleChange} style={inputStyle}>
              <option value="">Select Company Size...</option>
              <option value="1-50">1 - 50 Employees</option>
              <option value="51-200">51 - 200 Employees</option>
              <option value="201-1000">201 - 1,000 Employees</option>
              <option value="1000+">1,000+ Employees</option>
            </select>
            <select required name="turnover" onChange={handleChange} style={inputStyle}>
              <option value="">Select Annual Turnover...</option>
              <option value="<1M">Less than $1M</option>
              <option value="1M-10M">$1M - </option>
              <option value="10M-50M">$10M - </option>
              <option value="50M+">$50M+</option>
            </select>
          </>
        )}

        {level === 3 && (
          <>
            <textarea required name="challenge" placeholder="What is the biggest strategic bottleneck your company is facing right now?" rows={4} onChange={handleChange} style={{ ...inputStyle, resize: 'vertical', minHeight: '120px' }} />
          </>
        )}

        <button type="submit" style={{ width: '100%', backgroundColor: '#0E9C74', color: '#ffffff', fontWeight: 800, padding: '16px', borderRadius: '8px', border: 'none', fontSize: '1.1rem', cursor: 'pointer', marginTop: '10px', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0b7a5a'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0E9C74'}>
          Unlock Executive Briefing &rarr;
        </button>
      </form>
    </div>
  );
}
