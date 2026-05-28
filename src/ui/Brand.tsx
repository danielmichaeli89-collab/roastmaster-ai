import { useTour } from '../store';

export function Brand() {
  const hasStarted = useTour((s) => s.hasStarted);
  if (!hasStarted) return null;

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 40,
          right: 40,
          zIndex: 18,
          textAlign: 'right',
          animation: 'fadeIn 1200ms ease 400ms both',
          direction: 'ltr',
        }}
      >
        <div
          className="serif"
          style={{
            fontSize: 28,
            fontStyle: 'italic',
            color: 'var(--paper)',
            letterSpacing: '0.02em',
            lineHeight: 0.95,
            fontWeight: 300,
          }}
        >
          Nocturne
        </div>
        <div className="mono-ish" style={{ color: 'var(--gold)', opacity: 0.7, marginTop: 4 }}>
          virtual tour · 01
        </div>
      </div>
      <div
        style={{
          position: 'fixed',
          bottom: 28,
          right: 40,
          zIndex: 18,
          animation: 'fadeIn 1200ms ease 800ms both',
          direction: 'ltr',
        }}
      >
        <div className="mono-ish" style={{ color: 'var(--paper-dim)', opacity: 0.4, fontSize: 9, lineHeight: 1.8, textAlign: 'right' }}>
          <div>2.85 m ceiling · 80 m²</div>
          <div>seats 18 · vinyl-only · 2700K</div>
        </div>
      </div>
    </>
  );
}
