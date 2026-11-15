import eradixLogoImg from '../assets/images/eradix_logo_1794723342124.jpg';
import tractorFieldImg from '../assets/images/tractor_weed_robot_field_1794723342685.jpg';
import cropRowImg from '../assets/images/weed_detection_crop_row_1794723342767.jpg';
import type {
  FarmBounds,
  FarmPreset,
  LatLngLiteral,
  PathStrategy,
  WeedDetectionPoint,
} from '../types';

const EARTH_RADIUS_M = 6371000;

export const DEFAULT_ERADIX_LOGO = eradixLogoImg;
export const DEFAULT_FIELD_PHOTO = tractorFieldImg;
export const CROP_ROW_INSPECTION_PHOTO = cropRowImg;

export const FARM_PRESETS: FarmPreset[] = [
  {
    id: 'nashik-soybean',
    name: 'Plot A — Niphad Soybean',
    region: 'Nashik, Maharashtra',
    crop: 'Soybean',
    center: { lat: 20.0724, lng: 74.1048 },
    bounds: {
      north: 20.07325,
      south: 20.07155,
      east: 74.1059,
      west: 74.1037,
    },
  },
  {
    id: 'varanasi-maize',
    name: 'Plot B — Chandauli Maize',
    region: 'Varanasi, Uttar Pradesh',
    crop: 'Maize',
    center: { lat: 25.2598, lng: 83.2682 },
    bounds: {
      north: 25.26065,
      south: 25.25895,
      east: 83.2693,
      west: 83.2671,
    },
  },
  {
    id: 'thanjavur-paddy',
    name: 'Plot C — Cauvery Delta',
    region: 'Thanjavur, Tamil Nadu',
    crop: 'Cotton & Pulses',
    center: { lat: 10.787, lng: 79.1378 },
    bounds: {
      north: 10.7878,
      south: 10.7862,
      east: 79.1389,
      west: 79.1367,
    },
  },
  {
    id: 'warangal-cotton',
    name: 'Plot D — Kakatiya Cotton',
    region: 'Warangal, Telangana',
    crop: 'Cotton',
    center: { lat: 17.9689, lng: 79.5941 },
    bounds: {
      north: 17.96975,
      south: 17.96805,
      east: 79.5952,
      west: 79.593,
    },
  },
];

export function metersToLatDelta(meters: number): number {
  return (meters / EARTH_RADIUS_M) * (180 / Math.PI);
}

export function metersToLngDelta(meters: number, lat: number): number {
  const cosLat = Math.max(0.1, Math.cos((lat * Math.PI) / 180));
  return (meters / (EARTH_RADIUS_M * cosLat)) * (180 / Math.PI);
}

export function haversineDistanceMeters(
  a: LatLngLiteral,
  b: LatLngLiteral
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

export function computeHeadingDegrees(
  from: LatLngLiteral,
  to: LatLngLiteral
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;
  const dLng = toRad(to.lng - from.lng);
  const lat1 = toRad(from.lat);
  const lat2 = toRad(to.lat);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

export function computeFarmAreaMetrics(bounds: FarmBounds): {
  widthMeters: number;
  heightMeters: number;
  areaSqMeters: number;
  areaHectares: number;
  areaAcres: number;
} {
  const midLat = (bounds.north + bounds.south) / 2;
  const heightMeters = haversineDistanceMeters(
    { lat: bounds.south, lng: bounds.west },
    { lat: bounds.north, lng: bounds.west }
  );
  const widthMeters = haversineDistanceMeters(
    { lat: midLat, lng: bounds.west },
    { lat: midLat, lng: bounds.east }
  );
  const areaSqMeters = Math.max(0, widthMeters * heightMeters);
  const areaHectares = areaSqMeters / 10000;
  const areaAcres = areaSqMeters / 4046.8564224;
  return {
    widthMeters,
    heightMeters,
    areaSqMeters,
    areaHectares,
    areaAcres,
  };
}

export function buildBoundsAroundCenter(
  center: LatLngLiteral,
  widthMeters = 210,
  heightMeters = 170
): FarmBounds {
  const dLat = metersToLatDelta(heightMeters / 2);
  const dLng = metersToLngDelta(widthMeters / 2, center.lat);
  return {
    north: center.lat + dLat,
    south: center.lat - dLat,
    east: center.lng + dLng,
    west: center.lng - dLng,
  };
}

/**
 * Generates an ordered full-field traversal path covering every swath inside bounds.
 */
export function generateFullCoveragePlan(
  bounds: FarmBounds,
  boomWidthMeters: number,
  strategy: PathStrategy
): LatLngLiteral[] {
  const { widthMeters, heightMeters } = computeFarmAreaMetrics(bounds);
  if (widthMeters < 2 || heightMeters < 2) return [];

  const effectiveSwath = Math.max(3, Math.min(20, boomWidthMeters));
  const midLat = (bounds.north + bounds.south) / 2;
  const marginLat = metersToLatDelta(Math.min(effectiveSwath * 0.45, heightMeters * 0.15));
  const marginLng = metersToLngDelta(
    Math.min(effectiveSwath * 0.45, widthMeters * 0.15),
    midLat
  );

  const south = bounds.south + marginLat;
  const north = bounds.north - marginLat;
  const west = bounds.west + marginLng;
  const east = bounds.east - marginLng;

  if (north <= south || east <= west) return [];

  const waypoints: LatLngLiteral[] = [];

  if (strategy === 'serpentine-ns') {
    const laneCount = Math.max(2, Math.min(18, Math.ceil(widthMeters / effectiveSwath)));
    const lngStep = (east - west) / Math.max(1, laneCount - 1);
    for (let i = 0; i < laneCount; i++) {
      const lng = west + i * lngStep;
      if (i % 2 === 0) {
        waypoints.push({ lat: south, lng });
        waypoints.push({ lat: north, lng });
      } else {
        waypoints.push({ lat: north, lng });
        waypoints.push({ lat: south, lng });
      }
    }
  } else if (strategy === 'contour-ew') {
    const laneCount = Math.max(2, Math.min(18, Math.ceil(heightMeters / effectiveSwath)));
    const latStep = (north - south) / Math.max(1, laneCount - 1);
    for (let i = 0; i < laneCount; i++) {
      const lat = south + i * latStep;
      if (i % 2 === 0) {
        waypoints.push({ lat, lng: west });
        waypoints.push({ lat, lng: east });
      } else {
        waypoints.push({ lat, lng: east });
        waypoints.push({ lat, lng: west });
      }
    }
  } else {
    // Perimeter inward spiral covering every ring
    const minDim = Math.min(widthMeters, heightMeters);
    const rings = Math.max(2, Math.min(8, Math.floor(minDim / (effectiveSwath * 2))));
    const latInsetStep = (north - south) / (rings * 2.1);
    const lngInsetStep = (east - west) / (rings * 2.1);

    for (let r = 0; r < rings; r++) {
      const s = south + r * latInsetStep;
      const n = north - r * latInsetStep;
      const w = west + r * lngInsetStep;
      const e = east - r * lngInsetStep;
      if (n <= s || e <= w) break;
      waypoints.push({ lat: s, lng: w });
      waypoints.push({ lat: n, lng: w });
      waypoints.push({ lat: n, lng: e });
      waypoints.push({ lat: s, lng: e });
      if (r < rings - 1) {
        waypoints.push({ lat: s + latInsetStep, lng: w + lngInsetStep });
      } else {
        waypoints.push({ lat: (s + n) / 2, lng: (w + e) / 2 });
      }
    }
  }

  return waypoints;
}

function pointToSegmentDistanceMeters(
  p: LatLngLiteral,
  a: LatLngLiteral,
  b: LatLngLiteral
): number {
  const latScale = 111320;
  const lngScale = 111320 * Math.cos((p.lat * Math.PI) / 180);

  const px = (p.lng - a.lng) * lngScale;
  const py = (p.lat - a.lat) * latScale;
  const bx = (b.lng - a.lng) * lngScale;
  const by = (b.lat - a.lat) * latScale;

  const lenSq = bx * bx + by * by;
  if (lenSq === 0) return Math.hypot(px, py);

  const t = Math.max(0, Math.min(1, (px * bx + py * by) / lenSq));
  const projX = t * bx;
  const projY = t * by;
  return Math.hypot(px - projX, py - projY);
}

/**
 * Evaluates grid coverage inside the farm box and computes a suggested alternative path
 * connecting all uncovered swaths from the tractor's live position.
 */
export function computeCoverageAndAlternativePath(
  bounds: FarmBounds,
  coveredPath: LatLngLiteral[],
  currentTractorPos: LatLngLiteral,
  boomWidthMeters: number,
  strategy: PathStrategy
): {
  coveragePercent: number;
  remainingPath: LatLngLiteral[];
  totalGridCells: number;
  coveredGridCells: number;
} {
  const { widthMeters, heightMeters } = computeFarmAreaMetrics(bounds);
  if (widthMeters < 2 || heightMeters < 2) {
    return {
      coveragePercent: 0,
      remainingPath: [],
      totalGridCells: 0,
      coveredGridCells: 0,
    };
  }

  const cols = Math.max(4, Math.min(14, Math.round(widthMeters / Math.max(4, boomWidthMeters))));
  const rows = Math.max(4, Math.min(14, Math.round(heightMeters / Math.max(4, boomWidthMeters))));
  const swathRadius = Math.max(4.5, boomWidthMeters * 1.15);

  const latStep = (bounds.north - bounds.south) / rows;
  const lngStep = (bounds.east - bounds.west) / cols;

  let coveredGridCells = 0;
  const totalGridCells = rows * cols;
  const uncoveredCenters: { row: number; col: number; pt: LatLngLiteral }[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const pt: LatLngLiteral = {
        lat: bounds.south + (r + 0.5) * latStep,
        lng: bounds.west + (c + 0.5) * lngStep,
      };

      let isCovered = false;
      if (coveredPath.length === 1) {
        isCovered = haversineDistanceMeters(pt, coveredPath[0]) <= swathRadius;
      } else if (coveredPath.length > 1) {
        for (let i = 0; i < coveredPath.length - 1; i++) {
          if (
            pointToSegmentDistanceMeters(pt, coveredPath[i], coveredPath[i + 1]) <=
            swathRadius
          ) {
            isCovered = true;
            break;
          }
        }
      }

      if (isCovered) {
        coveredGridCells++;
      } else {
        uncoveredCenters.push({ row: r, col: c, pt });
      }
    }
  }

  const coveragePercent =
    totalGridCells > 0
      ? Math.min(100, Math.round((coveredGridCells / totalGridCells) * 100))
      : 0;

  if (uncoveredCenters.length === 0) {
    return {
      coveragePercent: 100,
      remainingPath: [],
      totalGridCells,
      coveredGridCells,
    };
  }

  // Build clean boustrophedon alternative path over remaining uncovered cells
  const sorted = [...uncoveredCenters];
  if (strategy === 'serpentine-ns') {
    sorted.sort((a, b) => {
      if (a.col !== b.col) return a.col - b.col;
      return a.col % 2 === 0 ? a.row - b.row : b.row - a.row;
    });
  } else if (strategy === 'contour-ew') {
    sorted.sort((a, b) => {
      if (a.row !== b.row) return a.row - b.row;
      return a.row % 2 === 0 ? a.col - b.col : b.col - a.col;
    });
  } else {
    // Perimeter-first ring order for remaining cells
    const midR = (rows - 1) / 2;
    const midC = (cols - 1) / 2;
    sorted.sort((a, b) => {
      const ringA = Math.max(Math.abs(a.row - midR), Math.abs(a.col - midC));
      const ringB = Math.max(Math.abs(b.row - midR), Math.abs(b.col - midC));
      if (Math.abs(ringB - ringA) > 0.4) return ringB - ringA;
      const angleA = Math.atan2(a.row - midR, a.col - midC);
      const angleB = Math.atan2(b.row - midR, b.col - midC);
      return angleA - angleB;
    });
  }

  // Condense collinear waypoints while starting from the tractor's live location
  const pathPoints: LatLngLiteral[] = [currentTractorPos];
  for (let i = 0; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    const next = sorted[i + 1];

    if (
      prev &&
      next &&
      ((prev.col === curr.col && curr.col === next.col) ||
        (prev.row === curr.row && curr.row === next.row))
    ) {
      continue;
    }
    pathPoints.push(curr.pt);
  }

  return {
    coveragePercent,
    remainingPath: pathPoints,
    totalGridCells,
    coveredGridCells,
  };
}

export function generateWeedHotspots(bounds: FarmBounds): WeedDetectionPoint[] {
  const types: Array<'broadleaf' | 'grassy' | 'sedge'> = [
    'broadleaf',
    'grassy',
    'sedge',
  ];
  const points: WeedDetectionPoint[] = [];
  const latSpan = bounds.north - bounds.south;
  const lngSpan = bounds.east - bounds.west;

  // Deterministic pseudo-random scatter across the farm plot
  for (let i = 0; i < 18; i++) {
    const rx = ((Math.sin(i * 12.9898 + 4.14) * 43758.5453) % 1 + 1) % 1;
    const ry = ((Math.sin(i * 78.233 + 1.73) * 28461.2134) % 1 + 1) % 1;
    points.push({
      id: `weed-${i}`,
      position: {
        lat: bounds.south + (0.08 + ry * 0.84) * latSpan,
        lng: bounds.west + (0.08 + rx * 0.84) * lngSpan,
      },
      type: types[i % types.length],
      injected: false,
      dosageMl: 8.5,
    });
  }
  return points;
}
