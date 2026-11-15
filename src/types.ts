export type LanguageCode = 'en' | 'hi' | 'mr' | 'ta' | 'te' | 'bho';

export type ActiveTab = 'map' | 'settings' | 'chat';

export type PathStrategy = 'serpentine-ns' | 'contour-ew' | 'perimeter-spiral';

export interface LatLngLiteral {
  lat: number;
  lng: number;
}

export interface FarmBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface FarmPreset {
  id: string;
  name: string;
  region: string;
  crop: string;
  center: LatLngLiteral;
  bounds: FarmBounds;
}

export interface WeedDetectionPoint {
  id: string;
  position: LatLngLiteral;
  type: 'broadleaf' | 'grassy' | 'sedge';
  injected: boolean;
  dosageMl: number;
}

export interface RobotSettings {
  dosageMlPerPlant: number;
  tankCapacityLiters: number;
  boomWidthMeters: number;
  targetSpeedKmh: number;
  detectionSensitivity: number;
  pumpPowerMode: 'eco' | 'standard' | 'turbo';
  sprayerActive: boolean;
  autoAvoidCropRows: boolean;
}

export interface RobotTelemetry {
  tankLitersRemaining: number;
  batteryPercent: number;
  batteryVoltage: number;
  injectedWeedsCount: number;
  weedBreakdown: {
    broadleaf: number;
    grassy: number;
    sedge: number;
  };
  currentSpeedKmh: number;
  headingDegrees: number;
  nozzlePressureBar: number;
  operatingMinutes: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  model?: string;
}
