import { useTour } from '../store';
import { TOUR_POINTS } from '../data/tour-points';

export function TourNav() {
  const hasStarted = useTour((s) => s.hasStarted);
  const currentPoint = useTour((s) => s.currentPoint);
  const isTransitioning = useTour((s) => s.isTransitioning);
  const goTo = useTour((s) => s.goTo);

  if (!hasStarted) return null;

  return (
    <nav
      style={{
        position: 'fixed',
        right: 40,
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        zIndex: 20,
        animation: 'fadeIn 1200ms ease 600ms both',
      }}
    >
      <div className="mono-ish" style={{ color: 'var(--paper-dim)', opacity: 0.5, marginBottom: 18, fontSize: 9, textAlign: 'right', letterSpacing: '0.32em' }}>
        TOUR
      </div>
      {TOUR_POINTS.map((p) => {
        const active = currentPoint === p.id;
        return (
          <button
            key={p.id}
            disabled={isTransitioning}
            onClick={() => goTo(p.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '9px 0',
              opacity: isTransitioning && !active ? 0.35 : 1,
              transition: 'opacity 280ms ease',
              cursor: isTransitioning ? 'wait' : 'pointer',
            }}
          >
            <span
              className="mono-ish"
              style={{
                color: active ? 'var(--gold)' : 'var(--paper-dim)',
                opacity: active ? 1 : 0.55,
                fontSize: 9,
                width: 22,
                transition: 'color 280ms ease',
              }}
            >
              {p.label}
            </span>
            <span
              style={{
                width: active ? 52 : 26,
                height: 1,
                background: active ? 'var(--gold)' : 'var(--paper-dim)',
                opacity: active ? 1 : 0.35,
                transition: 'all 400ms ease',
              }}
            />
            <span
              className="serif"
              style={{
                fontSize: 17,
                fontStyle: 'italic',
                color: active ? 'var(--paper)' : 'var(--paper-dim)',
                opacity: active ? 1 : 0.65,
                transition: 'color 280ms ease, opacity 280ms ease',
                minWidth: 150,
                textAlign: 'left',
              }}
            >
              {p.title}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
