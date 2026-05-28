import type { TourPointId } from '../store';

export interface Hotspot {
  to: TourPointId;
  label: string;
  // Spherical coordinates in the panorama (radians).
  // yaw 0 = looking down -Z, +yaw turns right (clockwise from above)
  // pitch 0 = horizon, + = up, - = down
  yaw: number;
  pitch: number;
}

export interface TourPoint {
  id: TourPointId;
  order: number;
  label: string;
  title: string;
  subtitle: string;
  description: string;
  details: { label: string; value: string }[];

  // Path to a 360° equirectangular image (2:1 ratio, 4K–8K recommended)
  // Files live under /public/panoramas/{id}.jpg
  panorama: string;

  // Optional initial view when entering this station
  initialYaw?: number;
  initialPitch?: number;
  initialFov?: number;

  // Hotspots to navigate to other stations
  hotspots: Hotspot[];
}

export const TOUR_POINTS: TourPoint[] = [
  {
    id: 'entrance',
    order: 1,
    label: '01',
    title: 'The Threshold',
    subtitle: 'a descent into the evening',
    description:
      'Deep teal ceramic, polished bluestone underfoot, the aroma of roasted beans laced with peated whisky. Focused light shows only what it must.',
    details: [
      { label: 'Floor', value: 'Honed bluestone 600×600' },
      { label: 'Ceiling', value: '2.85 m matte ink black' },
      { label: 'Lighting', value: '2700 K · 320 lux focal' },
    ],
    panorama: '/panoramas/entrance.jpg',
    initialYaw: 0,
    initialPitch: -0.05,
    hotspots: [
      { to: 'bar', label: 'The Counter', yaw: -0.4, pitch: -0.15 },
      { to: 'dining', label: 'Dining', yaw: 0.6, pitch: -0.15 },
    ],
  },
  {
    id: 'bar',
    order: 2,
    label: '02',
    title: 'The Counter',
    subtitle: 'solid oak · stone · brass',
    description:
      'A 5-meter counter, single oak slab, hand-rubbed in tung oil. Reclaimed brass taps, an under-counter chiller, and one cocktail glass left to mark the moment.',
    details: [
      { label: 'Counter', value: 'European white oak · 60 mm slab' },
      { label: 'Splashback', value: 'Hand-glazed teal porcelain' },
      { label: 'Length', value: '5.0 m · seats 7' },
    ],
    panorama: '/panoramas/bar.jpg',
    initialYaw: 0,
    initialPitch: -0.1,
    hotspots: [
      { to: 'modbar', label: 'Modbar', yaw: -0.7, pitch: -0.1 },
      { to: 'speaker', label: 'Speaker', yaw: 0, pitch: 0.25 },
      { to: 'entrance', label: 'Entrance', yaw: Math.PI, pitch: -0.1 },
    ],
  },
  {
    id: 'modbar',
    order: 3,
    label: '03',
    title: 'The Modbar',
    subtitle: 'espresso · steam · pourover',
    description:
      'A Modbar AV+EP+PO trio. Brewing groups rise as polished chrome columns through the counter; the boilers and electronics live unseen below. Direct eye contact across the bar — no machine between barista and guest.',
    details: [
      { label: 'Modules', value: 'AV espresso · EP steam · PO pourover' },
      { label: 'Beans', value: 'Single-origin · weekly roast' },
      { label: 'Water', value: 'Triple-stage · remineralised' },
    ],
    panorama: '/panoramas/modbar.jpg',
    initialYaw: 0,
    initialPitch: -0.05,
    hotspots: [
      { to: 'grinders', label: 'Grinders', yaw: 0.5, pitch: 0.05 },
      { to: 'bar', label: 'The Counter', yaw: Math.PI, pitch: -0.05 },
    ],
  },
  {
    id: 'grinders',
    order: 4,
    label: '04',
    title: 'The Grinders',
    subtitle: 'three burrs · three intents',
    description:
      'A dedicated grinder per beverage: an EK43 for filter, a Mythos One for espresso, and a single-dose flat for the bar of the day. Grams measured, never guessed.',
    details: [
      { label: 'Filter', value: 'Mahlkönig EK43 · 98 mm flat' },
      { label: 'Espresso', value: 'Victoria Arduino Mythos One' },
      { label: 'Single dose', value: 'Mazzer ZM · 83 mm flat' },
    ],
    panorama: '/panoramas/grinders.jpg',
    initialYaw: 0,
    initialPitch: -0.05,
    hotspots: [
      { to: 'modbar', label: 'Modbar', yaw: -0.5, pitch: -0.05 },
      { to: 'bar', label: 'The Counter', yaw: Math.PI * 0.8, pitch: -0.05 },
    ],
  },
  {
    id: 'speaker',
    order: 5,
    label: '05',
    title: 'The Speaker Wall',
    subtitle: 'a purpose-built listening rig',
    description:
      'Solid oak cabinets, vintage 15-inch drivers with horn tweeters, mounted at seated ear height. The wall behind is clad in green ceramic — not only for the look, but for a flat acoustic return.',
    details: [
      { label: 'Drivers', value: '15" paper cone · horn-loaded' },
      { label: 'Cabinet', value: 'Solid oak · sealed · 180 L' },
      { label: 'Amp', value: 'Class-A tube · 2 × 22W' },
    ],
    panorama: '/panoramas/speaker.jpg',
    initialYaw: 0,
    initialPitch: 0.15,
    hotspots: [
      { to: 'bar', label: 'The Counter', yaw: Math.PI, pitch: -0.1 },
      { to: 'modbar', label: 'Modbar', yaw: -Math.PI * 0.75, pitch: -0.05 },
    ],
  },
  {
    id: 'dining',
    order: 6,
    label: '06',
    title: 'The Dining Room',
    subtitle: 'two-tops · timber and wool',
    description:
      'Three two-tops along a vertical timber wall. Round-back chairs upholstered in warm grey wool, light niches recessed into the wall with hidden LED. Intimate, never severed.',
    details: [
      { label: 'Wall', value: 'European oak · 65 mm vertical boards' },
      { label: 'Seating', value: '6 covers · 3 × 2-tops' },
      { label: 'Niches', value: 'Hand-blackened steel · LED 2700K' },
    ],
    panorama: '/panoramas/dining.jpg',
    initialYaw: 0,
    initialPitch: -0.05,
    hotspots: [
      { to: 'entrance', label: 'Entrance', yaw: -0.7, pitch: -0.05 },
      { to: 'booth', label: 'The Booth', yaw: 0.6, pitch: -0.05 },
    ],
  },
  {
    id: 'booth',
    order: 7,
    label: '07',
    title: 'The Booth',
    subtitle: 'a table for two · window to the bar',
    description:
      'A booth sealed for one pair only. A single bistro top, a chair, an open window onto the bar with a speaker at its edge. The quietest seat on the loudest night.',
    details: [
      { label: 'Cover', value: '2 guests · reservation only' },
      { label: 'Table', value: 'Oak · 700 × 700 mm' },
      { label: 'Privacy', value: 'Solid timber surround · 1.8 m' },
    ],
    panorama: '/panoramas/booth.jpg',
    initialYaw: 0,
    initialPitch: -0.05,
    hotspots: [
      { to: 'dining', label: 'Dining', yaw: Math.PI, pitch: -0.05 },
      { to: 'bar', label: 'The Counter', yaw: 0, pitch: 0.0 },
    ],
  },
];

export const getTourPoint = (id: TourPointId): TourPoint =>
  TOUR_POINTS.find((p) => p.id === id) ?? TOUR_POINTS[0];
