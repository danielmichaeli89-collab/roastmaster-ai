/**
 * All TypeScript interfaces matching the database schema
 */

// ============================================================================
// AUTH & USER TYPES
// ============================================================================

export type UserRole = 'admin' | 'roaster' | 'viewer'

export interface User {
  id: string
  email: string
  username: string
  fullName: string
  role: UserRole
  organizationName: string
  roesterSerialNumber: string
  isActive: boolean
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
}

export interface AuthToken {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface AuthResponse {
  user: User
  token: AuthToken
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  username: string
  password: string
  fullName: string
  organizationName: string
  roesterSerialNumber: string
}

// ============================================================================
// ROAST TYPES
// ============================================================================

export type RoastLevel = 'light' | 'medium_light' | 'medium' | 'medium_dark' | 'dark'
export type CrackDetectionMethod = 'microphone' | 'manual' | 'ai_prediction'
export type AnomalyType =
  | 'temp_spike'
  | 'temp_drop'
  | 'pressure_anomaly'
  | 'drum_stall'
  | 'heating_element_failure'
  | 'cooling_lag'
  | 'sensor_malfunction'
  | 'uneven_development'
  | 'thermal_shock'
  | 'control_lag'

export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical'

export interface Roast {
  id: string
  userId: string
  batchNumber: string
  greenCoffeeId: string | null
  coffeeOrigin: string
  coffeeProcessingMethod: string
  coffeeDensityScore: number
  coffeeMoisturePercent: number
  coffeeAltitudeMeters: number
  roastProfileId: string | null
  targetDevelopmentTimeSeconds: number
  targetFirstCrackSeconds: number
  targetSecondCrackSeconds: number | null
  targetDropTemperature: number
  roastStartTime: string
  roastEndTime: string | null
  roastDurationSeconds: number | null
  firstCrackDetectedAt: string | null
  firstCrackDetectedBy: CrackDetectionMethod | null
  secondCrackDetectedAt: string | null
  actualDropTemperature: number | null
  actualDropTime: string | null
  ambientTemperature: number
  ambientHumidityPercent: number
  roastLevel: RoastLevel | null
  outcomeNotes: string
  isSuccess: boolean | null
  qualityRating: number | null
  csvSourceFile: string | null
  roestConnectId: string | null
  createdAt: string
  updatedAt: string
}

export interface TemperatureLog {
  id: string
  roastId: string
  timestamp: string
  elapsedSeconds: number
  beanTemperature1: number
  beanTemperature2: number
  beanTemperatureAvg: number
  airTemperature: number
  inletTemperature: number
  drumTemperature: number
  exhaustTemperature: number
  drumPressure: number
  samplingIntervalMs: number
  sensorHealthStatus: 'nominal' | 'warning' | 'error'
  createdAt: string
}

export interface ControlLog {
  id: string
  roastId: string
  timestamp: string
  elapsedSeconds: number
  powerPercent: number
  airflowPercent: number
  fanSpeedRpm: number
  motorRpm: number
  controlSource: 'manual' | 'auto_profile' | 'ai_recommendation' | 'system_default'
  changedParameter: string
  oldValue: number
  newValue: number
  reasonNotes: string
  createdAt: string
}

export interface RoastAnomaly {
  id: string
  roastId: string
  timestamp: string
  elapsedSeconds: number
  anomalyType: AnomalyType
  severity: SeverityLevel
  affectedSensor: string
  expectedValue: number
  actualValue: number
  deviationPercent: number
  aiSuggestion: string
  userAction: string | null
  actionTakenAt: string | null
  resolved: boolean
  resolvedAt: string | null
  resolutionNotes: string | null
  createdAt: string
}

// ============================================================================
// ROAST PROFILE TYPES
// ============================================================================

export type RoastStrategy = 'light' | 'medium' | 'dark' | 'filter' | 'espresso' | 'mouthfeel' | 'clarity'

export interface RoastProfile {
  id: string
  userId: string
  profileName: string
  description: string
  targetCoffeeOrigin: string
  targetProcessingMethod: string
  targetDensityScore: number
  targetFlavorNotes: string
  targetFirstCrackSeconds: number
  targetSecondCrackSeconds: number | null
  targetDevelopmentTimePercent: number
  targetDropTemperature: number
  roastStrategy: RoastStrategy
  aiGenerated: boolean
  aiGenerationPrompt: string | null
  generatedAt: string | null
  isTemplate: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
  phases?: ProfilePhase[]
}

export interface ProfilePhase {
  id: string
  roastProfileId: string
  phaseNumber: number
  phaseName: string
  phaseDescription: string
  startSeconds: number
  endSeconds: number
  durationSeconds: number
  targetBeanTempStart: number
  targetBeanTempEnd: number
  targetRampRate: number
  powerPercentStart: number
  powerPercentEnd: number
  airflowPercentStart: number
  airflowPercentEnd: number
  temperatureToleranceCelsius: number
  createdAt: string
}

// ============================================================================
// GREEN COFFEE INVENTORY TYPES
// ============================================================================

export interface GreenCoffee {
  id: string
  userId: string
  originCountry: string
  originRegion: string
  coffeeName: string
  producerName: string
  processingMethod: string
  altitudeMeters: number
  densityScore: number
  moisturePercent: number
  expectedFlavorNotes: string
  intendedRoastProfileId: string | null
  quantityKg: number
  quantityBags: number
  bagSizeKg: number
  supplierName: string
  purchaseDate: string
  harvestDate: string
  lotNumber: string
  costPerKg: number
  receivedDate: string
  isActive: boolean
  storageLocation: string
  storageCondition: string
  createdAt: string
  updatedAt: string
}

// ============================================================================
// CUPPING NOTES TYPES
// ============================================================================

export type CuppingMethod = 'weasel' | 'manual' | 'hybrid'

export interface CuppingNotes {
  id: string
  greenCoffeeId: string
  roastId: string | null
  cuppingDate: string
  cupperName: string
  cuppingMethod: CuppingMethod
  aroma: number
  flavor: number
  aftertaste: number
  acidity: number
  body: number
  balance: number
  uniformity: number
  cleanCup: number
  sweetness: number
  overall: number
  defects: number
  totalScore: number
  dominantFlavors: string[]
  tastingNotes: string
  mouthFeel: string
  finishQuality: string
  defectsDescription: string
  suitableBrewMethods: string[]
  createdAt: string
  updatedAt: string
}

// ============================================================================
// AI ANALYSIS TYPES
// ============================================================================

export interface AIAnalysisResult {
  id: string
  userId: string
  roastId: string | null
  greenCoffeeId: string | null
  analysisType: 'profile_generation' | 'roast_monitoring' | 'post_roast_analysis' | 'quality_prediction'
  prompt: string
  response: string
  metadata: Record<string, unknown>
  confidence: number
  createdAt: string
}

export interface AIRecommendation {
  id: string
  anomalyId: string | null
  roastId: string
  timestamp: string
  recommendationType: string
  suggestedAction: string
  expectedOutcome: string
  confidence: number
}

// ============================================================================
// FLAVOR WHEEL TYPES
// ============================================================================

export type FlavorCategory = 'fruity' | 'floral' | 'herbal' | 'spicy' | 'nutty' | 'chocolate' | 'sweet' | 'sour' | 'roasted' | 'earthy'

export interface FlavorProfile {
  categories: FlavorCategory[]
  notes: string[]
  intensity: number // 1-10
}

// ============================================================================
// REAL-TIME DATA TYPES
// ============================================================================

export interface RealtimeRoastData {
  roastId: string
  timestamp: string
  elapsedSeconds: number
  temperatures: {
    bt1: number
    bt2: number
    btAvg: number
    air: number
    inlet: number
    drum: number
    exhaust: number
  }
  pressure: number
  controls: {
    power: number
    airflow: number
    fanRpm: number
    motorRpm: number
  }
  phase: string
  developmentPercent: number
  rateOfRise: number
}

export interface RoastEvent {
  type: 'yellowing' | 'first_crack' | 'second_crack' | 'drop'
  timestamp: string
  elapsedSeconds: number
  temperature: number
  notes: string
}

// ============================================================================
// STATISTICS & ANALYTICS TYPES
// ============================================================================

export interface RoastStats {
  totalRoasts: number
  averageQualityRating: number
  successRate: number
  averageDevelopmentTime: number
  averageFirstCrackTime: number
  lastRoastDate: string | null
}

export interface OriginAnalysis {
  origin: string
  roastCount: number
  averageQuality: number
  favoriteProfile: string | null
  totalQuantityRoasted: number
}

export interface ProfilePerformance {
  profileId: string
  profileName: string
  roastCount: number
  averageQuality: number
  successRate: number
  averageDevelopmentTime: number
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiError {
  statusCode: number
  message: string
  errors?: Record<string, string[]>
}

export interface SuccessResponse<T> {
  data: T
  message?: string
}

// ============================================================================
// UI STATE TYPES
// ============================================================================

export interface NotificationState {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
}

export interface ModalState {
  isOpen: boolean
  title?: string
  content?: React.ReactNode
}

// ============================================================================
// FILTER & SORT TYPES
// ============================================================================

export interface RoastFilter {
  startDate?: string
  endDate?: string
  roastLevel?: RoastLevel
  minQualityRating?: number
  profileId?: string
  coffeeOrigin?: string
  successOnly?: boolean
}

export interface SortOptions {
  field: string
  direction: 'asc' | 'desc'
}
