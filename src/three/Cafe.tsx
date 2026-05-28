import { Shell } from './components/Shell';
import { Bar } from './components/Bar';
import { SpeakerWall } from './components/SpeakerWall';
import { Dining } from './components/Dining';
import { Booth } from './components/Booth';
import { TrackLighting, AmbientLighting } from './components/Lighting';

export function Cafe() {
  return (
    <group>
      <AmbientLighting />
      <Shell />
      <Bar />
      <SpeakerWall />
      <Dining />
      <Booth />
      <TrackLighting />

      {/* A few floor-shadow softeners */}
      <mesh position={[-2.0, 0.001, -3.0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5.5, 1.5]} />
        <shadowMaterial transparent opacity={0.35} />
      </mesh>
    </group>
  );
}
