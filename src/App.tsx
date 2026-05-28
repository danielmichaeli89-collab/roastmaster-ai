import { Scene } from './three/Scene';
import { Loading } from './ui/Loading';
import { TourNav } from './ui/TourNav';
import { InfoPanel } from './ui/InfoPanel';
import { Brand } from './ui/Brand';
import { Controls } from './ui/Controls';

export default function App() {
  return (
    <main style={{ position: 'fixed', inset: 0, overflow: 'hidden', background: '#070707' }}>
      <Scene />
      {/* Subtle edge fall-off; the heavy lifting is done by the postFX Vignette */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 10,
          background:
            'radial-gradient(ellipse 120% 90% at center, transparent 50%, rgba(0,0,0,0.2) 100%)',
        }}
      />

      {/* Grain overlay - subtle film grain for photographic realism */}
      <FilmGrain />

      <Brand />
      <TourNav />
      <InfoPanel />
      <Controls />
      <Loading />
    </main>
  );
}

function FilmGrain() {
  return (
    <svg
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 12,
        opacity: 0.05,
        mixBlendMode: 'overlay',
      }}
    >
      <filter id="noiseFilter">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noiseFilter)" />
    </svg>
  );
}
