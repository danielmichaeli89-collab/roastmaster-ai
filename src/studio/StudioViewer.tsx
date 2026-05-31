/**
 * Nocture Studio Viewer — the production presentation shell.
 *
 * Built to match the mockup: floorplan + zones rail on the left, scene hero in
 * the middle with overlay hotspots, equipment / lighting / hotspots / materials
 * rail on the right, scene filmstrip on the bottom.
 *
 * The hero images come from blender/out (committed to /public/scenes/).
 * If an image is missing, a graceful placeholder is shown instead.
 */
import { useState, useMemo, useRef, useEffect } from 'react';
import { SCENES, LIGHTING_MODES, MATERIAL_PALETTE } from '../data/scenes';
import type { Scene, SceneId, LightingMode, Hotspot as HotspotT, EquipmentItem } from '../data/scenes';

export function StudioViewer() {
  const [activeId, setActiveId] = useState<SceneId>('main_coffee_bar');
  const [activeEquipment, setActiveEquipment] = useState<string | null>(null);
  const [lighting, setLighting] = useState<LightingMode>('service');
  const [intensity, setIntensity] = useState(78);
  const [presentation, setPresentation] = useState(true);

  const scene = useMemo<Scene>(() => SCENES.find((s) => s.id === activeId) ?? SCENES[1], [activeId]);
  const equipment = scene.equipment[0] ?? null;
  const inspector = useMemo(() => scene.equipment.find((e) => e.id === activeEquipment) ?? equipment, [scene, activeEquipment, equipment]);

  // Reset equipment focus when the scene changes
  useEffect(() => { setActiveEquipment(scene.equipment[0]?.id ?? null); }, [scene.id]);

  return (
    <div className="studio">
      <Header presentation={presentation} setPresentation={setPresentation} />

      <main className="grid">
        <LeftRail scene={scene} onPickScene={setActiveId} />
        <Stage scene={scene} />
        <RightRail
          scene={scene}
          inspector={inspector}
          activeEquipment={activeEquipment}
          setActiveEquipment={setActiveEquipment}
          lighting={lighting}
          setLighting={setLighting}
          intensity={intensity}
          setIntensity={setIntensity}
        />
      </main>

      <Filmstrip activeId={activeId} onPickScene={setActiveId} />
    </div>
  );
}

// ----------------------------------------------------------------------------- Header
function Header({ presentation, setPresentation }: { presentation: boolean; setPresentation: (v: boolean) => void }) {
  return (
    <header className="studio-header">
      <div className="brand">
        <div className="wordmark">NOCTURE</div>
        <div className="divider" />
        <div className="version">STUDIO VIEWER v0.2</div>
      </div>
      <div className="header-center">
        <span className="dim">4m × 7m</span>
        <span className="sep">│</span>
        <span className="dim italic">PREMIUM COFFEE BAR &amp; AUDIOPHILE ROOM</span>
      </div>
      <div className="header-actions">
        <span className="dim">PRESENTATION MODE</span>
        <button
          aria-pressed={presentation}
          onClick={() => setPresentation(!presentation)}
          className={`toggle ${presentation ? 'on' : ''}`}
        >
          <span className="dot" />
        </button>
        <button className="icon-btn" aria-label="fullscreen">⛶</button>
        <button className="icon-btn" aria-label="menu">≡</button>
      </div>
    </header>
  );
}

// ----------------------------------------------------------------------------- Left rail
function LeftRail({ scene, onPickScene }: { scene: Scene; onPickScene: (id: SceneId) => void }) {
  return (
    <aside className="left-rail">
      <section className="card floorplan">
        <div className="card-head">
          <span className="card-eyebrow">FLOORPLAN</span>
          <span className="dim">4m × 7m</span>
        </div>
        <Floorplan activeId={scene.id} onPick={onPickScene} />
      </section>

      <section className="card zones">
        <div className="card-eyebrow">ZONES</div>
        <ul className="zone-list">
          {SCENES.map((s) => (
            <li key={s.id}>
              <button onClick={() => onPickScene(s.id)} className={`zone-row ${s.id === scene.id ? 'active' : ''}`}>
                <span className={`zone-dot ${s.id === scene.id ? 'on' : ''}`} />
                <span className="zone-label">{s.label.toUpperCase()}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}

function Floorplan({ activeId, onPick }: { activeId: SceneId; onPick: (id: SceneId) => void }) {
  // SVG schematic of the 4m × 7m space, with click-targets for each scene.
  // Coordinate system: viewBox 0 0 100 175 (close to 4:7 proportion)
  const zones: Array<{ id: SceneId; box: [number, number, number, number]; label: string }> = [
    { id: 'audiophile_wall', box: [10, 8,   80, 28],  label: 'AUDIOPHILE WALL' },
    { id: 'brew_lab',        box: [62, 40,  28, 20],  label: 'BREW LAB' },
    { id: 'main_coffee_bar', box: [62, 60,  28, 50],  label: '' },
    { id: 'seating_wall',    box: [10, 50,  40, 70],  label: 'SEATING WALL' },
    { id: 'equipment_hero',  box: [62, 78,  28, 14],  label: '' },
    { id: 'operator',        box: [62, 100, 28, 14],  label: '' },
    { id: 'entrance',        box: [30, 150, 40, 18],  label: '' },
  ];
  return (
    <svg viewBox="0 0 100 175" className="floorplan-svg" preserveAspectRatio="xMidYMid meet">
      <rect x="6" y="4" width="88" height="167" fill="none" stroke="rgba(196,160,90,0.35)" strokeWidth="0.6" />
      {/* faint inner grid */}
      <g stroke="rgba(196,160,90,0.08)" strokeWidth="0.3">
        {[20,40,60,80,100,120,140,160].map((y) => (<line key={y} x1="6" x2="94" y1={y} y2={y} />))}
        {[20,40,60,80].map((x) => (<line key={x} y1="4" y2="171" x1={x} x2={x} />))}
      </g>
      {zones.map((z) => {
        const [x, y, w, h] = z.box;
        const active = z.id === activeId;
        return (
          <g key={z.id} className={active ? 'zn active' : 'zn'} onClick={() => onPick(z.id)}>
            <rect x={x} y={y} width={w} height={h} rx={1} className="zone-fill" />
            {z.label && (
              <text x={x + w / 2} y={y + h / 2 + 1.5} textAnchor="middle" className="zone-text">
                {z.label}
              </text>
            )}
          </g>
        );
      })}
      {/* highlight cone for active scene (centre, narrow beam) */}
      <g className="active-cone">
        <polygon points="50,72 28,135 72,135" fill="rgba(216,178,108,0.13)" />
        <circle cx="50" cy="72" r="2.4" fill="rgba(216,178,108,0.9)" />
      </g>
    </svg>
  );
}

// ----------------------------------------------------------------------------- Stage
function Stage({ scene }: { scene: Scene }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [imgOk, setImgOk] = useState(true);
  // pan: -1..1 across the over-scanned hero; zoom: 1..2
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1.08);
  const drag = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => { setImgOk(true); setPan({ x: 0, y: 0 }); setZoom(1.08); }, [scene.id]);

  const onDown = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const dx = (e.clientX - drag.current.x) / (frameRef.current?.clientWidth ?? 1);
    const dy = (e.clientY - drag.current.y) / (frameRef.current?.clientHeight ?? 1);
    drag.current = { x: e.clientX, y: e.clientY };
    setPan((p) => ({
      x: Math.max(-1, Math.min(1, p.x + dx * 2)),
      y: Math.max(-1, Math.min(1, p.y + dy * 2)),
    }));
  };
  const onUp = () => { drag.current = null; };
  const onWheel = (e: React.WheelEvent) => {
    setZoom((z) => Math.max(1, Math.min(2.2, z - e.deltaY * 0.0012)));
  };

  // translate pan into image offset; the extra zoom gives room to move
  const tx = pan.x * (zoom - 1) * -38;
  const ty = pan.y * (zoom - 1) * -32;

  return (
    <section className="stage">
      <div
        className="stage-frame"
        ref={frameRef}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
        onWheel={onWheel}
      >
        {imgOk ? (
          <img
            src={scene.hero}
            alt={scene.title}
            className="hero-img"
            draggable={false}
            style={{ transform: `scale(${zoom}) translate(${tx}px, ${ty}px)` }}
            onError={() => setImgOk(false)}
          />
        ) : (
          <Placeholder scene={scene} />
        )}
        {scene.hotspots.map((h, i) => (
          <Hotspot key={i} h={h} pan={pan} zoom={zoom} />
        ))}
        <div className="hint">
          <span className="hint-icon">⌖</span>
          <div className="hint-text">
            <div>DRAG TO LOOK AROUND</div>
            <div>SCROLL TO ZOOM</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Hotspot({ h, pan, zoom }: { h: HotspotT; pan: { x: number; y: number }; zoom: number }) {
  const [open, setOpen] = useState(false);
  // mirror the image transform so pins stay glued to features
  const tx = pan.x * (zoom - 1) * -38;
  const ty = pan.y * (zoom - 1) * -32;
  const left = 50 + (h.x * 100 - 50) * zoom + tx;
  const top = 50 + (h.y * 100 - 50) * zoom + ty;
  return (
    <button
      className={`hotspot ${open ? 'open' : ''}`}
      style={{ left: `${left}%`, top: `${top}%` }}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={() => setOpen((v) => !v)}
    >
      <span className="hot-ring" />
      <span className="hot-plus">+</span>
      {open && (
        <span className="hot-card" onClick={(e) => e.stopPropagation()}>
          <span className="hot-title">{h.title}</span>
          <span className="hot-body">{h.body}</span>
        </span>
      )}
    </button>
  );
}

function Placeholder({ scene }: { scene: Scene }) {
  return (
    <div className="placeholder">
      <div className="ph-title serif italic">{scene.title}</div>
      <div className="ph-sub">{scene.subtitle.toUpperCase()}</div>
      <div className="ph-foot mono">RENDERING IN PROGRESS · CYCLES</div>
    </div>
  );
}

// ----------------------------------------------------------------------------- Right rail
function RightRail(props: {
  scene: Scene;
  inspector: EquipmentItem | null;
  activeEquipment: string | null;
  setActiveEquipment: (id: string | null) => void;
  lighting: LightingMode;
  setLighting: (m: LightingMode) => void;
  intensity: number;
  setIntensity: (n: number) => void;
}) {
  const { scene, inspector, activeEquipment, setActiveEquipment, lighting, setLighting, intensity, setIntensity } = props;

  return (
    <aside className="right-rail">
      {/* SCENE */}
      <section className="card">
        <div className="card-eyebrow">SCENE</div>
        <h2 className="scene-title">{scene.title.toUpperCase()}</h2>
        <p className="scene-desc">{scene.description}</p>
        <div className="kv-row"><span className="dim">CAMERA</span><span className="ital">{scene.camera}</span></div>
        <div className="kv-row"><span className="dim">OVERVIEW</span><span>{scene.order} of {SCENES.length}</span></div>
      </section>

      {/* EQUIPMENT INSPECTOR */}
      {scene.equipment.length > 0 && (
        <section className="card">
          <div className="card-eyebrow">EQUIPMENT INSPECTOR</div>
          <div className="equip-row">
            {scene.equipment.map((e) => (
              <button
                key={e.id}
                onClick={() => setActiveEquipment(e.id)}
                className={`equip-thumb ${activeEquipment === e.id ? 'on' : ''}`}
                title={e.name}
              >
                <span className="equip-tile" />
              </button>
            ))}
          </div>
          {inspector && (
            <>
              <h3 className="equip-name">{inspector.name.toUpperCase()}</h3>
              <p className="equip-desc">{inspector.oneLiner}</p>
              <div className="kv-row"><span className="dim">ROLE</span><span>{inspector.role.toUpperCase()}</span></div>
              <div className="kv-row"><span className="dim">POSITION</span><span>{inspector.position.toUpperCase()}</span></div>
              <button className="ghost-btn">VIEW DETAILS</button>
            </>
          )}
        </section>
      )}

      {/* LIGHTING MODES */}
      <section className="card">
        <div className="card-eyebrow">LIGHTING MODES</div>
        <div className="lighting-grid">
          {LIGHTING_MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setLighting(m.id)}
              className={`lmode ${lighting === m.id ? 'on' : ''}`}
            >
              <span className="lmode-icon">{m.icon}</span>
              <span className="lmode-label">{m.label.toUpperCase()}</span>
            </button>
          ))}
        </div>
        <div className="intensity">
          <span className="dim">INTENSITY</span>
          <input
            type="range" min={0} max={100} value={intensity}
            onChange={(e) => setIntensity(Number(e.currentTarget.value))}
            className="range"
          />
          <span className="num">{intensity}%</span>
        </div>
      </section>

      {/* HOTSPOTS */}
      {scene.hotspots.length > 0 && (
        <section className="card">
          <div className="card-eyebrow">HOTSPOTS</div>
          <ul className="hotspot-list">
            {scene.hotspots.map((h, i) => (
              <li key={i}><span className="hot-num">{String(i + 1).padStart(2, '0')}</span><span>{h.title.toUpperCase()}</span><span className="eye">◉</span></li>
            ))}
          </ul>
        </section>
      )}

      {/* MATERIAL PALETTE */}
      <section className="card">
        <div className="card-eyebrow">MATERIAL PALETTE</div>
        <div className="palette">
          {MATERIAL_PALETTE.map((m) => (
            <div key={m.id} className="swatch" title={m.name} style={{ background: m.swatch }} />
          ))}
        </div>
      </section>

      {/* MOOD GALLERY */}
      <section className="card">
        <div className="card-eyebrow">MOOD GALLERY</div>
        <div className="mood">
          {SCENES.slice(0, 4).map((s) => (
            <img key={s.id} src={s.thumb} alt={s.title} className="mood-img" onError={(e) => (e.currentTarget.style.opacity = '0.18')} />
          ))}
        </div>
      </section>
    </aside>
  );
}

// ----------------------------------------------------------------------------- Filmstrip
function Filmstrip({ activeId, onPickScene }: { activeId: SceneId; onPickScene: (id: SceneId) => void }) {
  return (
    <nav className="filmstrip">
      <button className="film-arrow" aria-label="previous">‹</button>
      <ul>
        {SCENES.map((s) => (
          <li key={s.id} className={s.id === activeId ? 'on' : ''}>
            <button onClick={() => onPickScene(s.id)} className="film-cell">
              <span className="film-thumb">
                <img src={s.thumb} alt="" onError={(e) => (e.currentTarget.style.opacity = '0.15')} />
              </span>
              <span className="film-label">{s.label.toUpperCase()}</span>
            </button>
          </li>
        ))}
      </ul>
      <button className="film-arrow" aria-label="next">›</button>
    </nav>
  );
}
