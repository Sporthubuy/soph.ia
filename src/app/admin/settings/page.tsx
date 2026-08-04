"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<string>("general");
  const [settings, setSettings] = useState({
    siteName: "SOPH.IA",
    siteDescription: "The Knowledge Operating System for AI",
    maxUploadSize: 100,
    enablePublicRegistration: true,
    enableEmailNotifications: true,
    enableTwoFactor: true,
    maintenanceMode: false,
    apiRateLimit: 1000,
    sessionTimeout: 30,
    backupFrequency: "daily",
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const tabs = [
    { id: "general", label: "General", icon: "⚙️" },
    { id: "security", label: "Security", icon: "🔐" },
    { id: "api", label: "API", icon: "🔌" },
    { id: "backup", label: "Backup", icon: "💾" },
    { id: "email", label: "Email", icon: "📧" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--star-1)]">Settings</h1>
        <p className="text-[var(--star-4)] mt-1">Manage system configuration</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--edge)] overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 font-medium text-sm whitespace-nowrap transition-colors border-b-2 ${
              activeTab === tab.id
                ? "border-[#3b82f6] text-[#3b82f6]"
                : "border-transparent text-[var(--star-4)] hover:text-[var(--star-3)]"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* General Settings */}
      {activeTab === "general" && (
        <div className="rounded-lg border border-[var(--edge)] bg-[var(--sky-2)] p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-[var(--star-3)] mb-2">
              Site Name
            </label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) =>
                setSettings({ ...settings, siteName: e.target.value })
              }
              className="w-full px-4 py-2 rounded-lg border border-[var(--edge)] bg-[var(--sky-1)] text-[var(--star-3)] focus:border-[#3b82f6] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--star-3)] mb-2">
              Site Description
            </label>
            <textarea
              value={settings.siteDescription}
              onChange={(e) =>
                setSettings({ ...settings, siteDescription: e.target.value })
              }
              className="w-full px-4 py-2 rounded-lg border border-[var(--edge)] bg-[var(--sky-1)] text-[var(--star-3)] focus:border-[#3b82f6] focus:outline-none"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--star-3)] mb-2">
              Max Upload Size (MB)
            </label>
            <input
              type="number"
              value={settings.maxUploadSize}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  maxUploadSize: parseInt(e.target.value),
                })
              }
              className="w-full px-4 py-2 rounded-lg border border-[var(--edge)] bg-[var(--sky-1)] text-[var(--star-3)] focus:border-[#3b82f6] focus:outline-none"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="publicReg"
                checked={settings.enablePublicRegistration}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    enablePublicRegistration: e.target.checked,
                  })
                }
                className="w-4 h-4 accent-[#3b82f6]"
              />
              <label htmlFor="publicReg" className="ml-3 text-sm text-[var(--star-3)]">
                Enable Public Registration
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="emailNotif"
                checked={settings.enableEmailNotifications}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    enableEmailNotifications: e.target.checked,
                  })
                }
                className="w-4 h-4 accent-[#3b82f6]"
              />
              <label htmlFor="emailNotif" className="ml-3 text-sm text-[var(--star-3)]">
                Enable Email Notifications
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="maintenance"
                checked={settings.maintenanceMode}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    maintenanceMode: e.target.checked,
                  })
                }
                className="w-4 h-4 accent-[#3b82f6]"
              />
              <label htmlFor="maintenance" className="ml-3 text-sm text-[var(--star-3)]">
                Maintenance Mode
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Security Settings */}
      {activeTab === "security" && (
        <div className="rounded-lg border border-[var(--edge)] bg-[var(--sky-2)] p-6 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="twoFactor"
                checked={settings.enableTwoFactor}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    enableTwoFactor: e.target.checked,
                  })
                }
                className="w-4 h-4 accent-[#3b82f6]"
              />
              <label htmlFor="twoFactor" className="ml-3 text-sm text-[var(--star-3)]">
                Require Two-Factor Authentication
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--star-3)] mb-2">
              Session Timeout (minutes)
            </label>
            <input
              type="number"
              value={settings.sessionTimeout}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  sessionTimeout: parseInt(e.target.value),
                })
              }
              className="w-full px-4 py-2 rounded-lg border border-[var(--edge)] bg-[var(--sky-1)] text-[var(--star-3)] focus:border-[#3b82f6] focus:outline-none"
            />
          </div>

          <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4">
            <h3 className="text-sm font-bold text-red-400 mb-2">Danger Zone</h3>
            <button className="px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 font-medium hover:bg-red-500/30 transition-colors text-sm">
              Reset All User Passwords
            </button>
          </div>
        </div>
      )}

      {/* API Settings */}
      {activeTab === "api" && (
        <div className="rounded-lg border border-[var(--edge)] bg-[var(--sky-2)] p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-[var(--star-3)] mb-2">
              API Rate Limit (requests/hour)
            </label>
            <input
              type="number"
              value={settings.apiRateLimit}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  apiRateLimit: parseInt(e.target.value),
                })
              }
              className="w-full px-4 py-2 rounded-lg border border-[var(--edge)] bg-[var(--sky-1)] text-[var(--star-3)] focus:border-[#3b82f6] focus:outline-none"
            />
          </div>

          <div className="rounded-lg border border-[var(--edge)] bg-[var(--sky-1)] p-4">
            <h3 className="text-sm font-bold text-[var(--star-3)] mb-3">API Keys</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--sky-2)] border border-[var(--edge)]">
                <div>
                  <p className="text-sm font-medium text-[var(--star-3)]">Production Key</p>
                  <p className="text-xs text-[var(--star-4)]">sk_prod_xxxxxxxxxxxx</p>
                </div>
                <button className="text-[#3b82f6] hover:text-[#2563eb] text-sm">
                  Regenerate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backup Settings */}
      {activeTab === "backup" && (
        <div className="rounded-lg border border-[var(--edge)] bg-[var(--sky-2)] p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-[var(--star-3)] mb-2">
              Backup Frequency
            </label>
            <select
              value={settings.backupFrequency}
              onChange={(e) =>
                setSettings({ ...settings, backupFrequency: e.target.value })
              }
              className="w-full px-4 py-2 rounded-lg border border-[var(--edge)] bg-[var(--sky-1)] text-[var(--star-3)] focus:border-[#3b82f6] focus:outline-none"
            >
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div className="rounded-lg border border-[var(--edge)] bg-[var(--sky-1)] p-4">
            <h3 className="text-sm font-bold text-[var(--star-3)] mb-3">Recent Backups</h3>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-[var(--sky-2)] transition-colors border border-[var(--edge)]"
                >
                  <div>
                    <p className="text-sm font-medium text-[var(--star-3)]">
                      Backup {i}
                    </p>
                    <p className="text-xs text-[var(--star-4)]">
                      2024-02-{28 - i} at 02:00 UTC
                    </p>
                  </div>
                  <button className="text-[#3b82f6] hover:text-[#2563eb] text-sm">
                    Restore
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Email Settings */}
      {activeTab === "email" && (
        <div className="rounded-lg border border-[var(--edge)] bg-[var(--sky-2)] p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-[var(--star-3)] mb-2">
              SMTP Server
            </label>
            <input
              type="text"
              placeholder="smtp.gmail.com"
              className="w-full px-4 py-2 rounded-lg border border-[var(--edge)] bg-[var(--sky-1)] text-[var(--star-3)] focus:border-[#3b82f6] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--star-3)] mb-2">
              SMTP Port
            </label>
            <input
              type="number"
              placeholder="587"
              className="w-full px-4 py-2 rounded-lg border border-[var(--edge)] bg-[var(--sky-1)] text-[var(--star-3)] focus:border-[#3b82f6] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--star-3)] mb-2">
              From Email Address
            </label>
            <input
              type="email"
              placeholder="noreply@soph.ia"
              className="w-full px-4 py-2 rounded-lg border border-[var(--edge)] bg-[var(--sky-1)] text-[var(--star-3)] focus:border-[#3b82f6] focus:outline-none"
            />
          </div>

          <button className="px-4 py-2 rounded-lg bg-[#3b82f6] text-white font-medium hover:bg-[#2563eb] transition-colors text-sm">
            Send Test Email
          </button>
        </div>
      )}

      {/* Save Button */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--star-4)]">
          {saved && (
            <span className="text-green-400">✓ Changes saved successfully</span>
          )}
        </p>
        <button
          onClick={handleSave}
          className="px-6 py-2 rounded-lg bg-[#3b82f6] text-white font-medium hover:bg-[#2563eb] transition-colors"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
