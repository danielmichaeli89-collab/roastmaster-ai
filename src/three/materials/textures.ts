import * as THREE from 'three';

const cache = new Map<string, THREE.CanvasTexture>();

function makeTexture(key: string, size: number, draw: (ctx: CanvasRenderingContext2D, s: number) => void): THREE.CanvasTexture {
  const hit = cache.get(key);
  if (hit) return hit;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  draw(ctx, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 16;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  cache.set(key, tex);
  return tex;
}

function makeDataTexture(key: string, size: number, draw: (ctx: CanvasRenderingContext2D, s: number) => void): THREE.CanvasTexture {
  const hit = cache.get(key);
  if (hit) return hit;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  draw(ctx, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 16;
  tex.needsUpdate = true;
  cache.set(key, tex);
  return tex;
}

// Pseudo-random with deterministic seeding
function hash(x: number, y: number, seed: number) {
  const s = Math.sin(x * 12.9898 + y * 78.233 + seed * 43.2167) * 43758.5453;
  return s - Math.floor(s);
}

function fbm(x: number, y: number, octaves = 5, seed = 1) {
  let v = 0;
  let amp = 0.5;
  let freq = 1;
  for (let i = 0; i < octaves; i++) {
    v += amp * (hash(Math.floor(x * freq), Math.floor(y * freq), seed) * 2 - 1);
    freq *= 2;
    amp *= 0.5;
  }
  return v;
}

// ----- TEAL CERAMIC TILES (the splashback/feature tiles) -----
export function tealTiles(): { map: THREE.CanvasTexture; normal: THREE.CanvasTexture; rough: THREE.CanvasTexture } {
  const map = makeTexture('tealTiles-map', 1024, (ctx, S) => {
    // Grout base
    ctx.fillStyle = '#0a0c0c';
    ctx.fillRect(0, 0, S, S);
    const tilesPerSide = 8;
    const t = S / tilesPerSide;
    const groutHalf = 2;
    for (let i = 0; i < tilesPerSide; i++) {
      for (let j = 0; j < tilesPerSide; j++) {
        const x = i * t + groutHalf;
        const y = j * t + groutHalf;
        const w = t - groutHalf * 2;
        const h = t - groutHalf * 2;
        const v = (hash(i, j, 7) - 0.5) * 0.18;
        // Per-tile gradient for hand-glazed look
        const r = Math.floor(28 + v * 24);
        const g = Math.floor(52 + v * 30);
        const b = Math.floor(50 + v * 28);
        const grd = ctx.createLinearGradient(x, y, x + w, y + h);
        grd.addColorStop(0, `rgb(${r - 6},${g - 4},${b - 4})`);
        grd.addColorStop(0.5, `rgb(${r + 8},${g + 10},${b + 8})`);
        grd.addColorStop(1, `rgb(${r - 10},${g - 8},${b - 10})`);
        ctx.fillStyle = grd;
        ctx.fillRect(x, y, w, h);
        // Subtle glaze speckle
        for (let k = 0; k < 20; k++) {
          const sx = x + hash(i + k, j, 3) * w;
          const sy = y + hash(j + k, i, 5) * h;
          ctx.fillStyle = `rgba(255,255,255,${0.02 + hash(sx, sy, 1) * 0.04})`;
          ctx.fillRect(sx, sy, 1, 1);
        }
      }
    }
  });

  const normal = makeDataTexture('tealTiles-normal', 1024, (ctx, S) => {
    ctx.fillStyle = '#8080ff';
    ctx.fillRect(0, 0, S, S);
    const tilesPerSide = 8;
    const t = S / tilesPerSide;
    for (let i = 0; i < tilesPerSide; i++) {
      for (let j = 0; j < tilesPerSide; j++) {
        const x = i * t;
        const y = j * t;
        // Bevel: dark edges (sunken grout)
        const grd1 = ctx.createLinearGradient(x, y, x, y + 6);
        grd1.addColorStop(0, '#8080a8');
        grd1.addColorStop(1, '#8080ff');
        ctx.fillStyle = grd1;
        ctx.fillRect(x, y, t, 6);
        const grd2 = ctx.createLinearGradient(x, y + t - 6, x, y + t);
        grd2.addColorStop(0, '#8080ff');
        grd2.addColorStop(1, '#8080a8');
        ctx.fillStyle = grd2;
        ctx.fillRect(x, y + t - 6, t, 6);
        const grd3 = ctx.createLinearGradient(x, y, x + 6, y);
        grd3.addColorStop(0, '#a880ff');
        grd3.addColorStop(1, '#8080ff');
        ctx.fillStyle = grd3;
        ctx.fillRect(x, y, 6, t);
        const grd4 = ctx.createLinearGradient(x + t - 6, y, x + t, y);
        grd4.addColorStop(0, '#8080ff');
        grd4.addColorStop(1, '#5880ff');
        ctx.fillStyle = grd4;
        ctx.fillRect(x + t - 6, y, 6, t);
      }
    }
  });

  const rough = makeDataTexture('tealTiles-rough', 512, (ctx, S) => {
    // Tiles are glossy, grout matte
    ctx.fillStyle = '#cccccc';
    ctx.fillRect(0, 0, S, S);
    const tilesPerSide = 8;
    const t = S / tilesPerSide;
    for (let i = 0; i < tilesPerSide; i++) {
      for (let j = 0; j < tilesPerSide; j++) {
        const x = i * t + 1;
        const y = j * t + 1;
        const w = t - 2;
        const h = t - 2;
        // Vary glaze 0.18 - 0.32
        const r = 40 + (hash(i, j, 11) - 0.5) * 24;
        ctx.fillStyle = `rgb(${r},${r},${r})`;
        ctx.fillRect(x, y, w, h);
      }
    }
  });

  return { map, normal, rough };
}

// ----- WHITE OAK WOOD (vertical paneling, bar top, speaker boxes) -----
export function whiteOak(tone: 'light' | 'medium' | 'speaker' = 'light'): {
  map: THREE.CanvasTexture;
  normal: THREE.CanvasTexture;
  rough: THREE.CanvasTexture;
} {
  const base =
    tone === 'light'
      ? { r: 178, g: 142, b: 96 }
      : tone === 'medium'
        ? { r: 148, g: 110, b: 72 }
        : { r: 198, g: 158, b: 106 }; // speaker cabinet — warm honey oak

  const key = `oak-${tone}`;
  const map = makeTexture(`${key}-map`, 1024, (ctx, S) => {
    // Background base
    ctx.fillStyle = `rgb(${base.r},${base.g},${base.b})`;
    ctx.fillRect(0, 0, S, S);

    // Grain — long vertical streaks
    for (let i = 0; i < 240; i++) {
      const x = hash(i, 0, 2) * S;
      const length = S;
      const dark = hash(i, 1, 3);
      const intensity = 0.08 + dark * 0.16;
      const colorR = base.r * (1 - intensity);
      const colorG = base.g * (1 - intensity);
      const colorB = base.b * (1 - intensity);
      ctx.strokeStyle = `rgba(${colorR},${colorG},${colorB},${0.4 + dark * 0.4})`;
      ctx.lineWidth = 0.5 + hash(i, 2, 4) * 1.5;
      ctx.beginPath();
      let cx = x;
      for (let y = 0; y < length; y += 4) {
        cx += (hash(i, y, 5) - 0.5) * 1.6;
        ctx.lineTo(cx, y);
      }
      ctx.stroke();
    }

    // Knots and rays — occasional darker fibers
    for (let i = 0; i < 8; i++) {
      const cx = hash(i, 10, 6) * S;
      const cy = hash(i, 11, 7) * S;
      const r = 8 + hash(i, 12, 8) * 14;
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grd.addColorStop(0, `rgba(${base.r * 0.5},${base.g * 0.4},${base.b * 0.3},0.7)`);
      grd.addColorStop(0.6, `rgba(${base.r * 0.7},${base.g * 0.6},${base.b * 0.5},0.3)`);
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grd;
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    }

    // Soft tonal variation
    for (let i = 0; i < 3000; i++) {
      const x = hash(i, 30, 11) * S;
      const y = hash(i, 31, 12) * S;
      const v = (hash(i, 32, 13) - 0.5) * 0.06;
      const r = base.r * (1 + v);
      const g = base.g * (1 + v);
      const b = base.b * (1 + v);
      ctx.fillStyle = `rgba(${r},${g},${b},0.4)`;
      ctx.fillRect(x, y, 1, 1);
    }
  });

  const normal = makeDataTexture(`${key}-normal`, 1024, (ctx, S) => {
    ctx.fillStyle = '#8080ff';
    ctx.fillRect(0, 0, S, S);
    for (let i = 0; i < 240; i++) {
      const x = hash(i, 0, 2) * S;
      const w = 0.5 + hash(i, 2, 4) * 1.2;
      const dark = hash(i, 1, 3);
      const intensity = Math.floor(120 + dark * 50);
      ctx.strokeStyle = `rgba(${intensity},${intensity},255,0.6)`;
      ctx.lineWidth = w;
      ctx.beginPath();
      let cx = x;
      for (let y = 0; y < S; y += 4) {
        cx += (hash(i, y, 5) - 0.5) * 1.6;
        ctx.lineTo(cx, y);
      }
      ctx.stroke();
    }
  });

  const rough = makeDataTexture(`${key}-rough`, 512, (ctx, S) => {
    // Matte oak ~0.62 with grain variation
    const base = 158;
    ctx.fillStyle = `rgb(${base},${base},${base})`;
    ctx.fillRect(0, 0, S, S);
    for (let i = 0; i < 100; i++) {
      const x = hash(i, 50, 14) * S;
      const v = (hash(i, 51, 15) - 0.5) * 30;
      ctx.strokeStyle = `rgba(${base + v},${base + v},${base + v},0.5)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + (hash(i, 52, 16) - 0.5) * 6, S);
      ctx.stroke();
    }
  });

  return { map, normal, rough };
}

// ----- POLISHED BLUESTONE FLOOR -----
export function bluestone(): { map: THREE.CanvasTexture; normal: THREE.CanvasTexture; rough: THREE.CanvasTexture } {
  const map = makeTexture('blue-stone-map', 1024, (ctx, S) => {
    // Base
    ctx.fillStyle = '#1c1c1e';
    ctx.fillRect(0, 0, S, S);
    // 4 large tiles 2x2
    const tiles = 2;
    const t = S / tiles;
    const grout = 3;
    for (let i = 0; i < tiles; i++) {
      for (let j = 0; j < tiles; j++) {
        const x = i * t + grout;
        const y = j * t + grout;
        const w = t - grout * 2;
        const h = t - grout * 2;
        ctx.fillStyle = '#26262a';
        ctx.fillRect(x, y, w, h);
        // Stone speckle and veining
        for (let k = 0; k < 4000; k++) {
          const sx = x + hash(k, 0, i * 17 + j) * w;
          const sy = y + hash(k, 1, j * 17 + i) * h;
          const v = hash(k, 2, i + j) * 80;
          const c = 28 + v * 0.3;
          ctx.fillStyle = `rgba(${c},${c},${c + 4},${hash(k, 3, 0) * 0.4})`;
          ctx.fillRect(sx, sy, 1.2, 1.2);
        }
        // Veins
        for (let v = 0; v < 6; v++) {
          ctx.strokeStyle = `rgba(120,118,116,${0.1 + hash(v, i, j) * 0.15})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          let cx = x + hash(v, 0, 1) * w;
          let cy = y;
          ctx.moveTo(cx, cy);
          for (let s = 0; s < 60; s++) {
            cx += (hash(v, s, 2) - 0.5) * 8;
            cy += h / 60;
            ctx.lineTo(cx, cy);
          }
          ctx.stroke();
        }
      }
    }
  });
  const normal = makeDataTexture('blue-stone-normal', 1024, (ctx, S) => {
    ctx.fillStyle = '#8080ff';
    ctx.fillRect(0, 0, S, S);
    const tiles = 2;
    const t = S / tiles;
    const grout = 3;
    for (let i = 0; i < tiles; i++) {
      for (let j = 0; j < tiles; j++) {
        // Grout darker
        ctx.fillStyle = '#7060ff';
        ctx.fillRect(i * t, j * t, t, grout);
        ctx.fillRect(i * t, j * t, grout, t);
      }
    }
  });
  const rough = makeDataTexture('blue-stone-rough', 512, (ctx, S) => {
    // Polished: low roughness, slight variance
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(0, 0, S, S);
    for (let i = 0; i < 2000; i++) {
      const x = hash(i, 0, 0) * S;
      const y = hash(i, 1, 0) * S;
      ctx.fillStyle = `rgba(255,255,255,${hash(i, 2, 0) * 0.06})`;
      ctx.fillRect(x, y, 1, 1);
    }
  });
  return { map, normal, rough };
}

// ----- BRUSHED METAL (brass / steel) -----
export function brushedMetal(color: 'brass' | 'steel' = 'brass'): {
  map: THREE.CanvasTexture;
  rough: THREE.CanvasTexture;
} {
  const base = color === 'brass' ? { r: 180, g: 148, b: 88 } : { r: 158, g: 158, b: 162 };
  const key = `metal-${color}`;
  const map = makeTexture(`${key}-map`, 512, (ctx, S) => {
    ctx.fillStyle = `rgb(${base.r},${base.g},${base.b})`;
    ctx.fillRect(0, 0, S, S);
    // Horizontal brush strokes
    for (let y = 0; y < S; y++) {
      const variance = (hash(0, y, 3) - 0.5) * 24;
      ctx.fillStyle = `rgba(${base.r + variance},${base.g + variance * 0.9},${base.b + variance * 0.6},0.45)`;
      ctx.fillRect(0, y, S, 1);
    }
  });
  const rough = makeDataTexture(`${key}-rough`, 256, (ctx, S) => {
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(0, 0, S, S);
    for (let y = 0; y < S; y++) {
      ctx.fillStyle = `rgba(255,255,255,${hash(0, y, 4) * 0.2})`;
      ctx.fillRect(0, y, S, 1);
    }
  });
  return { map, rough };
}

// ----- BLACK ACOUSTIC FABRIC (speaker grilles, chair upholstery) -----
export function acousticFabric(color: 'black' | 'grey' = 'black'): {
  map: THREE.CanvasTexture;
  rough: THREE.CanvasTexture;
} {
  const base = color === 'black' ? 12 : 78;
  const key = `fabric-${color}`;
  const map = makeTexture(`${key}-map`, 256, (ctx, S) => {
    ctx.fillStyle = `rgb(${base},${base},${base})`;
    ctx.fillRect(0, 0, S, S);
    // Tight weave - lots of dots
    for (let x = 0; x < S; x += 2) {
      for (let y = 0; y < S; y += 2) {
        const v = hash(x, y, 9);
        const c = base + (v - 0.5) * 14;
        ctx.fillStyle = `rgb(${c},${c},${c})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
    // Subtle weave pattern
    for (let y = 0; y < S; y += 4) {
      ctx.fillStyle = `rgba(0,0,0,0.15)`;
      ctx.fillRect(0, y, S, 1);
    }
    for (let x = 0; x < S; x += 4) {
      ctx.fillStyle = `rgba(0,0,0,0.1)`;
      ctx.fillRect(x, 0, 1, S);
    }
  });
  const rough = makeDataTexture(`${key}-rough`, 128, () => {});
  // Fabric is rough
  const canvas = (rough.image as HTMLCanvasElement);
  const c = canvas.getContext('2d')!;
  c.fillStyle = '#e0e0e0';
  c.fillRect(0, 0, canvas.width, canvas.height);
  rough.needsUpdate = true;
  return { map, rough };
}

// ----- INK PLASTER / CEILING -----
export function inkPlaster(): { map: THREE.CanvasTexture } {
  const map = makeTexture('inkPlaster', 512, (ctx, S) => {
    ctx.fillStyle = '#0e0e0f';
    ctx.fillRect(0, 0, S, S);
    for (let i = 0; i < 4000; i++) {
      const x = hash(i, 0, 22) * S;
      const y = hash(i, 1, 23) * S;
      const v = (hash(i, 2, 24) - 0.5) * 16;
      const c = Math.floor(14 + v);
      ctx.fillStyle = `rgba(${c},${c},${c + 1},${hash(i, 3, 0) * 0.5})`;
      ctx.fillRect(x, y, 1.4, 1.4);
    }
  });
  return { map };
}
