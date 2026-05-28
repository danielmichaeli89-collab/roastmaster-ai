import { useEffect, useState } from 'react';
import { useTour } from '../store';

export function Loading() {
  const isLoaded = useTour((s) => s.isLoaded);
  const hasStarted = useTour((s) => s.hasStarted);
  const start = useTour((s) => s.start);
  const [progress, setProgress] = useState(0);
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    setProgress(100);
  }, [isLoaded]);

  useEffect(() => {
    if (isLoaded) return;
    const i = setInterval(() => {
      setProgress((p) => Math.min(96, p + Math.random() * 4 + 1.6));
    }, 90);
    return () => clearInterval(i);
  }, [isLoaded]);

  useEffect(() => {
    if (!hasStarted) return;
    const t = setTimeout(() => setShow(false), 950);
    return () => clearTimeout(t);
  }, [hasStarted]);

  if (!show) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        background: 'radial-gradient(ellipse at center, #2a2520 0%, #1a1815 90%)',
        color: 'var(--paper)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 32,
        opacity: hasStarted ? 0 : 1,
        transition: 'opacity 800ms ease',
        pointerEvents: hasStarted ? 'none' : 'auto',
        backdropFilter: 'blur(2px)',
      }}
    >
      <BackgroundVinyl />

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, zIndex: 2 }}>
        <div className="mono-ish" style={{ color: 'var(--gold)', opacity: 0.7 }}>
          MMXXVI · ESPRESSO & VINYL
        </div>
        <h1
          className="serif"
          style={{
            fontSize: 'clamp(64px, 12vw, 168px)',
            fontStyle: 'italic',
            letterSpacing: '0.02em',
            lineHeight: 0.95,
            background: 'linear-gradient(180deg, #f3ead8 0%, #b89860 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: 0,
            fontWeight: 300,
          }}
        >
          Nocturne
        </h1>
        <div
          className="mono-ish"
          style={{
            color: 'var(--paper-dim)',
            letterSpacing: '0.32em',
            opacity: 0.7,
            fontSize: 11,
            marginTop: 8,
          }}
        >
          SPECIALTY COFFEE · COCKTAILS · VINYL
        </div>
      </div>

      <div style={{ width: 320, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', zIndex: 2 }}>
        <div className="mono-ish" style={{ opacity: 0.5, fontSize: 10 }}>
          {isLoaded ? 'READY' : 'PREPARING TOUR'} · {Math.floor(progress)}%
        </div>
        <div style={{ width: '100%', height: 1, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, transparent, var(--gold), transparent)',
              transition: 'width 240ms ease',
            }}
          />
        </div>
      </div>

      {isLoaded && (
        <button
          onClick={start}
          style={{
            marginTop: 16,
            padding: '14px 36px',
            border: '1px solid var(--gold)',
            color: 'var(--gold)',
            background: 'rgba(20,19,15,0.4)',
            backdropFilter: 'blur(6px)',
            letterSpacing: '0.32em',
            textTransform: 'uppercase',
            fontSize: 12,
            fontWeight: 400,
            cursor: 'pointer',
            position: 'relative',
            zIndex: 2,
            transition: 'all 240ms ease',
            animation: 'fadeIn 800ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--gold)';
            e.currentTarget.style.color = 'var(--ink)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(20,19,15,0.4)';
            e.currentTarget.style.color = 'var(--gold)';
          }}
        >
          Enter
        </button>
      )}

      <div
        className="mono-ish"
        style={{
          position: 'absolute',
          bottom: 32,
          right: 32,
          opacity: 0.45,
          textAlign: 'right',
          fontSize: 9,
          lineHeight: 1.8,
          zIndex: 2,
        }}
      >
        <div>360° virtual tour</div>
        <div>Drag to look · scroll to zoom</div>
      </div>
    </div>
  );
}

function BackgroundVinyl() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.18,
        overflow: 'hidden',
        zIndex: 1,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: '120vmax',
          height: '120vmax',
          marginLeft: '-60vmax',
          marginTop: '-60vmax',
          borderRadius: '50%',
          background:
            'repeating-radial-gradient(circle, transparent 0, transparent 6px, rgba(216,184,134,0.04) 6px, rgba(216,184,134,0.04) 7px)',
          animation: 'spin 60s linear infinite',
        }}
      />
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
