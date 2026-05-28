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
          left: 40,
          bottom: 40,
          maxWidth: 460,
          color: 'var(--paper)',
          zIndex: 18,
          opacity: showInfo ? (isTransitioning ? 0.3 : 1) : 0,
          pointerEvents: showInfo ? 'auto' : 'none',
          transition: 'opacity 580ms ease',
          animation: 'fadeIn 800ms ease',
          textAlign: 'left',
          direction: 'ltr',
        }}
      >
        <div className="mono-ish" style={{ color: 'var(--gold)', opacity: 0.7, marginBottom: 14 }}>
          {pt.label} · {pt.subtitleEn}
        </div>
        <h2
          className="serif"
          style={{
            fontSize: 64,
            fontStyle: 'italic',
            margin: 0,
            lineHeight: 0.95,
            fontWeight: 300,
            letterSpacing: '0.01em',
            color: 'var(--paper)',
          }}
        >
          {pt.titleEn}
        </h2>
        <div
          className="serif"
          style={{
            fontSize: 22,
            fontStyle: 'italic',
            color: 'var(--paper-dim)',
            margin: '10px 0 18px',
            direction: 'rtl',
            textAlign: 'right',
            fontWeight: 300,
          }}
        >
          {pt.titleHe}
        </div>

        <p
          style={{
            fontSize: 13,
            lineHeight: 1.75,
            color: 'var(--paper-dim)',
            margin: 0,
            maxWidth: 420,
            fontWeight: 300,
          }}
        >
          {pt.descriptionEn}
        </p>
        <p
          style={{
            fontSize: 13,
            lineHeight: 1.75,
            color: 'var(--paper-dim)',
            margin: '12px 0 0',
            maxWidth: 420,
            direction: 'rtl',
            textAlign: 'right',
            opacity: 0.85,
            fontWeight: 300,
          }}
        >
          {pt.descriptionHe}
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 12,
            marginTop: 24,
            padding: '16px 0 0',
            borderTop: '1px solid rgba(232,227,216,0.1)',
          }}
        >
          {pt.details.map((d) => (
            <div key={d.label}>
              <div className="mono-ish" style={{ opacity: 0.5, fontSize: 8, marginBottom: 4 }}>
                {d.label}
              </div>
              <div className="serif" style={{ fontSize: 13, color: 'var(--paper)', fontStyle: 'italic', fontWeight: 300 }}>
                {d.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hide/show toggle */}
      <button
        onClick={toggleInfo}
        style={{
          position: 'fixed',
          left: 40,
          top: 40,
          zIndex: 19,
          color: 'var(--paper-dim)',
          opacity: 0.6,
          fontSize: 10,
          letterSpacing: '0.24em',
          textTransform: 'uppercase',
          padding: 8,
        }}
        className="mono-ish"
      >
        {showInfo ? '— hide info' : '+ show info'}
      </button>
    </>
  );
}
