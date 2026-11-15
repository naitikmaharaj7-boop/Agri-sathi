import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import { Globe } from 'lucide-react';
import { FieldMapWorkspace } from './components/FieldMapWorkspace';
import { RobotSettingsWorkspace } from './components/RobotSettingsWorkspace';
import { ChatbotWorkspace } from './components/ChatbotWorkspace';
import { LANGUAGE_OPTIONS, TRANSLATIONS } from './i18n/translations';
import type {
  ActiveTab,
  FarmBounds,
  LanguageCode,
  LatLngLiteral,
  PathStrategy,
  RobotSettings,
  RobotTelemetry,
  WeedDetectionPoint,
} from './types';
import {
  DEFAULT_ERADIX_LOGO,
  DEFAULT_FIELD_PHOTO,
  FARM_PRESETS,
  buildBoundsAroundCenter,
  computeCoverageAndAlternativePath,
  computeFarmAreaMetrics,
  computeHeadingDegrees,
  generateWeedHotspots,
  haversineDistanceMeters,
} from './utils/farmPathPlanner';

const DEFAULT_PRESET = FARM_PRESETS[0];

export default function App() {
  const [mapsApiKey, setMapsApiKey] = useState<string>(
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  );
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  const [language, setLanguage] = useState<LanguageCode>('en');
  const [activeTab, setActiveTab] = useState<ActiveTab>('map');

  // Brand & field photos (with localStorage persistence for uploaded assets)
  const [companyLogoUrl, setCompanyLogoUrl] = useState<string>(() => {
    try {
      return localStorage.getItem('eradix_company_logo') || DEFAULT_ERADIX_LOGO;
    } catch {
      return DEFAULT_ERADIX_LOGO;
    }
  });
  const [fieldPhotoUrl, setFieldPhotoUrl] = useState<string>(() => {
    try {
      return localStorage.getItem('agrisathi_field_photo') || DEFAULT_FIELD_PHOTO;
    } catch {
      return DEFAULT_FIELD_PHOTO;
    }
  });

  // Farm & path state
  const [selectedPresetId, setSelectedPresetId] = useState<string>(
    DEFAULT_PRESET.id
  );
  const [farmBounds, setFarmBounds] = useState<FarmBounds | null>(
    DEFAULT_PRESET.bounds
  );
  const [tractorPos, setTractorPos] = useState<LatLngLiteral>({
    lat: DEFAULT_PRESET.bounds.south + 0.00015,
    lng: DEFAULT_PRESET.bounds.west + 0.00018,
  });
  const [coveredPath, setCoveredPath] = useState<LatLngLiteral[]>([
    {
      lat: DEFAULT_PRESET.bounds.south + 0.00015,
      lng: DEFAULT_PRESET.bounds.west + 0.00018,
    },
  ]);
  const [pathStrategy, setPathStrategy] =
    useState<PathStrategy>('serpentine-ns');
  const [isRunning, setIsRunning] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [weedPoints, setWeedPoints] = useState<WeedDetectionPoint[]>(() =>
    generateWeedHotspots(DEFAULT_PRESET.bounds)
  );

  // Robot Settings & Telemetry
  const [robotSettings, setRobotSettings] = useState<RobotSettings>({
    dosageMlPerPlant: 8.5,
    tankCapacityLiters: 120,
    boomWidthMeters: 4.5,
    targetSpeedKmh: 6.5,
    detectionSensitivity: 91,
    pumpPowerMode: 'standard',
    sprayerActive: true,
    autoAvoidCropRows: true,
  });

  const [telemetry, setTelemetry] = useState<RobotTelemetry>({
    tankLitersRemaining: 104.5,
    batteryPercent: 86,
    batteryVoltage: 48.2,
    injectedWeedsCount: 142,
    weedBreakdown: {
      broadleaf: 78,
      grassy: 44,
      sedge: 20,
    },
    currentSpeedKmh: 0,
    headingDegrees: 0,
    nozzlePressureBar: 2.8,
    operatingMinutes: 38,
  });

  const t = TRANSLATIONS[language];

  // Fetch provisioned Google Maps API key safely from backend /api/config
  useEffect(() => {
    let mounted = true;
    fetch('/api/config')
      .then((res) => res.json())
      .then((data: { mapsApiKey?: string }) => {
        if (mounted && data.mapsApiKey) {
          setMapsApiKey(data.mapsApiKey);
        }
      })
      .catch(() => {
        // Fallback to Vite env if already set
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Listen for Maps quota exceeded events
  useEffect(() => {
    const handler = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handler);
    return () => window.removeEventListener('gmp-quota-exceeded', handler);
  }, []);

  const handleUpdateCompanyLogo = useCallback((url: string) => {
    setCompanyLogoUrl(url);
    try {
      if (url === DEFAULT_ERADIX_LOGO) {
        localStorage.removeItem('eradix_company_logo');
      } else {
        localStorage.setItem('eradix_company_logo', url);
      }
    } catch {
      // Ignore storage quota errors
    }
  }, []);

  const handleUploadFieldPhoto = useCallback((url: string) => {
    setFieldPhotoUrl(url);
    try {
      localStorage.setItem('agrisathi_field_photo', url);
    } catch {
      // Ignore storage quota errors
    }
  }, []);

  // Compute live coverage & suggested alternative farm path
  const coverageResult = useMemo(() => {
    if (!farmBounds) {
      return {
        coveragePercent: 0,
        remainingPath: [],
        totalGridCells: 0,
        coveredGridCells: 0,
      };
    }
    return computeCoverageAndAlternativePath(
      farmBounds,
      coveredPath,
      tractorPos,
      robotSettings.boomWidthMeters,
      pathStrategy
    );
  }, [
    farmBounds,
    coveredPath,
    tractorPos,
    robotSettings.boomWidthMeters,
    pathStrategy,
  ]);

  const farmAreaAcres = useMemo(() => {
    if (!farmBounds) return 0;
    return computeFarmAreaMetrics(farmBounds).areaAcres;
  }, [farmBounds]);

  // Ref holding latest state for smooth 250ms tractor simulation tick
  const simStateRef = useRef({
    tractorPos,
    remainingPath: coverageResult.remainingPath,
    robotSettings,
    telemetry,
    weedPoints,
  });
  simStateRef.current = {
    tractorPos,
    remainingPath: coverageResult.remainingPath,
    robotSettings,
    telemetry,
    weedPoints,
  };

  useEffect(() => {
    if (!isRunning || !farmBounds) {
      setTelemetry((prev) => ({ ...prev, currentSpeedKmh: 0 }));
      return;
    }

    const interval = window.setInterval(() => {
      const {
        tractorPos: curPos,
        remainingPath: remPath,
        robotSettings: cfg,
        telemetry: tel,
      } = simStateRef.current;

      if (tel.batteryPercent <= 1) {
        setIsRunning(false);
        return;
      }

      // Target waypoint is index 1 (index 0 is current pos)
      const target = remPath[1];
      if (!target) {
        setIsRunning(false);
        return;
      }

      const distMeters = haversineDistanceMeters(curPos, target);
      // Scale simulation step comfortably so user sees live progress clearly on screen
      const stepMeters = Math.max(2.5, (cfg.targetSpeedKmh * 1000) / 3600 * 1.6);

      let nextPos: LatLngLiteral;
      if (distMeters <= stepMeters) {
        nextPos = target;
      } else {
        const ratio = stepMeters / distMeters;
        nextPos = {
          lat: curPos.lat + (target.lat - curPos.lat) * ratio,
          lng: curPos.lng + (target.lng - curPos.lng) * ratio,
        };
      }

      const heading = computeHeadingDegrees(curPos, nextPos);
      setTractorPos(nextPos);
      setCoveredPath((prev) => [...prev, nextPos]);

      // Check weed injection within boom swath
      let newlyInjected = 0;
      let broadleafAdd = 0;
      let grassyAdd = 0;
      let sedgeAdd = 0;

      if (cfg.sprayerActive && tel.tankLitersRemaining > 0.05) {
        const triggerRadius = Math.max(6, cfg.boomWidthMeters * 1.4);
        setWeedPoints((prevWeeds) =>
          prevWeeds.map((wp) => {
            if (wp.injected) return wp;
            if (haversineDistanceMeters(nextPos, wp.position) <= triggerRadius) {
              newlyInjected += 1;
              if (wp.type === 'broadleaf') broadleafAdd += 1;
              else if (wp.type === 'grassy') grassyAdd += 1;
              else sedgeAdd += 1;
              return { ...wp, injected: true, dosageMl: cfg.dosageMlPerPlant };
            }
            return wp;
          })
        );
      }

      const batteryDrain =
        cfg.pumpPowerMode === 'turbo'
          ? 0.16
          : cfg.pumpPowerMode === 'eco'
            ? 0.07
            : 0.11;

      setTelemetry((prev) => {
        const litersUsed = (newlyInjected * cfg.dosageMlPerPlant) / 1000;
        const nextTank = Math.max(0, prev.tankLitersRemaining - litersUsed);
        const nextBatt = Math.max(0, prev.batteryPercent - batteryDrain);
        return {
          ...prev,
          currentSpeedKmh: cfg.targetSpeedKmh,
          headingDegrees: heading,
          tankLitersRemaining: nextTank,
          batteryPercent: nextBatt,
          batteryVoltage: Number((42 + (nextBatt / 100) * 7.2).toFixed(1)),
          injectedWeedsCount: prev.injectedWeedsCount + newlyInjected,
          weedBreakdown: {
            broadleaf: prev.weedBreakdown.broadleaf + broadleafAdd,
            grassy: prev.weedBreakdown.grassy + grassyAdd,
            sedge: prev.weedBreakdown.sedge + sedgeAdd,
          },
        };
      });
    }, 350);

    return () => window.clearInterval(interval);
  }, [isRunning, farmBounds]);

  const handleSelectPreset = useCallback((presetId: string) => {
    const preset = FARM_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setIsRunning(false);
    setSelectedPresetId(presetId);
    setFarmBounds(preset.bounds);
    const startPt = {
      lat: preset.bounds.south + 0.00015,
      lng: preset.bounds.west + 0.00018,
    };
    setTractorPos(startPt);
    setCoveredPath([startPt]);
    setWeedPoints(generateWeedHotspots(preset.bounds));
    setLocationError(null);
  }, []);

  const handleFarmBoundsChange = useCallback((bounds: FarmBounds | null) => {
    setIsRunning(false);
    setFarmBounds(bounds);
    if (bounds) {
      setWeedPoints(generateWeedHotspots(bounds));
      // Keep tractor inside or place at southwest corner if outside
      setTractorPos((cur) => {
        const inside =
          cur.lat >= bounds.south &&
          cur.lat <= bounds.north &&
          cur.lng >= bounds.west &&
          cur.lng <= bounds.east;
        if (inside) return cur;
        const startPt = {
          lat: bounds.south + (bounds.north - bounds.south) * 0.08,
          lng: bounds.west + (bounds.east - bounds.west) * 0.08,
        };
        setCoveredPath([startPt]);
        return startPt;
      });
    } else {
      setWeedPoints([]);
      setCoveredPath([]);
    }
  }, []);

  const handleMoveTractorManual = useCallback(
    (nextPos: LatLngLiteral) => {
      const heading = computeHeadingDegrees(tractorPos, nextPos);
      setTractorPos(nextPos);
      setCoveredPath((prev) => [...prev, nextPos]);
      setTelemetry((prev) => ({
        ...prev,
        headingDegrees: heading,
        currentSpeedKmh: robotSettings.targetSpeedKmh,
      }));
    },
    [tractorPos, robotSettings.targetSpeedKmh]
  );

  const handleResetPath = useCallback(() => {
    setIsRunning(false);
    if (farmBounds) {
      const startPt = {
        lat: farmBounds.south + (farmBounds.north - farmBounds.south) * 0.08,
        lng: farmBounds.west + (farmBounds.east - farmBounds.west) * 0.08,
      };
      setTractorPos(startPt);
      setCoveredPath([startPt]);
      setWeedPoints(generateWeedHotspots(farmBounds));
    } else {
      setCoveredPath([tractorPos]);
    }
  }, [farmBounds, tractorPos]);

  const handleLocateUser = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const livePos = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        const newBounds = buildBoundsAroundCenter(livePos, 210, 170);
        setIsRunning(false);
        setTractorPos(livePos);
        setFarmBounds(newBounds);
        setCoveredPath([livePos]);
        setWeedPoints(generateWeedHotspots(newBounds));
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        setLocationError(
          err.message ||
            'Unable to access GPS. You can still select a farm box anywhere on the map.'
        );
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  const handleUpdateSettings = useCallback((patch: Partial<RobotSettings>) => {
    setRobotSettings((prev) => {
      const next = { ...prev, ...patch };
      if (
        patch.tankCapacityLiters !== undefined &&
        patch.tankCapacityLiters !== prev.tankCapacityLiters
      ) {
        setTelemetry((tPrev) => ({
          ...tPrev,
          tankLitersRemaining: Math.min(
            patch.tankCapacityLiters!,
            tPrev.tankLitersRemaining
          ),
        }));
      }
      return next;
    });
  }, []);

  const handleRefillTank = useCallback(() => {
    setTelemetry((prev) => ({
      ...prev,
      tankLitersRemaining: robotSettings.tankCapacityLiters,
    }));
  }, [robotSettings.tankCapacityLiters]);

  const handleRechargeBattery = useCallback(() => {
    setTelemetry((prev) => ({
      ...prev,
      batteryPercent: 100,
      batteryVoltage: 49.2,
    }));
  }, []);

  const handleResetWeedCount = useCallback(() => {
    setTelemetry((prev) => ({
      ...prev,
      injectedWeedsCount: 0,
      weedBreakdown: { broadleaf: 0, grassy: 0, sedge: 0 },
    }));
    if (farmBounds) {
      setWeedPoints(generateWeedHotspots(farmBounds));
    }
  }, [farmBounds]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8F5] text-[#111C16]">
      {/* Case A Demo Key Quota Banner */}
      {quotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Three-Zone Top Navigation Bar */}
      <header className="bg-white border-b border-[#E2E6DE] sticky top-0 z-40">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: ERADIX Logo + Agri Sathi Wordmark */}
          <button
            type="button"
            onClick={() => setActiveTab('map')}
            className="flex items-center gap-3 whitespace-nowrap shrink-0 cursor-pointer text-left"
          >
            <img
              src={companyLogoUrl}
              alt="ERADIX Logo"
              referrerPolicy="no-referrer"
              className="w-9 h-9 rounded-lg object-contain border border-[#E2E6DE] bg-white p-0.5 shrink-0"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
            <span className="font-display text-lg font-bold tracking-tight text-[#111C16] whitespace-nowrap shrink-0">
              {t.appName}
            </span>
          </button>

          {/* Zone 2: Clean Single-Line Nav Links */}
          <nav
            aria-label="Primary"
            className="flex items-center gap-5 sm:gap-7 overflow-x-auto"
          >
            {(
              [
                { id: 'map', label: t.navMap },
                { id: 'settings', label: t.navSettings },
                { id: 'chat', label: t.navChat },
              ] as const
            ).map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'border-emerald-700 text-[#111C16]'
                      : 'border-transparent text-[#4E5D53] hover:text-[#111C16]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Language Switcher */}
          <div className="flex items-center shrink-0">
            <label className="inline-flex items-center gap-2 border border-[#D4DBD1] bg-[#FAFBF9] rounded-lg px-2.5 py-1.5">
              <Globe className="w-4 h-4 text-emerald-700 shrink-0" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as LanguageCode)}
                aria-label="Select application language"
                className="bg-transparent text-xs font-medium text-[#111C16] focus:outline-none cursor-pointer"
              >
                {LANGUAGE_OPTIONS.map((opt) => (
                  <option key={opt.code} value={opt.code}>
                    {opt.nativeLabel}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'map' &&
          (mapsApiKey ? (
            <APIProvider
              apiKey={mapsApiKey}
              region="IN"
              libraries={['marker', 'geometry']}
            >
              <FieldMapWorkspace
                t={t}
                mapsApiKey={mapsApiKey}
                selectedPresetId={selectedPresetId}
                onSelectPreset={handleSelectPreset}
                farmBounds={farmBounds}
                onFarmBoundsChange={handleFarmBoundsChange}
                tractorPos={tractorPos}
                onMoveTractorManual={handleMoveTractorManual}
                coveredPath={coveredPath}
                suggestedPath={coverageResult.remainingPath}
                coveragePercent={coverageResult.coveragePercent}
                pathStrategy={pathStrategy}
                onPathStrategyChange={setPathStrategy}
                isRunning={isRunning}
                onToggleRun={() => setIsRunning((r) => !r)}
                onResetPath={handleResetPath}
                onLocateUser={handleLocateUser}
                isLocating={isLocating}
                locationError={locationError}
                weedPoints={weedPoints}
                robotSettings={robotSettings}
                telemetry={telemetry}
                fieldPhotoUrl={fieldPhotoUrl}
                onUploadFieldPhoto={handleUploadFieldPhoto}
                onOpenSettings={() => setActiveTab('settings')}
              />
            </APIProvider>
          ) : (
            <FieldMapWorkspace
              t={t}
              mapsApiKey=""
              selectedPresetId={selectedPresetId}
              onSelectPreset={handleSelectPreset}
              farmBounds={farmBounds}
              onFarmBoundsChange={handleFarmBoundsChange}
              tractorPos={tractorPos}
              onMoveTractorManual={handleMoveTractorManual}
              coveredPath={coveredPath}
              suggestedPath={coverageResult.remainingPath}
              coveragePercent={coverageResult.coveragePercent}
              pathStrategy={pathStrategy}
              onPathStrategyChange={setPathStrategy}
              isRunning={isRunning}
              onToggleRun={() => setIsRunning((r) => !r)}
              onResetPath={handleResetPath}
              onLocateUser={handleLocateUser}
              isLocating={isLocating}
              locationError={locationError}
              weedPoints={weedPoints}
              robotSettings={robotSettings}
              telemetry={telemetry}
              fieldPhotoUrl={fieldPhotoUrl}
              onUploadFieldPhoto={handleUploadFieldPhoto}
              onOpenSettings={() => setActiveTab('settings')}
            />
          ))}

        {activeTab === 'settings' && (
          <RobotSettingsWorkspace
            t={t}
            settings={robotSettings}
            onUpdateSettings={handleUpdateSettings}
            telemetry={telemetry}
            onRefillTank={handleRefillTank}
            onRechargeBattery={handleRechargeBattery}
            onResetWeedCount={handleResetWeedCount}
            companyLogoUrl={companyLogoUrl}
            onUpdateCompanyLogo={handleUpdateCompanyLogo}
          />
        )}

        {activeTab === 'chat' && (
          <ChatbotWorkspace
            t={t}
            language={language}
            onLanguageChange={setLanguage}
            robotSettings={robotSettings}
            telemetry={telemetry}
            coveragePercent={coverageResult.coveragePercent}
            farmAreaAcres={farmAreaAcres}
            pathStrategy={pathStrategy}
          />
        )}
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="border-t border-[#E2E6DE] bg-white mt-auto">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-[#4E5D53]">
          <span>Agri Sathi · ERADIX Precision Agronomy</span>
          <span>
            Map data &amp; imagery via Google Maps Platform
          </span>
        </div>
      </footer>
    </div>
  );
}
