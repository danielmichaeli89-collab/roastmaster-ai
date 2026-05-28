import { useTour } from '../store';
import { getTourPoint } from '../data/tour-points';

export function InfoPanel() {
  const hasStarted = useTour((s) => s.hasStarted);
  const currentPoint = useTour((s) => s.currentPoint);
  const showInfo = useTour((s) => s.showInfo);
  const toggleInfo = useTour((s) => s.toggleInfo);
  const isTransitioning = useTour((s) => s.isTransitioning);

  if (!hasStarted) return null;

  const pt = getTourPoint(currentPoint);

  return (
    <>
      <div
        key={pt.id}
        style={{
          position: 'fixed',
          left: 48,
          bottom: 48,
          maxWidth: 440,
          color: 'var(--paper)',
          zIndex: 18,
          opacity: showInfo ? (isTransitioning ? 0.35 : 1) : 0,
          pointerEvents: showInfo ? 'auto' : 'none',
          transition: 'opacity 600ms ease',
          animation: 'fadeIn 900ms ease',
          textAlign: 'left',
        }}
      >
        <div className="mono-ish" style={{ color: 'var(--gold)', opacity: 0.75, marginBottom: 14 }}>
          {pt.label} · {pt.subtitle}
        </div>
        <h2
          className="serif"
          style={{
            fontSize: 64,
            fontStyle: 'italic',
            margin: 0,
            lineHeight: 0.95,
            fontWeight: 300,
            letterSpacing: '0.005em',
            color: 'var(--paper)',
          }}
        >
          {pt.title}
        </h2>

        <p
          style={{
            fontSize: 13,
            lineHeight: 1.75,
            color: 'var(--paper-dim)',
            margin: '20px 0 0',
            maxWidth: 420,
            fontWeight: 300,
          }}
        >
          {pt.description}
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 14,
            marginTop: 24,
            padding: '16px 0 0',
            borderTop: '1px solid rgba(232,227,216,0.1)',
          }}
        >
          {pt.details.map((d) => (
            <div key={d.label}>
              <div className="mono-ish" style={{ opacity: 0.5, fontSize: 8.5, marginBottom: 5 }}>
                {d.label}
              </div>
              <div className="serif" style={{ fontSize: 13, color: 'var(--paper)', fontStyle: 'italic', fontWeight: 300, lineHeight: 1.3 }}>
                {d.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={toggleInfo}
        style={{
          position: 'fixed',
          left: 48,
          top: 48,
          zIndex: 19,
          color: 'var(--paper-dim)',
          opacity: 0.55,
          fontSize: 9.5,
          letterSpacing: '0.32em',
          textTransform: 'uppercase',
          padding: 8,
        }}
        className="mono-ish"
      >
        {showInfo ? '— hide' : '+ info'}
      </button>
    </>
  );
}
