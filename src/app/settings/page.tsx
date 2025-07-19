'use client'

import { useState, useEffect } from 'react'
import { getSettings, updateSettings, clearAllTasks } from '@/lib/db'
import BottomNavigation from '@/components/BottomNavigation'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    dailyReminderTime: '09:00',
    strictStreakMode: false,
    theme: 'system' as 'light' | 'dark' | 'system'
  })
  const [loading, setLoading] = useState(true)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showStrictModeInfo, setShowStrictModeInfo] = useState(false)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const currentSettings = await getSettings()
        setSettings(currentSettings)
      } catch (error) {
        console.error('Error loading settings:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [])

  const handleSettingChange = async (key: string, value: any) => {
    try {
      const newSettings = { ...settings, [key]: value }
      setSettings(newSettings)
      await updateSettings({ [key]: value })
    } catch (error) {
      console.error('Error updating settings:', error)
      // Revert on error
      setSettings(settings)
    }
  }

  const handleClearAllTasks = async () => {
    try {
      await clearAllTasks()
      setShowClearConfirm(false)
      // Show success message or redirect
    } catch (error) {
      console.error('Error clearing tasks:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pb-16">
        <div className="text-center">
          <div className="text-2xl mb-2">⚙️</div>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col pb-16">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h1 className="text-xl font-bold text-foreground text-center">
          ⚙️ Settings
        </h1>
      </div>

      <div className="flex-1 p-4 space-y-6">
        {/* Daily Reminder Time */}
        <div className="p-4 border border-border rounded-lg bg-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg">🔔</span>
              <span className="font-medium text-foreground">Daily Reminder Time</span>
            </div>
            <input
              type="time"
              value={settings.dailyReminderTime}
              onChange={(e) => handleSettingChange('dailyReminderTime', e.target.value)}
              className="px-3 py-1 border border-border rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Get notified daily to check your tasks and plan your day
          </p>
        </div>

        {/* Strict Streak Mode */}
        <div className="p-4 border border-border rounded-lg bg-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg">🔥</span>
              <span className="font-medium text-foreground">Strict Streak Mode</span>
              <button
                onClick={() => setShowStrictModeInfo(!showStrictModeInfo)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                ⓘ
              </button>
            </div>
            <button
              onClick={() => handleSettingChange('strictStreakMode', !settings.strictStreakMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.strictStreakMode ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.strictStreakMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          {showStrictModeInfo && (
            <div className="mt-3 p-3 bg-muted/50 rounded-md">
              <p className="text-xs text-muted-foreground">
                <strong>OFF:</strong> Streak increases if at least 1 task is completed daily<br/>
                <strong>ON:</strong> Streak increases only if ALL tasks are completed daily
              </p>
            </div>
          )}
        </div>

        {/* Theme */}
        <div className="p-4 border border-border rounded-lg bg-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg">🎨</span>
              <span className="font-medium text-foreground">Theme</span>
            </div>
            <select
              value={settings.theme}
              onChange={(e) => handleSettingChange('theme', e.target.value)}
              className="px-3 py-1 border border-border rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System Default</option>
            </select>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Choose your preferred app appearance
          </p>
        </div>

        {/* Backup & Sync */}
        <div className="p-4 border border-border rounded-lg bg-card opacity-60">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg">📤</span>
              <span className="font-medium text-foreground">Backup & Sync</span>
            </div>
            <span className="text-sm text-muted-foreground">Coming Soon</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Cloud backup and sync across devices will be available in a future update
          </p>
        </div>

        {/* Clear All Tasks */}
        <div className="p-4 border border-red-200 rounded-lg bg-red-50/50">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="text-lg">🗑️</span>
              <span className="font-medium text-foreground">Clear All Tasks</span>
            </div>
            <p className="text-xs text-muted-foreground">
              This will permanently delete all your tasks and cannot be undone
            </p>
            <button
              onClick={() => setShowClearConfirm(true)}
              className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              Clear All Tasks
            </button>
          </div>
        </div>

        {/* App Info */}
        <div className="p-4 border border-border rounded-lg bg-card">
          <div className="text-center space-y-2">
            <div className="text-2xl">📚</div>
            <h3 className="font-semibold text-foreground">Smart Study Planner</h3>
            <p className="text-sm text-muted-foreground">
              A personalized task and reminder app for students
            </p>
            <p className="text-xs text-muted-foreground">
              Version 1.0.0
            </p>
          </div>
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-popover border border-border rounded-lg shadow-lg w-full max-w-sm">
            <div className="p-4">
              <h3 className="text-lg font-semibold text-foreground mb-2">Clear All Tasks</h3>
              <p className="text-muted-foreground mb-4">
                Are you sure you want to delete all tasks? This action cannot be undone and will remove:
              </p>
              <ul className="text-sm text-muted-foreground mb-4 space-y-1">
                <li>• All your tasks</li>
                <li>• Task history</li>
                <li>• Progress statistics</li>
                <li>• Streak data</li>
              </ul>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-md text-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearAllTasks}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}
