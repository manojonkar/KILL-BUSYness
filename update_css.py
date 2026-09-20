import re

new_css = """
<style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        .xo-root {
          --navy: #0f172a;
          --navy-deep: #020617;
          --navy-light: #334155;
          --gold: #0E9C74;
          --gold-light: #34d399;
          --cream: #f0f4f8;
          --ink: #1e293b;
          --grey: #64748b;
          --line: #e2e8f0;
          font-family: 'Inter', sans-serif;
          background: var(--cream);
          color: var(--ink);
          min-height: 100vh;
          width: 100%;
          box-sizing: border-box;
          padding: 64px 20px 80px;
          display: flex;
          justify-content: center;
          align-items: flex-start;
        }
        .xo-root *, .xo-root *::before, .xo-root *::after { box-sizing: border-box; }
        .xo-root button:focus-visible, .xo-root input:focus-visible { outline: 2px solid var(--gold); outline-offset: 3px; }
        @media (prefers-reduced-motion: reduce) { .xo-root * { transition: none !important; animation: none !important; } }

        .xo-shell { width: 100%; max-width: 820px; }
        
        .xo-eyebrow {
          font-family: 'Inter', sans-serif; font-size: 13px; letter-spacing: 0.15em; font-weight: 700;
          color: var(--gold); text-transform: uppercase; margin-bottom: 12px;
        }
        
        .xo-h1 {
          font-family: 'Inter', sans-serif; font-weight: 800; letter-spacing: -0.02em;
          font-size: clamp(32px, 5vw, 44px); line-height: 1.15; 
          color: var(--navy);
          margin: 0 0 16px;
        }
        
        .xo-lede { font-size: 18px; line-height: 1.6; color: var(--grey); max-width: 600px; margin: 0 0 36px; }

        .xo-card {
          background: #ffffff; border: 1px solid var(--line); border-radius: 16px;
          padding: 48px 46px; 
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
          animation: fadeIn 0.5s ease forwards;
          position: relative; overflow: hidden;
        }
        .xo-card::before {
          content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 5px;
          background: var(--gold);
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .xo-hero-hex { display: flex; justify-content: center; margin: 12px 0 40px; transform: scale(1.1); }
        
        .xo-field-label { font-size: 14px; font-weight: 600; color: var(--navy); margin-bottom: 8px; display: block; }
        .xo-input {
          width: 100%; font-family: 'Inter', sans-serif; font-size: 16px; padding: 14px 18px;
          border: 1px solid #cbd5e1; border-radius: 10px; background: #fff; color: var(--ink);
          transition: all 0.2s ease; box-shadow: 0 1px 2px rgba(0,0,0,0.02);
        }
        .xo-input:focus { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(14,156,116,0.15); outline: none; }
        .xo-input::placeholder { color: #94a3b8; }

        .xo-btn {
          font-family: 'Inter', sans-serif; font-weight: 600; font-size: 16px; 
          border-radius: 10px; padding: 14px 28px; cursor: pointer; border: none; 
          transition: all 0.2s ease; display: inline-flex; justify-content: center; align-items: center;
        }
        .xo-btn:active { transform: translateY(1px); }
        .xo-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }
        
        .xo-btn-primary { 
          background: var(--gold); color: #fff; box-shadow: 0 4px 6px rgba(14,156,116,0.2); 
        }
        .xo-btn-primary:hover:not(:disabled) { 
          background: #0b7a5a; box-shadow: 0 6px 12px rgba(14,156,116,0.3); transform: translateY(-1px);
        }
        
        .xo-btn-ghost { background: transparent; color: var(--navy); border: 1px solid var(--line); }
        .xo-btn-ghost:hover { border-color: #cbd5e1; background: #f8fafc; }

        /* progress */
        .xo-progress-row { display: flex; align-items: center; gap: 8px; margin-bottom: 36px; overflow-x: auto; padding-bottom: 8px; }
        .xo-progress-label { font-size: 13px; font-weight: 600; color: var(--navy-light); margin-left: 8px; white-space: nowrap; }

        /* pillar screen */
        .xo-pillar-eyebrow { font-size: 12px; letter-spacing: 0.15em; color: var(--gold); font-weight: 700; text-transform: uppercase; }
        .xo-pillar-name { font-family: 'Inter', sans-serif; font-weight: 800; letter-spacing: -0.01em; font-size: 30px; color: var(--navy); margin: 6px 0 6px; }
        .xo-pillar-anchor { font-size: 15px; color: var(--grey); margin-bottom: 32px; font-weight: 500; }

        .xo-legend { 
          display: flex; flex-wrap: wrap; gap: 20px; font-size: 13px; color: var(--grey); 
          background: #f8fafc; border-radius: 10px; padding: 14px 20px; margin-bottom: 32px; border: 1px solid var(--line);
        }
        .xo-legend b { color: var(--navy); font-weight: 700; }

        .xo-statement { margin-bottom: 32px; }
        .xo-statement:last-child { margin-bottom: 0; }
        .xo-statement-text { font-size: 16px; font-weight: 500; line-height: 1.6; color: var(--navy); margin-bottom: 14px; }
        
        .xo-scale { display: flex; gap: 8px; }
        .xo-scale-btn {
          flex: 1; padding: 12px 4px; text-align: center; border-radius: 10px; border: 1px solid #cbd5e1;
          background: #FFFFFF; cursor: pointer; font-family: 'Inter', sans-serif; 
          transition: all 0.2s ease; box-shadow: 0 1px 2px rgba(0,0,0,0.02);
        }
        .xo-scale-btn:hover { border-color: var(--gold); background: #f0fdf4; color: var(--gold); }
        .xo-scale-num { font-size: 20px; font-weight: 700; color: var(--navy-light); display: block; }
        .xo-scale-btn:hover .xo-scale-num { color: var(--gold); }
        
        .xo-scale-btn.selected { 
          background: var(--gold); border-color: var(--gold); box-shadow: 0 4px 10px rgba(14,156,116,0.2); transform: translateY(-1px);
        }
        .xo-scale-btn.selected .xo-scale-num { color: #fff; }

        .xo-nav-row { display: flex; justify-content: space-between; align-items: center; margin-top: 40px; border-top: 1px solid var(--line); padding-top: 24px; }
        .xo-step-count { font-size: 14px; font-weight: 600; color: var(--grey); }

        /* results */
        .xo-index-block { text-align: center; padding: 12px 0 32px; border-bottom: 1px solid var(--line); margin-bottom: 32px; }
        .xo-index-number { font-family: 'Inter', sans-serif; font-weight: 800; font-size: 72px; color: var(--navy); line-height: 1; letter-spacing: -0.03em; }
        .xo-index-sub { font-size: 13px; letter-spacing: 0.1em; font-weight: 700; text-transform: uppercase; color: var(--grey); margin-top: 12px; }
        .xo-band-pill {
          display: inline-block; margin-top: 20px; padding: 8px 20px; border-radius: 8px;
          font-size: 14px; font-weight: 700; color: #fff; text-transform: uppercase; letter-spacing: 0.05em;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .xo-band-note { font-size: 15px; font-weight: 500; color: var(--navy-light); margin-top: 14px; max-width: 480px; margin-left: auto; margin-right: auto; line-height: 1.5; }

        .xo-breakdown-row {
          display: flex; align-items: center; gap: 16px; padding: 14px 0; border-bottom: 1px solid var(--line);
        }
        .xo-breakdown-row:last-child { border-bottom: none; }
        .xo-breakdown-name { width: 220px; font-size: 14px; font-weight: 600; color: var(--navy); flex-shrink: 0; }
        .xo-breakdown-bar-track { flex: 1; height: 8px; background: #e2e8f0; border-radius: 999px; overflow: hidden; }
        .xo-breakdown-bar-fill { height: 100%; background: var(--gold); border-radius: 999px; }
        .xo-breakdown-level { width: 110px; text-align: right; font-size: 13px; font-weight: 600; color: var(--grey); flex-shrink: 0; }

        .xo-disclaimer { font-size: 13px; line-height: 1.6; color: var(--grey); margin-top: 36px; padding-top: 24px; border-top: 1px solid var(--line); }
        .xo-footer-actions { display: flex; gap: 12px; margin-top: 32px; flex-wrap: wrap; justify-content: center; }
        .xo-footer-actions .xo-btn-primary[style] { background: var(--gold) !important; color: #fff !important; border: none !important; }

        @media print {
          .xo-footer-actions, .xo-nav-row { display: none !important; }
          .xo-root { background: #fff; padding: 0; }
          .xo-card { box-shadow: none; border: none; }
        }

        @media (max-width: 640px) {
          .xo-card { padding: 32px 24px; border-radius: 12px; }
          .xo-index-number { font-size: 56px; }
          .xo-breakdown-name { width: 140px; font-size: 13px; }
          .xo-scale { gap: 6px; }
          .xo-scale-btn { padding: 10px 2px; border-radius: 8px; }
          .xo-scale-num { font-size: 18px; }
        }
      }</style>
"""
with open(r'C:\Users\Manoj\.gemini\antigravity\brain\61d1d81b-60d5-467c-8c62-11f28f95cac4\scratch\KILL-BUSYness\app\assessment\page.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(r'<style>\{(.*?)\}</style>', new_css, content, flags=re.DOTALL)

with open(r'C:\Users\Manoj\.gemini\antigravity\brain\61d1d81b-60d5-467c-8c62-11f28f95cac4\scratch\KILL-BUSYness\app\assessment\page.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
