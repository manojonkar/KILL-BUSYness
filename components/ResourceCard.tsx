"use client";
import React from 'react';
import Link from 'next/link';

const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 0.2s' }}>
    <circle cx="12" cy="12" r="10"/>
    <polygon points="10 8 16 12 10 16 10 8"/>
  </svg>
);

export default function ResourceCard({ resource, index }: { resource: any, index: number }) {
  return (
    <Link href={/resources/ + resource.id} style={{ textDecoration: 'none' }}>
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
              Briefing {String(index + 1).padStart(2, '0')}
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
  );
}
