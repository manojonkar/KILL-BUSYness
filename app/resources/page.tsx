"use client";`nimport React from 'react';
import Link from 'next/link';
import { resourcesData } from '@/lib/resourcesData';

const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 0.2s' }}>
    <circle cx="12" cy="12" r="10"/>
    <polygon points="10 8 16 12 10 16 10 8"/>
  </svg>
);

export default function ResourcesPage() {
  return (
    <div style={{ backgroundColor: '#050c1a', minHeight: '100vh', padding: '60px 20px', color: '#f8fafc', fontFamily: 'var(--sans)' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* HERO SECTION */}
        <div style={{ textAlign: 'center', marginBottom: '60px', padding: '40px', background: 'linear-gradient(135deg, #0b1730, #132a52)', borderRadius: '16px', border: '1px solid #23386b', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #d4af37, transparent 75%)' }} />
          <h1 style={{ fontSize: '2.8rem', fontWeight: 800, color: '#ffffff', marginBottom: '16px', lineHeight: 1.2, fontFamily: 'var(--serif)' }}>
            Executive Briefings Library
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#94a3b8', maxWidth: '700px', margin: '0 auto', lineHeight: 1.6 }}>
            A curated vault of highly focused, 2-minute strategic insights designed exclusively for CEOs transitioning from an Extractive, BUSY organization to a Generative, High-Performance Organization.
          </p>
        </div>

        {/* GRID OF VSLs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {resourcesData.map((resource, idx) => (
            <Link key={resource.id} href={`/resources/${resource.id}`} style={{ textDecoration: 'none' }}>
              <div 
                className="chapter-card"
                style={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: '12px',
                  padding: '24px',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#0E9C74';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#1e293b';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div style={{ color: '#0E9C74' }}>
                      <PlayIcon />
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
                      Briefing {String(idx + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', marginBottom: '12px', lineHeight: 1.4 }}>
                    {resource.title}
                  </h3>
                </div>
                <div style={{ marginTop: '20px', borderTop: '1px solid #1e293b', paddingTop: '16px', display: 'flex', alignItems: 'center', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>
                  <span style={{ color: '#0E9C74', marginRight: '8px' }}>Unlock Briefing</span> &rarr;
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}


