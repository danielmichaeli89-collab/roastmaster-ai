import type { TourPointId } from '../store';

export interface TourPoint {
  id: TourPointId;
  order: number;
  label: string;
  titleHe: string;
  titleEn: string;
  subtitleHe: string;
  subtitleEn: string;
  descriptionHe: string;
  descriptionEn: string;
  details: { label: string; value: string }[];
  // Camera position and look-at target in world space (meters)
  // Room bounds are x:[-5..5], z:[-4..4], floor y=0, ceiling y=2.85
  camera: [number, number, number];
  target: [number, number, number];
  fov: number;
}

export const TOUR_POINTS: TourPoint[] = [
  {
    id: 'entrance',
    order: 1,
    label: '01',
    titleHe: 'הכניסה',
    titleEn: 'The Threshold',
    subtitleHe: 'נסיעה אל הלילה',
    subtitleEn: 'A descent into the evening',
    descriptionHe:
      'הכניסה ל-Nocturne נחשפת בהדרגה. אריחי קרמיקה ירוקים-אפלים, ריצוף אבן מלוטשת, וריח קלוי של פולי קפה מעורבים עם ניחוחות וויסקי. תאורה ממוקדת חושפת רק את מה שצריך — השאר נשאר במסתורין.',
    descriptionEn:
      'The entrance reveals itself gradually. Deep teal ceramic, polished stone underfoot, the aroma of roasted beans laced with peated whisky. Focused light shows only what it must — the rest stays in shadow.',
    details: [
      { label: 'Floor', value: 'Honed bluestone 600×600' },
      { label: 'Ceiling', value: '2.85 m · matte ink black' },
      { label: 'Lighting', value: '2700K · 320 lux focal' },
    ],
    camera: [3.0, 1.65, 3.0],
    target: [-2.0, 1.45, -2.0],
    fov: 46,
  },
  {
    id: 'bar',
    order: 2,
    label: '02',
    titleHe: 'הבר',
    titleEn: 'The Counter',
    subtitleHe: 'אלון מלא · אבן · פליז',
    subtitleEn: 'Solid oak · stone · brass',
    descriptionHe:
      'בר באורך 5 מטר חצוב מלוח אלון יחיד, מלוטש בידיים עם שמן טונג. ברזי שאיבה מפליז משוחזר, מקרר תת-דלפק, וכוס קוקטייל יחידה משאירה את הסימן שלה. מאחור — מדפי בקבוקים מודלגים בתאורת LED חמה.',
    descriptionEn:
      'A 5-meter counter, single oak slab, hand-rubbed in tung oil. Reclaimed brass taps, an under-counter chiller, and one cocktail glass left to mark the moment. Behind it — bottle shelves staggered in warm LED.',
    details: [
      { label: 'Counter', value: 'European white oak · 60 mm slab' },
      { label: 'Splashback', value: 'Hand-glazed teal porcelain 100×100' },
      { label: 'Bar length', value: '5.0 m · seats 7' },
    ],
    camera: [1.4, 1.65, -0.6],
    target: [-3.5, 1.4, -2.4],
    fov: 50,
  },
  {
    id: 'dj',
    order: 3,
    label: '03',
    titleHe: 'הפטיפונים',
    titleEn: 'The Turntables',
    subtitleHe: 'Technics SL-1200 · Vinyl only',
    subtitleEn: 'Technics SL-1200 · Vinyl only',
    descriptionHe:
      'תחנת ה-DJ ממוקמת כחלק מהבר, חשופה לחלוטין. שני Technics SL-1200MK7, מיקסר רוטרי, ומנורת ספרייה שחורה מעל. אוסף תקליטים נשען על המדף — ג׳אז, סול, אמביינט יפני.',
    descriptionEn:
      'The DJ station sits as part of the bar, completely exposed. Two Technics SL-1200MK7, a rotary mixer, and a black library lamp above. The crate leans against the shelf — jazz, soul, Japanese ambient.',
    details: [
      { label: 'Decks', value: '2 × Technics SL-1200MK7' },
      { label: 'Mixer', value: 'Rotary · 4 channels' },
      { label: 'Format', value: 'Vinyl only · no laptops' },
    ],
    camera: [-2.5, 1.55, -0.6],
    target: [-3.5, 1.22, -2.2],
    fov: 44,
  },
  {
    id: 'speaker',
    order: 4,
    label: '04',
    titleHe: 'קיר הרמקולים',
    titleEn: 'The Speaker Wall',
    subtitleHe: 'מערכת האזנה ייעודית',
    subtitleEn: 'A purpose-built listening rig',
    descriptionHe:
      'קיר הרמקולים הוא הלב של המקום. ארונות אלון מסיביים, ווינטג׳ 15 אינץ׳ עם horn טוויטר, מותקנים בגובה אוזן בעת ישיבה. הקיר מאחור מצופה אריחי קרמיקה ירוקים — לא רק לאסתטיקה, אלא להחזרת קול שטוחה.',
    descriptionEn:
      'The speaker wall is the heart of the room. Solid oak cabinets, vintage 15-inch drivers with horn tweeters, mounted at seated ear height. The wall behind is clad in green ceramic — not only for the look, but for a flat acoustic return.',
    details: [
      { label: 'Drivers', value: '15" paper cone · horn-loaded compression' },
      { label: 'Cabinet', value: 'Solid oak · sealed · 180 L' },
      { label: 'Amp', value: 'Class-A tube · 2 × 22W' },
    ],
    camera: [-1.4, 1.85, -0.4],
    target: [-3.5, 2.05, -3.83],
    fov: 42,
  },
  {
    id: 'dining',
    order: 5,
    label: '05',
    titleHe: 'פינת האוכל',
    titleEn: 'The Dining Room',
    subtitleHe: 'שולחנות זוגיים · עץ ועור',
    subtitleEn: 'Two-tops · timber and leather',
    descriptionHe:
      'פינת האוכל בנויה כשורה של שולחנות זוגיים לאורך קיר עץ אנכי. כיסאות עם משענת עגולה מרופדים בבד צמר אפור-חם, נישות תאורה משוקעות בקיר עם פס LED חבוי. המרחק בין השולחנות — 1.4 מטר. שיחה אינטימית, לא מנותקת.',
    descriptionEn:
      'The dining area is a row of two-tops along a vertical timber wall. Round-back chairs upholstered in warm grey wool, light niches recessed into the wall with hidden LED. Tables sit 1.4 m apart. Intimate, never severed.',
    details: [
      { label: 'Wall', value: 'European oak · vertical 65 mm boards' },
      { label: 'Seating', value: '6 covers · 3 × 2-tops' },
      { label: 'Niches', value: 'Hand-blackened steel · LED 2700K' },
    ],
    camera: [1.4, 1.55, 1.6],
    target: [4.2, 1.2, 0.0],
    fov: 50,
  },
  {
    id: 'booth',
    order: 6,
    label: '06',
    titleHe: 'הבוקס',
    titleEn: 'The Booth',
    subtitleHe: 'שולחן לשניים · חלון אל הבר',
    subtitleEn: 'A table for two · window to the bar',
    descriptionHe:
      'בקצה החדר — בוקס סגור לחלוטין לזוג אחד בלבד. שולחן מיני יחיד, כיסא אחד, חלון פתוח אל הבר עם רמקול בקצה. המקום השקט ביותר בלילה הרועש ביותר.',
    descriptionEn:
      'At the far end — a booth sealed for one pair only. A single bistro top, one chair, an open window onto the bar with a speaker at its edge. The quietest seat on the loudest night.',
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
