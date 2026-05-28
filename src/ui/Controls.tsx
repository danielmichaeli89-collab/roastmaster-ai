import { useTour } from '../store';

export function Controls() {
  const hasStarted = useTour((s) => s.hasStarted);
  const cinematicMode = useTour((s) => s.cinematicMode);
  const quality = useTour((s) => s.qualityTier);
  const toggleCinematic = useTour((s) => s.toggleCinematic);
  const setQuality = useTour((s) => s.setQuality);

  if (!hasStarted) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 40,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 24,
        alignItems: 'center',
        zIndex: 19,
        animation: 'fadeIn 1200ms ease 1000ms both',
        background: 'rgba(10,10,10,0.42)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(232,227,216,0.08)',
        padding: '10px 22px',
        borderRadius: 999,
      }}
    >
      <ControlButton
        active={cinematicMode}
        onClick={toggleCinematic}
        label="Cinematic"
        hint={cinematicMode ? 'On' : 'Off'}
      />
      <Divider />
      <ControlButton
        active={quality === 'high'}
        onClick={() => setQuality(quality === 'high' ? 'medium' : 'high')}
        label="Quality"
        hint={quality === 'high' ? 'High' : 'Med'}
      />
    </div>
  );
}

function ControlButton({ active, onClick, label, hint }: { active: boolean; onClick: () => void; label: string; hint: string }) {
  return (
    <button
      onClick={onClick}
      className="mono-ish"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        padding: '4px 12px',
        color: active ? 'var(--gold)' : 'var(--paper-dim)',
        opacity: active ? 1 : 0.65,
        transition: 'color 240ms ease, opacity 240ms ease',
        fontSize: 9,
      }}
    >
      <span style={{ opacity: 0.7 }}>{label}</span>
      <span style={{ fontSize: 10, letterSpacing: '0.18em' }}>{hint}</span>
    </button>
  );
}

function Divider() {
  return <div style={{ width: 1, height: 28, background: 'rgba(232,227,216,0.12)' }} />;
}
