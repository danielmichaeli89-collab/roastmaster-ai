import type { TourPointId } from '../store';

export interface TourPoint {
  id: TourPointId;
  order: number;
  label: string;
  title: string;
  subtitle: string;
  description: string;
  details: { label: string; value: string }[];
  camera: [number, number, number];
  target: [number, number, number];
  fov: number;
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
    camera: [3.0, 1.65, 3.0],
    target: [-2.0, 1.45, -2.0],
    fov: 46,
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
    camera: [1.4, 1.65, -0.6],
    target: [-3.5, 1.4, -2.4],
    fov: 50,
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
      { label: 'Water', value: 'Triple-stage filtered · remineralised' },
    ],
    camera: [-2.0, 1.4, -1.0],
    target: [-3.5, 1.3, -2.4],
    fov: 42,
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
    camera: [-1.5, 1.7, -1.0],
    target: [-3.5, 1.5, -2.6],
    fov: 42,
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
    camera: [-1.4, 1.85, -0.4],
    target: [-3.5, 2.05, -3.83],
    fov: 42,
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
    camera: [1.4, 1.55, 1.6],
    target: [4.2, 1.2, 0.0],
    fov: 50,
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
    camera: [4.0, 1.5, 1.8],
    target: [2.7, 1.0, 3.4],
    fov: 48,
  },
];

export const getTourPoint = (id: TourPointId): TourPoint =>
  TOUR_POINTS.find((p) => p.id === id) ?? TOUR_POINTS[0];
