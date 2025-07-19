'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getTasksForDate, Task } from '@/lib/db'
import PomodoroTimer from '@/components/PomodoroTimer'
import StopwatchTimer from '@/components/StopwatchTimer'
import BottomNavigation from '@/components/BottomNavigation'

export default function PomodoroPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'pomodoro' | 'stopwatch'>('pomodoro')
  const [focusDuration, setFocusDuration] = useState(25)
  const [breakDuration, setBreakDuration] = useState(5)
  const [linkedTaskId, setLinkedTaskId] = useState<string>('')
  const [todayTasks, setTodayTasks] = useState<Task[]>([])
  const [showFocusEdit, setShowFocusEdit] = useState(false)
  const [showBreakEdit, setShowBreakEdit] = useState(false)

  useEffect(() => {
    const loadTodayTasks = async () => {
      try {
        const today = new Date().toISOString().split('T')[0]
        const tasks = await getTasksForDate(today)
        setTodayTasks(tasks.filter(task => !task.completed))
      } catch (error) {
        console.error('Error loading today tasks:', error)
      }
    }

    loadTodayTasks()
  }, [])

  const handleFocusDurationChange = (newDuration: number) => {
    if (newDuration > 0 && newDuration <= 120) {
      setFocusDuration(newDuration)
    }
    setShowFocusEdit(false)
  }

  const handleBreakDurationChange = (newDuration: number) => {
    if (newDuration > 0 && newDuration <= 60) {
      setBreakDuration(newDuration)
    }
    setShowBreakEdit(false)
  }

  const handleSessionComplete = () => {
    // Could show a notification or celebration here
    console.log('Pomodoro session completed!')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col pb-16">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h1 className="text-xl font-bold text-foreground text-center">
          {mode === 'pomodoro' ? '🍅 Pomodoro Timer' : '⏱️ Stopwatch Timer'}
        </h1>
      </div>

      {/* Mode Toggle Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setMode('pomodoro')}
          className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
            mode === 'pomodoro'
              ? 'bg-primary text-primary-foreground border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          🍅 Pomodoro
        </button>
        <button
          onClick={() => setMode('stopwatch')}
          className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
            mode === 'stopwatch'
              ? 'bg-primary text-primary-foreground border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          ⏱️ Stopwatch
        </button>
      </div>

      {/* Timer Content */}
      <div className="flex-1 p-6">
        {mode === 'pomodoro' ? (
          <div className="space-y-6">
            <PomodoroTimer
              focusDuration={focusDuration}
              breakDuration={breakDuration}
              linkedTaskId={linkedTaskId || undefined}
              onSessionComplete={handleSessionComplete}
            />

            {/* Editable Session Durations */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border border-border rounded-md">
                <span className="text-foreground">🧠 Focus Session:</span>
                <div className="flex items-center space-x-2">
                  {showFocusEdit ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={focusDuration}
                        onChange={(e) => setFocusDuration(parseInt(e.target.value) || 25)}
                        onBlur={() => setShowFocusEdit(false)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleFocusDurationChange(focusDuration)
                          } else if (e.key === 'Escape') {
                            setShowFocusEdit(false)
                          }
                        }}
                        className="w-16 px-2 py-1 text-sm border border-border rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        autoFocus
                      />
                      <span className="text-sm text-muted-foreground">min</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowFocusEdit(true)}
                      className="flex items-center space-x-1 text-foreground hover:text-muted-foreground transition-colors"
                    >
                      <span>{focusDuration} min</span>
                      <span className="text-sm">✏️</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border border-border rounded-md">
                <span className="text-foreground">☕ Break Session:</span>
                <div className="flex items-center space-x-2">
                  {showBreakEdit ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={breakDuration}
                        onChange={(e) => setBreakDuration(parseInt(e.target.value) || 5)}
                        onBlur={() => setShowBreakEdit(false)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleBreakDurationChange(breakDuration)
                          } else if (e.key === 'Escape') {
                            setShowBreakEdit(false)
                          }
                        }}
                        className="w-16 px-2 py-1 text-sm border border-border rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        autoFocus
                      />
                      <span className="text-sm text-muted-foreground">min</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowBreakEdit(true)}
                      className="flex items-center space-x-1 text-foreground hover:text-muted-foreground transition-colors"
                    >
                      <span>{breakDuration} min</span>
                      <span className="text-sm">✏️</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Link Session to Task */}
            {todayTasks.length > 0 && (
              <div className="p-3 border border-border rounded-md">
                <label className="block text-sm font-medium text-foreground mb-2">
                  🗓️ Link Session to Task:
                </label>
                <select
                  value={linkedTaskId}
                  onChange={(e) => setLinkedTaskId(e.target.value)}
                  className="w-full p-2 border border-border rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select a task (optional)</option>
                  {todayTasks.map((task) => (
                    <option key={task.id} value={task.id}>
                      {task.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        ) : (
          <StopwatchTimer />
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}
