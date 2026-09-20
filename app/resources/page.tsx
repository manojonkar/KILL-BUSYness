import React from 'react';
import Header from '@/components/Header';
import { resourcesData } from '@/lib/resourcesData';
import ResourceCard from '@/components/ResourceCard';

export default function ResourcesPage() {
  return (
    <>
      <Header active="Resources" />
      <div style={{ backgroundColor: '#050c1a', minHeight: '100vh', padding: '60px 20px', color: '#f8fafc', fontFamily: 'var(--sans)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '60px', padding: '40px', background: 'linear-gradient(135deg, #0b1730, #132a52)', borderRadius: '16px', border: '1px solid #23386b', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #d4af37, transparent 75%)' }} />
            <h1 style={{ fontSize: '2.8rem', fontWeight: 800, color: '#ffffff', marginBottom: '16px', lineHeight: 1.2, fontFamily: 'var(--serif)' }}>
              Executive Briefings Library
            </h1>
            <p style={{ fontSize: '1.1rem', color: '#94a3b8', maxWidth: '700px', margin: '0 auto', lineHeight: 1.6 }}>
              A curated vault of highly focused, 2-minute strategic insights designed exclusively for CEOs transitioning from an Extractive, BUSY organization to a Generative, High-Performance Organization.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {resourcesData.map((resource, idx) => (
              <ResourceCard key={resource.id} resource={resource} index={idx} />
            ))}
          </div>

        </div>
      </div>
    </>
  );
}
