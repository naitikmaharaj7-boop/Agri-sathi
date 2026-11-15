/// <reference types="google.maps" />
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AdvancedMarker,
  InfoWindow,
  Map as GoogleMapView,
  useAdvancedMarkerRef,
  useMap,
} from '@vis.gl/react-google-maps';
import {
  Camera,
  CheckCircle2,
  Compass,
  Crosshair,
  LocateFixed,
  Pause,
  Play,
  RotateCcw,
  Route,
  SquareDashedMousePointer,
  Trash2,
} from 'lucide-react';
import type {
  FarmBounds,
  LatLngLiteral,
  PathStrategy,
  RobotSettings,
  RobotTelemetry,
  WeedDetectionPoint,
} from '../types';
import type { TranslationStrings } from '../i18n/translations';
import {
  CROP_ROW_INSPECTION_PHOTO,
  FARM_PRESETS,
  computeFarmAreaMetrics,
} from '../utils/farmPathPlanner';

interface FieldMapWorkspaceProps {
  t: TranslationStrings;
  mapsApiKey: string;
  selectedPresetId: string;
  onSelectPreset: (presetId: string) => void;
  farmBounds: FarmBounds | null;
  onFarmBoundsChange: (bounds: FarmBounds | null) => void;
  tractorPos: LatLngLiteral;
  onMoveTractorManual: (pos: LatLngLiteral) => void;
  coveredPath: LatLngLiteral[];
  suggestedPath: LatLngLiteral[];
  coveragePercent: number;
  pathStrategy: PathStrategy;
  onPathStrategyChange: (strategy: PathStrategy) => void;
  isRunning: boolean;
  onToggleRun: () => void;
  onResetPath: () => void;
  onLocateUser: () => void;
  isLocating: boolean;
  locationError: string | null;
  weedPoints: WeedDetectionPoint[];
  robotSettings: RobotSettings;
  telemetry: RobotTelemetry;
  fieldPhotoUrl: string;
  onUploadFieldPhoto: (dataUrl: string) => void;
  onOpenSettings: () => void;
}

interface FarmOverlayControllerProps {
  farmBounds: FarmBounds | null;
  onFarmBoundsChange: (bounds: FarmBounds) => void;
  isDrawingBox: boolean;
  onFinishDrawingBox: () => void;
  coveredPath: LatLngLiteral[];
  suggestedPath: LatLngLiteral[];
  tractorPos: LatLngLiteral;
  shouldPanToTractor: number;
}

function FarmOverlayController({
  farmBounds,
  onFarmBoundsChange,
  isDrawingBox,
  onFinishDrawingBox,
  coveredPath,
  suggestedPath,
  tractorPos,
  shouldPanToTractor,
}: FarmOverlayControllerProps) {
  const map = useMap();
  const rectangleRef = useRef<google.maps.Rectangle | null>(null);
  const coveredPolylineRef = useRef<google.maps.Polyline | null>(null);
  const suggestedPolylineRef = useRef<google.maps.Polyline | null>(null);
  const isUpdatingFromPropRef = useRef(false);
  const dragStartRef = useRef<google.maps.LatLng | null>(null);
  const previewRectRef = useRef<google.maps.Rectangle | null>(null);

  // Pan map when explicitly requested (preset change or GPS locate)
  useEffect(() => {
    if (!map || shouldPanToTractor === 0) return;
    map.panTo(tractorPos);
  }, [map, shouldPanToTractor, tractorPos]);

  // Render & sync editable Farm Box Rectangle
  useEffect(() => {
    if (!map) return;

    if (!farmBounds) {
      if (rectangleRef.current) {
        rectangleRef.current.setMap(null);
        rectangleRef.current = null;
      }
      return;
    }

    if (!rectangleRef.current) {
      const rect = new google.maps.Rectangle({
        map,
        bounds: farmBounds,
        editable: true,
        draggable: true,
        strokeColor: '#15803D',
        strokeOpacity: 0.95,
        strokeWeight: 2.5,
        fillColor: '#22C55E',
        fillOpacity: 0.12,
        zIndex: 1,
      });

      rect.addListener('bounds_changed', () => {
        if (isUpdatingFromPropRef.current) return;
        const b = rect.getBounds();
        if (!b) return;
        const ne = b.getNorthEast();
        const sw = b.getSouthWest();
        onFarmBoundsChange({
          north: ne.lat(),
          south: sw.lat(),
          east: ne.lng(),
          west: sw.lng(),
        });
      });

      rectangleRef.current = rect;
    } else {
      isUpdatingFromPropRef.current = true;
      rectangleRef.current.setBounds(farmBounds);
      isUpdatingFromPropRef.current = false;
    }
  }, [map, farmBounds, onFarmBoundsChange]);

  // Cleanup rectangle on unmount
  useEffect(() => {
    return () => {
      if (rectangleRef.current) {
        google.maps.event.clearInstanceListeners(rectangleRef.current);
        rectangleRef.current.setMap(null);
        rectangleRef.current = null;
      }
    };
  }, []);

  // Drag-a-box drawing mode
  useEffect(() => {
    if (!map) return;

    if (!isDrawingBox) {
      map.setOptions({
        draggable: true,
        draggableCursor: null,
      });
      if (previewRectRef.current) {
        previewRectRef.current.setMap(null);
        previewRectRef.current = null;
      }
      dragStartRef.current = null;
      return;
    }

    map.setOptions({
      draggable: false,
      draggableCursor: 'crosshair',
    });

    const handleMouseDown = (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      dragStartRef.current = e.latLng;

      if (previewRectRef.current) {
        previewRectRef.current.setMap(null);
      }
      previewRectRef.current = new google.maps.Rectangle({
        map,
        bounds: new google.maps.LatLngBounds(e.latLng, e.latLng),
        strokeColor: '#D97706',
        strokeWeight: 2,
        strokeOpacity: 1,
        fillColor: '#F59E0B',
        fillOpacity: 0.18,
        clickable: false,
        zIndex: 5,
      });
    };

    const handleMouseMove = (e: google.maps.MapMouseEvent) => {
      if (!dragStartRef.current || !e.latLng || !previewRectRef.current) return;
      const start = dragStartRef.current;
      const cur = e.latLng;
      previewRectRef.current.setBounds({
        north: Math.max(start.lat(), cur.lat()),
        south: Math.min(start.lat(), cur.lat()),
        east: Math.max(start.lng(), cur.lng()),
        west: Math.min(start.lng(), cur.lng()),
      });
    };

    const handleMouseUp = (e: google.maps.MapMouseEvent) => {
      if (!dragStartRef.current) return;
      const start = dragStartRef.current;
      const end = e.latLng || start;

      const north = Math.max(start.lat(), end.lat());
      const south = Math.min(start.lat(), end.lat());
      const east = Math.max(start.lng(), end.lng());
      const west = Math.min(start.lng(), end.lng());

      if (previewRectRef.current) {
        previewRectRef.current.setMap(null);
        previewRectRef.current = null;
      }
      dragStartRef.current = null;

      // Ensure a sensible minimum box size if user just clicked
      if (north - south < 0.00015 || east - west < 0.00015) {
        const padLat = 0.00075;
        const padLng = 0.0009;
        onFarmBoundsChange({
          north: start.lat() + padLat,
          south: start.lat() - padLat,
          east: start.lng() + padLng,
          west: start.lng() - padLng,
        });
      } else {
        onFarmBoundsChange({ north, south, east, west });
      }
      onFinishDrawingBox();
    };

    const downListener = map.addListener('mousedown', handleMouseDown);
    const moveListener = map.addListener('mousemove', handleMouseMove);
    const upListener = map.addListener('mouseup', handleMouseUp);

    return () => {
      google.maps.event.removeListener(downListener);
      google.maps.event.removeListener(moveListener);
      google.maps.event.removeListener(upListener);
      map.setOptions({ draggable: true, draggableCursor: null });
      if (previewRectRef.current) {
        previewRectRef.current.setMap(null);
        previewRectRef.current = null;
      }
    };
  }, [map, isDrawingBox, onFarmBoundsChange, onFinishDrawingBox]);

  // Covered Path Polyline (Emerald Solid)
  useEffect(() => {
    if (!map) return;

    if (!coveredPolylineRef.current) {
      coveredPolylineRef.current = new google.maps.Polyline({
        map,
        path: coveredPath,
        strokeColor: '#16A34A',
        strokeOpacity: 0.92,
        strokeWeight: 6,
        zIndex: 3,
      });
    } else {
      coveredPolylineRef.current.setPath(coveredPath);
    }
  }, [map, coveredPath]);

  // Suggested Alternative Path Polyline (Amber Dashed + Arrows)
  useEffect(() => {
    if (!map) return;

    const lineSymbol: google.maps.Symbol = {
      path: 'M 0,-1 0,1',
      strokeOpacity: 0.95,
      scale: 3,
    };

    const arrowSymbol: google.maps.Symbol = {
      path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
      scale: 2.8,
      strokeColor: '#F59E0B',
      fillColor: '#F59E0B',
      fillOpacity: 1,
    };

    if (!suggestedPolylineRef.current) {
      suggestedPolylineRef.current = new google.maps.Polyline({
        map,
        path: suggestedPath,
        strokeColor: '#F59E0B',
        strokeOpacity: 0,
        strokeWeight: 3,
        icons: [
          { icon: lineSymbol, offset: '0', repeat: '14px' },
          { icon: arrowSymbol, offset: '36px', repeat: '90px' },
        ],
        zIndex: 2,
      });
    } else {
      suggestedPolylineRef.current.setPath(suggestedPath);
    }
  }, [map, suggestedPath]);

  useEffect(() => {
    return () => {
      coveredPolylineRef.current?.setMap(null);
      suggestedPolylineRef.current?.setMap(null);
    };
  }, []);

  return null;
}

export const FieldMapWorkspace: React.FC<FieldMapWorkspaceProps> = ({
  t,
  mapsApiKey,
  selectedPresetId,
  onSelectPreset,
  farmBounds,
  onFarmBoundsChange,
  tractorPos,
  onMoveTractorManual,
  coveredPath,
  suggestedPath,
  coveragePercent,
  pathStrategy,
  onPathStrategyChange,
  isRunning,
  onToggleRun,
  onResetPath,
  onLocateUser,
  isLocating,
  locationError,
  weedPoints,
  robotSettings,
  telemetry,
  fieldPhotoUrl,
  onUploadFieldPhoto,
  onOpenSettings,
}) => {
  const [isDrawingBox, setIsDrawingBox] = useState(false);
  const [mapTypeId, setMapTypeId] = useState<'hybrid' | 'satellite' | 'terrain' | 'roadmap'>('hybrid');
  const [infoOpen, setInfoOpen] = useState(false);
  const [panTrigger, setPanTrigger] = useState(0);
  const [tractorMarkerRef, tractorMarker] = useAdvancedMarkerRef();
  const fieldInputRef = useRef<HTMLInputElement | null>(null);

  const areaMetrics = useMemo(() => {
    if (!farmBounds) {
      return {
        widthMeters: 0,
        heightMeters: 0,
        areaSqMeters: 0,
        areaHectares: 0,
        areaAcres: 0,
      };
    }
    return computeFarmAreaMetrics(farmBounds);
  }, [farmBounds]);

  const remainingAcres = useMemo(() => {
    return Math.max(0, areaMetrics.areaAcres * (1 - coveragePercent / 100));
  }, [areaMetrics.areaAcres, coveragePercent]);

  const estMinutesRemaining = useMemo(() => {
    if (!farmBounds || coveragePercent >= 100) return 0;
    const remainingSqM = areaMetrics.areaSqMeters * (1 - coveragePercent / 100);
    const speedMs = Math.max(0.5, (robotSettings.targetSpeedKmh * 1000) / 3600);
    const sqMPerMin = speedMs * robotSettings.boomWidthMeters * 60;
    return Math.max(1, Math.round(remainingSqM / sqMPerMin));
  }, [
    farmBounds,
    coveragePercent,
    areaMetrics.areaSqMeters,
    robotSettings.targetSpeedKmh,
    robotSettings.boomWidthMeters,
  ]);

  const tankPercent = Math.round(
    (telemetry.tankLitersRemaining / Math.max(1, robotSettings.tankCapacityLiters)) * 100
  );

  const handleFieldPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onUploadFieldPhoto(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLocateClick = () => {
    onLocateUser();
    setPanTrigger((n) => n + 1);
  };

  const handlePresetChange = (id: string) => {
    onSelectPreset(id);
    setPanTrigger((n) => n + 1);
  };

  const handleFinishDrawingBox = useCallback(() => {
    setIsDrawingBox(false);
  }, []);

  const handleNudgeTractor = (dLat: number, dLng: number) => {
    onMoveTractorManual({
      lat: tractorPos.lat + dLat,
      lng: tractorPos.lng + dLng,
    });
  };

  return (
    <div className="space-y-5">
      {/* Top Field Toolbar */}
      <div className="bg-white border border-[#E2E6DE] rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1 max-w-2xl">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-semibold text-[#111C16] tracking-tight">
              {t.liveTractorMap}
            </h1>
            <span className="text-xs text-[#4E5D53] font-mono tabular-nums">
              {tractorPos.lat.toFixed(5)}, {tractorPos.lng.toFixed(5)}
            </span>
          </div>
          <p className="text-xs text-[#4E5D53] leading-relaxed">
            {t.farmSelectionHint}
          </p>
          {locationError && (
            <p className="text-xs text-amber-700 font-medium">{locationError}</p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleLocateClick}
            disabled={isLocating}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium border border-[#D4DBD1] bg-white text-[#111C16] hover:bg-[#F3F6F1] transition-colors cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-60"
          >
            <LocateFixed className="w-4 h-4 text-emerald-700" />
            {isLocating ? t.locatingGps : t.useMyLocation}
          </button>

          <button
            type="button"
            onClick={() => setIsDrawingBox((prev) => !prev)}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              isDrawingBox
                ? 'bg-amber-600 text-white border-amber-700 hover:bg-amber-700'
                : 'bg-white text-[#111C16] border-[#D4DBD1] hover:bg-[#F3F6F1]'
            }`}
          >
            <SquareDashedMousePointer className="w-4 h-4" />
            {isDrawingBox ? t.drawingActiveButton : t.dragBoxButton}
          </button>

          {farmBounds && (
            <button
              type="button"
              onClick={() => onFarmBoundsChange(null)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-[#D4DBD1] bg-white text-[#4E5D53] hover:text-red-700 hover:border-red-200 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              title={t.clearFarmBox}
            >
              <Trash2 className="w-3.5 h-3.5" />
              {t.clearFarmBox}
            </button>
          )}

          <button
            type="button"
            onClick={onToggleRun}
            disabled={!farmBounds}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-50 ${
              isRunning
                ? 'bg-amber-600 text-white hover:bg-amber-700'
                : 'bg-emerald-700 text-white hover:bg-emerald-800'
            }`}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isRunning ? t.pauseTractorRun : t.startTractorRun}
          </button>

          <button
            type="button"
            onClick={onResetPath}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-[#D4DBD1] bg-white text-[#111C16] hover:bg-[#F3F6F1] transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {t.resetPath}
          </button>
        </div>
      </div>

      {/* Main Split: Google Map (left 8 cols) + Field Visual & Path Planner (right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Map Viewport */}
        <div className="lg:col-span-8 bg-white border border-[#E2E6DE] rounded-xl overflow-hidden flex flex-col">
          {/* Map sub-toolbar: Preset selector, Map Type, Path Legend */}
          <div className="px-4 py-2.5 border-b border-[#E2E6DE] flex flex-wrap items-center justify-between gap-3 bg-[#FAFBF9]">
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-xs text-[#4E5D53]">
                <span className="font-medium whitespace-nowrap">{t.farmPresetLabel}:</span>
                <select
                  value={selectedPresetId}
                  onChange={(e) => handlePresetChange(e.target.value)}
                  className="bg-white border border-[#D4DBD1] rounded-md px-2.5 py-1 text-xs font-medium text-[#111C16] focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  {FARM_PRESETS.map((preset) => (
                    <option key={preset.id} value={preset.id}>
                      {preset.name} ({preset.region})
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex items-center gap-2 text-xs text-[#4E5D53]">
                <span className="font-medium whitespace-nowrap">{t.mapViewLabel}:</span>
                <select
                  value={mapTypeId}
                  onChange={(e) =>
                    setMapTypeId(
                      e.target.value as 'hybrid' | 'satellite' | 'terrain' | 'roadmap'
                    )
                  }
                  className="bg-white border border-[#D4DBD1] rounded-md px-2 py-1 text-xs font-medium text-[#111C16] focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="hybrid">Hybrid</option>
                  <option value="satellite">Satellite</option>
                  <option value="terrain">Terrain</option>
                  <option value="roadmap">Roadmap</option>
                </select>
              </label>
            </div>

            {/* Clean inline map legend */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-[#4E5D53]">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-4 h-1.5 bg-emerald-600 rounded-xs inline-block" />
                {t.coveredPathLegend}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-4 h-0 border-t-2 border-dashed border-amber-500 inline-block" />
                {t.suggestedPathLegend}
              </span>
            </div>
          </div>

          {/* Explicit-height Map Container (CF2 compliance) */}
          <div className="relative w-full h-[500px] lg:h-[600px] bg-[#E8ECE6]">
            {mapsApiKey ? (
              <GoogleMapView
                defaultCenter={tractorPos}
                defaultZoom={18}
                mapId="DEMO_MAP_ID"
                mapTypeId={mapTypeId}
                gestureHandling={isDrawingBox ? 'none' : 'greedy'}
                disableDefaultUI={false}
                streetViewControl={false}
                mapTypeControl={false}
                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                style={{ width: '100%', height: '100%' }}
              >
                <FarmOverlayController
                  farmBounds={farmBounds}
                  onFarmBoundsChange={(b) => onFarmBoundsChange(b)}
                  isDrawingBox={isDrawingBox}
                  onFinishDrawingBox={handleFinishDrawingBox}
                  coveredPath={coveredPath}
                  suggestedPath={suggestedPath}
                  tractorPos={tractorPos}
                  shouldPanToTractor={panTrigger}
                />

                {/* Weed Detection Hotspots inside the Farm Box */}
                {weedPoints.map((wp) => (
                  <AdvancedMarker
                    key={wp.id}
                    position={wp.position}
                    zIndex={wp.injected ? 10 : 20}
                    title={`${wp.type} weed (${wp.injected ? 'Injected' : 'Detected'})`}
                  >
                    <div
                      className={`w-3 h-3 rounded-full border transition-transform ${
                        wp.injected
                          ? 'bg-emerald-500/80 border-white scale-90'
                          : 'bg-red-600 border-white shadow-sm'
                      }`}
                    />
                  </AdvancedMarker>
                ))}

                {/* Live Tractor + ERADIX Weed-Bot Marker */}
                <AdvancedMarker
                  ref={tractorMarkerRef}
                  position={tractorPos}
                  zIndex={100}
                  onClick={() => setInfoOpen(true)}
                  title={t.tractorPositionLabel}
                >
                  <div className="flex flex-col items-center cursor-pointer">
                    <div
                      className="w-10 h-10 rounded-full bg-[#111C16] border-2 border-white shadow-lg flex items-center justify-center text-white"
                      style={{
                        transform: `rotate(${telemetry.headingDegrees}deg)`,
                      }}
                    >
                      <Compass className="w-5 h-5 text-emerald-400" />
                    </div>
                    <span className="mt-1 px-2 py-0.5 rounded bg-[#111C16]/90 text-white text-[11px] font-semibold whitespace-nowrap shadow">
                      {t.tractorPositionLabel}
                    </span>
                  </div>
                </AdvancedMarker>

                {infoOpen && tractorMarker && (
                  <InfoWindow
                    anchor={tractorMarker}
                    onCloseClick={() => setInfoOpen(false)}
                  >
                    <div className="p-1 max-w-[230px] text-[#111C16]">
                      <div className="font-semibold text-sm mb-1">
                        {t.tractorPositionLabel}
                      </div>
                      <img
                        src={fieldPhotoUrl}
                        alt={t.fieldImageTitle}
                        referrerPolicy="no-referrer"
                        className="w-full h-24 object-cover rounded mb-2"
                      />
                      <div className="text-xs space-y-0.5 font-mono tabular-nums text-[#4E5D53]">
                        <div>
                          GPS: {tractorPos.lat.toFixed(5)}, {tractorPos.lng.toFixed(5)}
                        </div>
                        <div>
                          Speed: {telemetry.currentSpeedKmh.toFixed(1)} km/h
                        </div>
                        <div>
                          Injected: {telemetry.injectedWeedsCount} plants
                        </div>
                        <div>
                          Tank: {telemetry.tankLitersRemaining.toFixed(1)} L ({tankPercent}%)
                        </div>
                      </div>
                    </div>
                  </InfoWindow>
                )}
              </GoogleMapView>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-[#4E5D53]">
                <Crosshair className="w-8 h-8 mb-2 text-emerald-700" />
                <p className="text-sm font-medium text-[#111C16]">
                  Loading Google Maps field view...
                </p>
              </div>
            )}

            {/* Manual Tractor Jog Pad (bottom-left overlay for testing off-path alternative suggestions) */}
            <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur border border-[#D4DBD1] rounded-lg p-2 shadow-sm flex flex-col items-center gap-1">
              <button
                type="button"
                onClick={() => handleNudgeTractor(0.00009, 0)}
                className="w-7 h-7 rounded bg-[#F3F6F1] hover:bg-emerald-100 text-[#111C16] text-xs font-bold flex items-center justify-center cursor-pointer"
                aria-label="Move North"
              >
                N
              </button>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleNudgeTractor(0, -0.00009)}
                  className="w-7 h-7 rounded bg-[#F3F6F1] hover:bg-emerald-100 text-[#111C16] text-xs font-bold flex items-center justify-center cursor-pointer"
                  aria-label="Move West"
                >
                  W
                </button>
                <div className="w-7 h-7 rounded border border-[#E2E6DE] flex items-center justify-center text-[10px] font-mono text-[#4E5D53]">
                  GPS
                </div>
                <button
                  type="button"
                  onClick={() => handleNudgeTractor(0, 0.00009)}
                  className="w-7 h-7 rounded bg-[#F3F6F1] hover:bg-emerald-100 text-[#111C16] text-xs font-bold flex items-center justify-center cursor-pointer"
                  aria-label="Move East"
                >
                  E
                </button>
              </div>
              <button
                type="button"
                onClick={() => handleNudgeTractor(-0.00009, 0)}
                className="w-7 h-7 rounded bg-[#F3F6F1] hover:bg-emerald-100 text-[#111C16] text-xs font-bold flex items-center justify-center cursor-pointer"
                aria-label="Move South"
              >
                S
              </button>
            </div>
          </div>
        </div>

        {/* Right Side Panel: Field Visual + Coverage Planner + Live Telemetry */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* Farmer's Field Visual Card */}
          <div className="bg-white border border-[#E2E6DE] rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[#E2E6DE] flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-[#111C16]">
                {t.fieldImageTitle}
              </h2>
              <input
                ref={fieldInputRef}
                type="file"
                accept="image/*"
                onChange={handleFieldPhotoChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fieldInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-800 hover:text-emerald-950 cursor-pointer whitespace-nowrap"
              >
                <Camera className="w-3.5 h-3.5" />
                {t.uploadFieldPhoto}
              </button>
            </div>

            <div className="relative aspect-16/9 bg-[#E8ECE6]">
              <img
                src={fieldPhotoUrl}
                alt={t.fieldImageTitle}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = CROP_ROW_INSPECTION_PHOTO;
                }}
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3.5 py-2.5 text-white flex items-center justify-between text-xs">
                <span className="font-medium truncate">
                  {FARM_PRESETS.find((p) => p.id === selectedPresetId)?.region ||
                    'Live Farm Plot'}
                </span>
                <span className="font-mono tabular-nums text-emerald-300 whitespace-nowrap">
                  {robotSettings.boomWidthMeters.toFixed(1)}m boom
                </span>
              </div>
            </div>
          </div>

          {/* Alternative Path Strategy & Coverage Metrics */}
          <div className="bg-white border border-[#E2E6DE] rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#111C16] flex items-center gap-2">
                <Route className="w-4 h-4 text-amber-600" />
                {t.pathStrategyLabel}
              </h2>
              {coveragePercent >= 100 && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  100%
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-1 p-1 bg-[#F3F6F1] rounded-lg">
              {(
                [
                  { id: 'serpentine-ns', label: t.strategySerpentine },
                  { id: 'contour-ew', label: t.strategyContour },
                  { id: 'perimeter-spiral', label: t.strategySpiral },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onPathStrategyChange(opt.id)}
                  className={`px-2 py-1.5 text-[11px] font-medium rounded-md transition-colors cursor-pointer truncate ${
                    pathStrategy === opt.id
                      ? 'bg-white text-[#111C16] shadow-xs'
                      : 'text-[#4E5D53] hover:text-[#111C16]'
                  }`}
                  title={opt.label}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-[#4E5D53]">{t.coverageLabel}</span>
                <span className="font-mono font-semibold text-[#111C16] tabular-nums">
                  {coveragePercent}%
                </span>
              </div>
              <div className="w-full h-2 bg-[#E8ECE6] rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 transition-all duration-300"
                  style={{ width: `${coveragePercent}%` }}
                />
              </div>
            </div>

            {/* Tabular Farm Metrics Grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 pt-2 border-t border-[#E2E6DE]">
              <div>
                <div className="text-[11px] text-[#4E5D53]">{t.farmAreaLabel}</div>
                <div className="text-sm font-semibold font-mono tabular-nums text-[#111C16]">
                  {areaMetrics.areaAcres.toFixed(2)} ac
                  <span className="text-xs font-normal text-[#4E5D53] ml-1">
                    ({areaMetrics.areaHectares.toFixed(2)} ha)
                  </span>
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[#4E5D53]">{t.remainingAreaLabel}</div>
                <div className="text-sm font-semibold font-mono tabular-nums text-amber-700">
                  {remainingAcres.toFixed(2)} ac
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[#4E5D53]">{t.estTimeRemaining}</div>
                <div className="text-sm font-semibold font-mono tabular-nums text-[#111C16]">
                  {estMinutesRemaining} min
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[#4E5D53]">{t.injectedShort}</div>
                <div className="text-sm font-semibold font-mono tabular-nums text-emerald-700">
                  {telemetry.injectedWeedsCount}
                </div>
              </div>
            </div>
          </div>

          {/* Compact Robot Status Strip */}
          <div className="bg-white border border-[#E2E6DE] rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="py-1">
                <div className="text-[11px] text-[#4E5D53]">{t.dosageShort}</div>
                <div className="text-base font-semibold font-mono tabular-nums text-[#111C16]">
                  {robotSettings.dosageMlPerPlant.toFixed(1)} mL
                </div>
              </div>
              <div className="py-1 border-x border-[#E2E6DE]">
                <div className="text-[11px] text-[#4E5D53]">{t.tankShort}</div>
                <div
                  className={`text-base font-semibold font-mono tabular-nums ${
                    tankPercent < 20 ? 'text-red-600' : 'text-[#111C16]'
                  }`}
                >
                  {tankPercent}%
                </div>
              </div>
              <div className="py-1">
                <div className="text-[11px] text-[#4E5D53]">{t.batteryShort}</div>
                <div
                  className={`text-base font-semibold font-mono tabular-nums ${
                    telemetry.batteryPercent < 20 ? 'text-red-600' : 'text-emerald-700'
                  }`}
                >
                  {Math.round(telemetry.batteryPercent)}%
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenSettings}
              className="w-full py-2 px-3 rounded-lg border border-[#D4DBD1] text-xs font-medium text-[#111C16] hover:bg-[#F3F6F1] transition-colors cursor-pointer"
            >
              {t.navSettings}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
