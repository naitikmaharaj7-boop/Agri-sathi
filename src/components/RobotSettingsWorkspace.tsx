import React, { useRef } from 'react';
import {
  AlertTriangle,
  BatteryCharging,
  Droplets,
  Gauge,
  Minus,
  Plus,
  Power,
  RotateCcw,
  ShieldCheck,
  Sprout,
  Upload,
} from 'lucide-react';
import type { RobotSettings, RobotTelemetry } from '../types';
import type { TranslationStrings } from '../i18n/translations';
import { DEFAULT_ERADIX_LOGO } from '../utils/farmPathPlanner';

interface RobotSettingsWorkspaceProps {
  t: TranslationStrings;
  settings: RobotSettings;
  onUpdateSettings: (patch: Partial<RobotSettings>) => void;
  telemetry: RobotTelemetry;
  onRefillTank: () => void;
  onRechargeBattery: () => void;
  onResetWeedCount: () => void;
  companyLogoUrl: string;
  onUpdateCompanyLogo: (url: string) => void;
}

export const RobotSettingsWorkspace: React.FC<RobotSettingsWorkspaceProps> = ({
  t,
  settings,
  onUpdateSettings,
  telemetry,
  onRefillTank,
  onRechargeBattery,
  onResetWeedCount,
  companyLogoUrl,
  onUpdateCompanyLogo,
}) => {
  const logoInputRef = useRef<HTMLInputElement | null>(null);

  const tankPercent = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        (telemetry.tankLitersRemaining / Math.max(1, settings.tankCapacityLiters)) *
          100
      )
    )
  );

  const batteryHoursLeft = (() => {
    const drainFactor =
      settings.pumpPowerMode === 'turbo'
        ? 4.2
        : settings.pumpPowerMode === 'eco'
          ? 8.5
          : 6.4;
    const hours = (telemetry.batteryPercent / 100) * drainFactor;
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  })();

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onUpdateCompanyLogo(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="bg-white border border-[#E2E6DE] rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[#111C16] tracking-tight">
            {t.settingsTitle}
          </h1>
          <p className="text-sm text-[#4E5D53] mt-1">{t.settingsSubtitle}</p>
        </div>

        <button
          type="button"
          onClick={() =>
            onUpdateSettings({ sprayerActive: !settings.sprayerActive })
          }
          className={`inline-flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
            settings.sprayerActive
              ? 'bg-emerald-700 text-white border-emerald-800 hover:bg-emerald-800'
              : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
          }`}
        >
          <Power className="w-4 h-4" />
          <span>
            {t.sprayerMasterLabel}:{' '}
            {settings.sprayerActive ? t.sprayerActiveState : t.sprayerStandbyState}
          </span>
        </button>
      </div>

      {/* Main 2-Column Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 1. Weedicide Dosage per Plant */}
        <section className="bg-white border border-[#E2E6DE] rounded-xl p-5 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-[#111C16]">
                {t.dosageSettingTitle}
              </h2>
              <p className="text-xs text-[#4E5D53] mt-0.5">
                {t.dosageSettingDesc}
              </p>
            </div>
            <div className="text-right font-mono tabular-nums">
              <span className="text-2xl font-bold text-emerald-700">
                {settings.dosageMlPerPlant.toFixed(1)}
              </span>
              <span className="text-xs text-[#4E5D53] ml-1">mL/plant</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                onUpdateSettings({
                  dosageMlPerPlant: Math.max(
                    2,
                    Number((settings.dosageMlPerPlant - 0.5).toFixed(1))
                  ),
                })
              }
              className="w-9 h-9 rounded-lg border border-[#D4DBD1] flex items-center justify-center hover:bg-[#F3F6F1] cursor-pointer"
              aria-label="Decrease dosage"
            >
              <Minus className="w-4 h-4" />
            </button>
            <input
              type="range"
              min={2}
              max={25}
              step={0.5}
              value={settings.dosageMlPerPlant}
              onChange={(e) =>
                onUpdateSettings({ dosageMlPerPlant: Number(e.target.value) })
              }
              className="flex-1 accent-emerald-700 cursor-pointer"
            />
            <button
              type="button"
              onClick={() =>
                onUpdateSettings({
                  dosageMlPerPlant: Math.min(
                    25,
                    Number((settings.dosageMlPerPlant + 0.5).toFixed(1))
                  ),
                })
              }
              className="w-9 h-9 rounded-lg border border-[#D4DBD1] flex items-center justify-center hover:bg-[#F3F6F1] cursor-pointer"
              aria-label="Increase dosage"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {settings.dosageMlPerPlant > 16 && (
            <div className="flex items-center gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{t.dosageHighWarning}</span>
            </div>
          )}
        </section>

        {/* 2. Infected Plants Injected Counter */}
        <section className="bg-white border border-[#E2E6DE] rounded-xl p-5 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Sprout className="w-5 h-5 text-emerald-700" />
              <h2 className="text-base font-semibold text-[#111C16]">
                {t.infectedCountTitle}
              </h2>
            </div>
            <button
              type="button"
              onClick={onResetWeedCount}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D4DBD1] text-xs font-medium text-[#4E5D53] hover:text-[#111C16] hover:bg-[#F3F6F1] cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {t.resetCounterButton}
            </button>
          </div>

          <div className="text-3xl font-bold font-mono tabular-nums text-[#111C16]">
            {telemetry.injectedWeedsCount.toLocaleString()}
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-[#E2E6DE]">
            <div>
              <div className="text-[11px] text-[#4E5D53]">{t.broadleafLabel}</div>
              <div className="text-sm font-semibold font-mono tabular-nums text-[#111C16]">
                {telemetry.weedBreakdown.broadleaf}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-[#4E5D53]">{t.grassyLabel}</div>
              <div className="text-sm font-semibold font-mono tabular-nums text-[#111C16]">
                {telemetry.weedBreakdown.grassy}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-[#4E5D53]">{t.sedgeLabel}</div>
              <div className="text-sm font-semibold font-mono tabular-nums text-[#111C16]">
                {telemetry.weedBreakdown.sedge}
              </div>
            </div>
          </div>
        </section>

        {/* 3. Herbicide Tank Reserve */}
        <section className="bg-white border border-[#E2E6DE] rounded-xl p-5 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Droplets className="w-5 h-5 text-emerald-700" />
              <h2 className="text-base font-semibold text-[#111C16]">
                {t.tankSettingTitle}
              </h2>
            </div>
            <button
              type="button"
              onClick={onRefillTank}
              className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-medium hover:bg-emerald-800 cursor-pointer whitespace-nowrap"
            >
              {t.refillTankButton}
            </button>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-[#4E5D53]">{t.tankRemainingLabel}</span>
              <span className="font-mono font-semibold tabular-nums text-[#111C16]">
                {telemetry.tankLitersRemaining.toFixed(1)} L / {settings.tankCapacityLiters} L ({tankPercent}%)
              </span>
            </div>
            <div className="w-full h-3 bg-[#E8ECE6] rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  tankPercent < 20 ? 'bg-red-600' : 'bg-emerald-600'
                }`}
                style={{ width: `${tankPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#E2E6DE]">
            <span className="text-xs font-medium text-[#4E5D53]">
              {t.tankCapacityLabel}
            </span>
            <div className="flex items-center gap-1 p-1 bg-[#F3F6F1] rounded-lg">
              {[80, 120, 160].map((cap) => (
                <button
                  key={cap}
                  type="button"
                  onClick={() => onUpdateSettings({ tankCapacityLiters: cap })}
                  className={`px-3 py-1 text-xs font-mono font-medium rounded-md cursor-pointer ${
                    settings.tankCapacityLiters === cap
                      ? 'bg-white text-[#111C16] shadow-xs'
                      : 'text-[#4E5D53] hover:text-[#111C16]'
                  }`}
                >
                  {cap} L
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Battery Life & Power Mode */}
        <section className="bg-white border border-[#E2E6DE] rounded-xl p-5 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <BatteryCharging className="w-5 h-5 text-emerald-700" />
              <h2 className="text-base font-semibold text-[#111C16]">
                {t.batterySettingTitle}
              </h2>
            </div>
            <button
              type="button"
              onClick={onRechargeBattery}
              className="px-3 py-1.5 rounded-lg border border-[#D4DBD1] bg-white text-[#111C16] text-xs font-medium hover:bg-[#F3F6F1] cursor-pointer whitespace-nowrap"
            >
              {t.rechargeBatteryButton}
            </button>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-[#4E5D53]">
                {t.batteryVoltageLabel}: {telemetry.batteryVoltage.toFixed(1)} V ·{' '}
                {t.batteryRuntimeLabel}: {batteryHoursLeft}
              </span>
              <span className="font-mono font-semibold tabular-nums text-[#111C16]">
                {Math.round(telemetry.batteryPercent)}%
              </span>
            </div>
            <div className="w-full h-3 bg-[#E8ECE6] rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  telemetry.batteryPercent < 20 ? 'bg-red-600' : 'bg-emerald-600'
                }`}
                style={{ width: `${Math.min(100, telemetry.batteryPercent)}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#E2E6DE]">
            <span className="text-xs font-medium text-[#4E5D53]">
              {t.powerModeLabel}
            </span>
            <div className="flex items-center gap-1 p-1 bg-[#F3F6F1] rounded-lg">
              {(
                [
                  { id: 'eco', label: t.powerEco },
                  { id: 'standard', label: t.powerStandard },
                  { id: 'turbo', label: t.powerTurbo },
                ] as const
              ).map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => onUpdateSettings({ pumpPowerMode: mode.id })}
                  className={`px-3 py-1 text-xs font-medium rounded-md cursor-pointer ${
                    settings.pumpPowerMode === mode.id
                      ? 'bg-white text-[#111C16] shadow-xs'
                      : 'text-[#4E5D53] hover:text-[#111C16]'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Boom & Optical Vision Calibration */}
        <section className="bg-white border border-[#E2E6DE] rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2.5">
            <Gauge className="w-5 h-5 text-emerald-700" />
            <h2 className="text-base font-semibold text-[#111C16]">
              {t.boomCalibrationTitle}
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#4E5D53]">{t.boomWidthLabel}</span>
                <span className="font-mono font-semibold tabular-nums">
                  {settings.boomWidthMeters.toFixed(1)} m
                </span>
              </div>
              <input
                type="range"
                min={3}
                max={9}
                step={0.5}
                value={settings.boomWidthMeters}
                onChange={(e) =>
                  onUpdateSettings({ boomWidthMeters: Number(e.target.value) })
                }
                className="w-full accent-emerald-700 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#4E5D53]">{t.tractorSpeedLabel}</span>
                <span className="font-mono font-semibold tabular-nums">
                  {settings.targetSpeedKmh.toFixed(1)} km/h
                </span>
              </div>
              <input
                type="range"
                min={3.5}
                max={12}
                step={0.5}
                value={settings.targetSpeedKmh}
                onChange={(e) =>
                  onUpdateSettings({ targetSpeedKmh: Number(e.target.value) })
                }
                className="w-full accent-emerald-700 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#4E5D53]">{t.visionSensitivityLabel}</span>
                <span className="font-mono font-semibold tabular-nums">
                  {settings.detectionSensitivity}%
                </span>
              </div>
              <input
                type="range"
                min={70}
                max={98}
                step={1}
                value={settings.detectionSensitivity}
                onChange={(e) =>
                  onUpdateSettings({
                    detectionSensitivity: Number(e.target.value),
                  })
                }
                className="w-full accent-emerald-700 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#E2E6DE]">
              <span className="text-xs font-medium text-[#111C16] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                {t.cropRowGuardLabel}
              </span>
              <button
                type="button"
                onClick={() =>
                  onUpdateSettings({
                    autoAvoidCropRows: !settings.autoAvoidCropRows,
                  })
                }
                className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer ${
                  settings.autoAvoidCropRows ? 'bg-emerald-700' : 'bg-[#CBD5CE]'
                }`}
                aria-pressed={settings.autoAvoidCropRows}
              >
                <span
                  className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.autoAvoidCropRows ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* 6. ERADIX Company Logo Upload */}
        <section className="bg-white border border-[#E2E6DE] rounded-xl p-5 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-[#111C16]">
              {t.brandLogoSectionTitle}
            </h2>
            <p className="text-xs text-[#4E5D53] mt-0.5">{t.brandLogoDesc}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-xl border border-[#E2E6DE] bg-white p-2 flex items-center justify-center shrink-0 overflow-hidden">
              <img
                src={companyLogoUrl}
                alt="ERADIX Company Logo"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-wrap gap-2.5">
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#111C16] text-white text-xs font-medium hover:bg-[#1E2F25] cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                {t.uploadLogoButton}
              </button>
              {companyLogoUrl !== DEFAULT_ERADIX_LOGO && (
                <button
                  type="button"
                  onClick={() => onUpdateCompanyLogo(DEFAULT_ERADIX_LOGO)}
                  className="px-3.5 py-2 rounded-lg border border-[#D4DBD1] text-xs font-medium text-[#4E5D53] hover:text-[#111C16] cursor-pointer"
                >
                  {t.restoreLogoButton}
                </button>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
