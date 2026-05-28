import { Scene } from './three/Scene';
import { Loading } from './ui/Loading';
import { TourNav } from './ui/TourNav';
import { InfoPanel } from './ui/InfoPanel';
import { Brand } from './ui/Brand';

export default function App() {
  return (
    <main style={{ position: 'fixed', inset: 0, overflow: 'hidden', background: '#070707' }}>
      <Scene />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 10,
          background:
            'radial-gradient(ellipse 130% 100% at center, transparent 60%, rgba(0,0,0,0.18) 100%)',
        }}
      />
      <FilmGrain />
      <Brand />
      <TourNav />
      <InfoPanel />
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
        opacity: 0.035,
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
