// Studio Viewer scene catalogue.
// Each entry pairs a Cycles-rendered hero image (under /public/scenes/) with the
// metadata shown in the right rail (description, equipment inspector, hotspots,
// material palette). When a render is missing, the viewer falls back to the
// placeholder gradient defined in StudioViewer.

export type SceneId =
  | 'entrance'
  | 'main_coffee_bar'
  | 'equipment_hero'
  | 'brew_lab'
  | 'seating_wall'
  | 'audiophile_wall'
  | 'operator';

export interface Hotspot {
  /** 0..1 normalised x within the hero image */
  x: number;
  /** 0..1 normalised y within the hero image */
  y: number;
  title: string;
  body: string;
}

export interface EquipmentItem {
  id: string;
  name: string;
  oneLiner: string;
  role: string;
  position: string;
}

export interface Scene {
  id: SceneId;
  label: string;
  order: number;
  title: string;
  subtitle: string;
  description: string;
  hero: string;          // /scenes/<id>.jpg
  thumb: string;         // smaller version
  camera: string;
  /** Equipment that should be available in the inspector for this scene */
  equipment: EquipmentItem[];
  hotspots: Hotspot[];
}

export const EQUIPMENT: Record<string, EquipmentItem> = {
  strada: {
    id: 'strada',
    name: 'La Marzocco Strada XI',
    oneLiner: 'Dual boiler espresso machine. Iconic performance and engineering.',
    role: 'Espresso Anchor',
    position: 'Center of Bar',
  },
  mythos: {
    id: 'mythos',
    name: 'Victoria Arduino Mythos One',
    oneLiner: 'Single-dose espresso grinder with clima-pro temperature control.',
    role: 'Espresso Grinder',
    position: 'Right of Strada',
  },
  ek43: {
    id: 'ek43',
    name: 'Mahlkönig EK43',
    oneLiner: '98 mm flat burrs. The reference filter grinder.',
    role: 'Filter Grinder',
    position: 'Brew Lab',
  },
  brass_tap: {
    id: 'brass_tap',
    name: 'Brushed Brass Gooseneck Tap',
    oneLiner: 'Triple-filtered, remineralised water — single lever, single pour.',
    role: 'Water',
    position: 'Bar Front',
  },
  speakers: {
    id: 'speakers',
    name: 'JBL 4367-style Studio Monitors',
    oneLiner: '4-way, two 15-inch woofers + horn-loaded compression tweeter.',
    role: 'Audiophile Wall',
    position: 'Far Wall',
  },
};

export const SCENES: Scene[] = [
  {
    id: 'entrance',
    label: 'Entrance',
    order: 1,
    title: 'The Threshold',
    subtitle: 'A descent into the evening',
    description:
      'Honed bluestone underfoot, deep teal tile to the right, oak slats to the left. The bar reveals itself slowly past the threshold.',
    hero: '/scenes/entrance.jpg',
    thumb: '/scenes/entrance.jpg',
    camera: 'Threshold Wide',
    equipment: [EQUIPMENT.strada, EQUIPMENT.brass_tap],
    hotspots: [
      { x: 0.72, y: 0.55, title: 'Dark Green Tile', body: 'Hand-glazed 75×300 mm stack bond.' },
      { x: 0.35, y: 0.6, title: 'Oak Slats', body: 'Vertical European white oak with toe-kick LED.' },
    ],
  },
  {
    id: 'main_coffee_bar',
    label: 'Main Coffee Bar',
    order: 2,
    title: 'Main Coffee Bar',
    subtitle: 'Dark green tile, stone, and warm brass.',
    description:
      'The heart of Nocture. Dark green tile, stone, and warm brass create a refined bar experience with an audiophile soul.',
    hero: '/scenes/counter_hero.jpg',
    thumb: '/scenes/counter_hero.jpg',
    camera: 'Counter Hero',
    equipment: [EQUIPMENT.strada, EQUIPMENT.mythos, EQUIPMENT.brass_tap],
    hotspots: [
      { x: 0.62, y: 0.62, title: 'La Marzocco Strada XI', body: 'Dual boiler espresso machine, espresso anchor of the bar.' },
      { x: 0.34, y: 0.46, title: 'Speaker Wall', body: 'Acoustic far end, audiophile soul of the room.' },
      { x: 0.82, y: 0.27, title: 'Coffee Jar Library', body: 'Single-origin selection rotated weekly.' },
      { x: 0.86, y: 0.66, title: 'Brushed Brass Tap', body: 'Triple-filtered, remineralised water service.' },
    ],
  },
  {
    id: 'equipment_hero',
    label: 'Equipment Hero',
    order: 3,
    title: 'Equipment Hero',
    subtitle: 'Black-on-black craftsmanship',
    description:
      'A tight shot on the Strada and Mythos pair. Every control accessible, every reflection considered.',
    hero: '/scenes/equipment.jpg',
    thumb: '/scenes/equipment.jpg',
    camera: 'Equipment Close',
    equipment: [EQUIPMENT.strada, EQUIPMENT.mythos],
    hotspots: [
      { x: 0.4, y: 0.65, title: 'Paddle Group', body: 'Manually-actuated pre-infusion.' },
      { x: 0.6, y: 0.42, title: 'Pressure Gauge', body: '0–15 bar, brass bezel.' },
    ],
  },
  {
    id: 'brew_lab',
    label: 'Brew Lab',
    order: 4,
    title: 'Brew Lab',
    subtitle: 'Pourover bar · 6 covers',
    description: 'A precision pourover station with three single-origin offerings, served on the same counter.',
    hero: '/scenes/brew_lab.jpg',
    thumb: '/scenes/brew_lab.jpg',
    camera: 'Brew Lab',
    equipment: [EQUIPMENT.ek43, EQUIPMENT.brass_tap],
    hotspots: [],
  },
  {
    id: 'seating_wall',
    label: 'Seating Wall',
    order: 5,
    title: 'Seating Wall',
    subtitle: 'Oak banquette · plant nook',
    description: 'A long oak banquette runs the left wall, lit by a hidden toe-kick strip. Round black bistros face the bar.',
    hero: '/scenes/seating.jpg',
    thumb: '/scenes/seating.jpg',
    camera: 'Seating Wall',
    equipment: [],
    hotspots: [],
  },
  {
    id: 'audiophile_wall',
    label: 'Audiophile Wall',
    order: 6,
    title: 'Audiophile Wall',
    subtitle: 'Listening corner',
    description: 'A 4-way studio monitor centred on the far wall, flanked by oak slats and bottle niches.',
    hero: '/scenes/audiophile.jpg',
    thumb: '/scenes/audiophile.jpg',
    camera: 'Audiophile',
    equipment: [EQUIPMENT.speakers],
    hotspots: [],
  },
  {
    id: 'operator',
    label: 'Operator View',
    order: 7,
    title: 'Operator View',
    subtitle: 'Behind the bar',
    description: 'The barista perspective: machine, grinders, water, knockbox — every tool one step away.',
    hero: '/scenes/operator.jpg',
    thumb: '/scenes/operator.jpg',
    camera: 'Operator',
    equipment: [EQUIPMENT.strada, EQUIPMENT.mythos, EQUIPMENT.brass_tap],
    hotspots: [],
  },
];

export type LightingMode =
  | 'morning'
  | 'service'
  | 'golden_hour'
  | 'night'
  | 'listening'
  | 'private_event';

export const LIGHTING_MODES: { id: LightingMode; label: string; icon: string }[] = [
  { id: 'morning',       label: 'Morning',       icon: '☀' },
  { id: 'service',       label: 'Service',       icon: '✦' },
  { id: 'golden_hour',   label: 'Golden Hour',   icon: '✺' },
  { id: 'night',         label: 'Night',         icon: '☾' },
  { id: 'listening',     label: 'Listening Mode',icon: '♪' },
  { id: 'private_event', label: 'Private Event', icon: '✧' },
];

export const MATERIAL_PALETTE = [
  { id: 'oak',       name: 'European White Oak',   swatch: 'linear-gradient(135deg,#a8845a 0%,#7d5a36 100%)' },
  { id: 'tile',      name: 'Dark Forest Tile',     swatch: 'linear-gradient(135deg,#1e3a2c 0%,#0d1d15 100%)' },
  { id: 'brass',     name: 'Brushed Brass',        swatch: 'linear-gradient(135deg,#c8a060 0%,#8a6a36 100%)' },
  { id: 'strada',    name: 'Strada Black',         swatch: 'linear-gradient(135deg,#1a1a1c 0%,#080809 100%)' },
  { id: 'terrazzo',  name: 'Dark Terrazzo',        swatch: 'radial-gradient(circle at 40% 30%,#9a958a 0%,#28251f 8%,#1c1a16 100%)' },
];
