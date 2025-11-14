"use client";

import { useState } from "react";
import { Save, AlertCircle } from "lucide-react";

export default function SettingsPage() {
  const [preferences, setPreferences] = useState({
    defaultMode: "balanced",
    heatSensitivity: "moderate",
    theme: "light",
    units: "metric",
    notifications: true,
    language: "en",
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-text-secondary">Customize your ARYA experience</p>
      </div>

      <div className="space-y-6">
        <SettingSection title="Mobility Preferences">
          <SettingField
            label="Default Mode"
            helperText="Preferred transportation mode"
          >
            <select
              value={preferences.defaultMode}
              onChange={(e) =>
                setPreferences({ ...preferences, defaultMode: e.target.value })
              }
              className="w-full px-3 py-2 border border-border-color rounded-lg dark:bg-bg-dark dark:border-gray-700"
            >
              <option>Bus-first</option>
              <option>EV-first</option>
              <option>Walking-first</option>
              <option>Balanced</option>
            </select>
          </SettingField>

          <SettingField
            label="Heat Sensitivity"
            helperText="How sensitive are you to high temperatures?"
          >
            <select
              value={preferences.heatSensitivity}
              onChange={(e) =>
                setPreferences({ ...preferences, heatSensitivity: e.target.value })
              }
              className="w-full px-3 py-2 border border-border-color rounded-lg dark:bg-bg-dark dark:border-gray-700"
            >
              <option>Low</option>
              <option>Moderate</option>
              <option>High</option>
            </select>
          </SettingField>
        </SettingSection>

        <SettingSection title="Display">
          <SettingField label="Theme">
            <div className="flex gap-3">
              {["light", "dark"].map((theme) => (
                <label
                  key={theme}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all ${
                    preferences.theme === theme
                      ? "border-accent-warm bg-accent-warm/10"
                      : "border-border-color dark:border-gray-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="theme"
                    value={theme}
                    checked={preferences.theme === theme}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        theme: e.target.value as "light" | "dark",
                      })
                    }
                    className="w-4 h-4"
                  />
                  <span className="capitalize">{theme}</span>
                </label>
              ))}
            </div>
          </SettingField>

          <SettingField label="Units">
            <select
              value={preferences.units}
              onChange={(e) =>
                setPreferences({ ...preferences, units: e.target.value })
              }
              className="w-full px-3 py-2 border border-border-color rounded-lg dark:bg-bg-dark dark:border-gray-700"
            >
              <option value="metric">Metric (km, kg)</option>
              <option value="imperial">Imperial (miles, lbs)</option>
            </select>
          </SettingField>

          <SettingField label="Language">
            <select
              value={preferences.language}
              onChange={(e) =>
                setPreferences({ ...preferences, language: e.target.value })
              }
              className="w-full px-3 py-2 border border-border-color rounded-lg dark:bg-bg-dark dark:border-gray-700"
            >
              <option value="en">English</option>
              <option value="ar">Arabic</option>
            </select>
          </SettingField>
        </SettingSection>

        <SettingSection title="Notifications">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.notifications}
              onChange={(e) =>
                setPreferences({ ...preferences, notifications: e.target.checked })
              }
              className="w-4 h-4"
            />
            <div>
              <p className="font-medium">Enable Notifications</p>
              <p className="text-xs text-text-secondary">
                Get alerts for transit delays, heat warnings, and events
              </p>
            </div>
          </label>
        </SettingSection>

        <SettingSection title="Account">
          <div className="card-base border-l-4 border-blue-400 bg-blue-50 dark:bg-blue-900/20">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  Profile Coming Soon
                </p>
                <p className="text-blue-800 dark:text-blue-200">
                  User authentication and profile management features will be available soon
                </p>
              </div>
            </div>
          </div>
        </SettingSection>

        <div className="flex gap-3 pt-4">
          <button
            onClick={handleSave}
            className="button-primary flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Preferences
          </button>
          {saved && (
            <div className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg flex items-center gap-2">
              <span className="text-sm">Settings saved</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface SettingSectionProps {
  title: string;
  children: React.ReactNode;
}

function SettingSection({ title, children }: SettingSectionProps) {
  return (
    <div className="card-base space-y-4">
      <h3 className="font-semibold text-lg text-text-primary dark:text-white">
        {title}
      </h3>
      {children}
    </div>
  );
}

interface SettingFieldProps {
  label: string;
  helperText?: string;
  children: React.ReactNode;
}

function SettingField({ label, helperText, children }: SettingFieldProps) {
  return (
    <div>
      <label className="block font-medium text-text-primary dark:text-white mb-2">
        {label}
      </label>
      {helperText && (
        <p className="text-xs text-text-secondary dark:text-gray-400 mb-2">
          {helperText}
        </p>
      )}
      {children}
    </div>
  );
}
