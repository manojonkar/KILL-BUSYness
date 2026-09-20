import React from 'react';
import Header from '@/components/Header';
import { resourcesData } from '@/lib/resourcesData';
import ProgressiveGate from '@/components/ProgressiveGate';
import Link from 'next/link';

const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><path d="m15 18-6-6 6-6"/></svg>
);

export default function ResourceVideoPage({ params }: { params: { id: string } }) {
  const resource = resourcesData.find(r => r.id.toString() === params.id);

  if (!resource) {
    return (
      <>
        <Header active="Resources" />
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', backgroundColor: '#050c1a' }}>Resource not found.</div>
      </>
    );
  }

  return (
    <>
      <Header active="Resources" />
      <div style={{ minHeight: '100vh', backgroundColor: '#050c1a', color: '#f8fafc', padding: '60px 20px', fontFamily: 'var(--sans)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          
          <style dangerouslySetInnerHTML={{ __html: 
            .back-link {
              display: inline-flex;
              align-items: center;
              color: #94a3b8;
              text-decoration: none;
              margin-bottom: 40px;
              font-size: 0.9rem;
              font-weight: 600;
              transition: color 0.2s;
            }
            .back-link:hover {
              color: #fff;
            }
          }} />

          <Link href="/resources" className="back-link">
            <BackIcon />
            Back to Executive Library
          </Link>
          
          <div style={{ marginBottom: '40px', textAlign: 'center' }}>
            <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#ffffff', marginBottom: '16px', lineHeight: 1.2, fontFamily: 'var(--serif)' }}>
              {resource.title}
            </h1>
            <div style={{ width: '60px', height: '4px', backgroundColor: '#0E9C74', margin: '0 auto', borderRadius: '2px' }} />
          </div>

          <ProgressiveGate videoId={resource.id}>
            <div style={{ backgroundColor: '#000', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', border: '1px solid #1e293b', position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none' }} />
              <video 
                style={{ width: '100%', aspectRatio: '16/9', display: 'block', zIndex: 0, position: 'relative' }}
                controls 
                controlsList="nodownload"
                disablePictureInPicture
              >
                <source src={resource.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
            <div style={{ marginTop: '30px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem', borderTop: '1px solid #1e293b', paddingTop: '24px' }}>
              <p>Confidential Executive Briefing. Downloading and redistribution is strictly prohibited.</p>
            </div>
          </ProgressiveGate>
        </div>
      </div>
    </>
  );
}
