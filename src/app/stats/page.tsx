'use client'

import { useState, useEffect } from 'react'
import { getWeeklyStats, getPomodoroSessions } from '@/lib/db'
import StatsChart from '@/components/StatsChart'
import BottomNavigation from '@/components/BottomNavigation'

interface WeeklyStats {
  dailyCompletions: number[]
  totalTasks: number
  completedTasks: number
  incompleteTasks: number
  mostProductiveDay: string
  currentStreak: number
}

export default function StatsPage() {
  const [stats, setStats] = useState<WeeklyStats>({
    dailyCompletions: [0, 0, 0, 0, 0, 0, 0],
    totalTasks: 0,
    completedTasks: 0,
    incompleteTasks: 0,
    mostProductiveDay: 'Monday',
    currentStreak: 0
  })
  const [pomodoroCount, setPomodoroCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Get start of current week (Sunday)
        const today = new Date()
        const currentDay = today.getDay()
        const startOfWeek = new Date(today)
        startOfWeek.setDate(today.getDate() - currentDay)
        startOfWeek.setHours(0, 0, 0, 0)

        const weeklyStats = await getWeeklyStats(startOfWeek)
        setStats(weeklyStats)

        // Get pomodoro sessions for this week
        const pomodoroSessions = await getPomodoroSessions()
        const weekStart = startOfWeek.getTime()
        const weekEnd = weekStart + (7 * 24 * 60 * 60 * 1000)
        
        const thisWeekSessions = pomodoroSessions.filter(session => {
          const sessionTime = new Date(session.completedAt).getTime()
          return sessionTime >= weekStart && sessionTime < weekEnd && session.type === 'focus'
        })
        
        setPomodoroCount(thisWeekSessions.length)
      } catch (error) {
        console.error('Error loading stats:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pb-16">
        <div className="text-center">
          <div className="text-2xl mb-2">📊</div>
          <p className="text-muted-foreground">Loading your stats...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col pb-16">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h1 className="text-xl font-bold text-foreground text-center">
          📊 Productivity Stats
        </h1>
      </div>

      <div className="flex-1 p-4 space-y-6">
        {/* Weekly Progress Chart */}
        <StatsChart dailyCompletions={stats.dailyCompletions} />

        {/* Streak Counter */}
        <div className="p-4 border border-border rounded-lg bg-card">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-2xl">🔥</span>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{stats.currentStreak}</p>
              <p className="text-sm text-muted-foreground">
                Day{stats.currentStreak !== 1 ? 's' : ''} Streak
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            (Only when ≥1 task completed daily)
          </p>
        </div>

        {/* Weekly Summary */}
        <div className="p-4 border border-border rounded-lg bg-card space-y-3">
          <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
            <span>📋</span>
            <span>This Week Summary</span>
          </h3>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Tasks:</span>
              <span className="font-medium text-foreground">{stats.totalTasks}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center space-x-1">
                <span>✅</span>
                <span>Completed:</span>
              </span>
              <span className="font-medium text-green-600">{stats.completedTasks}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center space-x-1">
                <span>❌</span>
                <span>Incomplete:</span>
              </span>
              <span className="font-medium text-red-600">{stats.incompleteTasks}</span>
            </div>

            {stats.totalTasks > 0 && (
              <div className="pt-2 border-t border-border">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Completion Rate:</span>
                  <span className="font-medium text-foreground">
                    {Math.round((stats.completedTasks / stats.totalTasks) * 100)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Most Productive Day */}
        <div className="p-4 border border-border rounded-lg bg-card">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-2xl">🏆</span>
            <div className="text-center">
              <p className="text-lg font-semibold text-foreground">
                {stats.mostProductiveDay}
              </p>
              <p className="text-sm text-muted-foreground">
                Most Productive Day
              </p>
            </div>
          </div>
        </div>

        {/* Pomodoro Sessions */}
        <div className="p-4 border border-border rounded-lg bg-card">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-2xl">🍅</span>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{pomodoroCount}</p>
              <p className="text-sm text-muted-foreground">
                Pomodoro Session{pomodoroCount !== 1 ? 's' : ''} This Week
              </p>
            </div>
          </div>
        </div>

        {/* Motivational Message */}
        {stats.currentStreak > 0 && (
          <div className="p-4 border border-primary/20 bg-primary/5 rounded-lg">
            <div className="text-center">
              <p className="text-sm font-medium text-primary">
                {stats.currentStreak >= 7 
                  ? "🎉 Amazing! You're on fire with a week-long streak!"
                  : stats.currentStreak >= 3
                    ? "💪 Great job! Keep the momentum going!"
                    : "🌟 You're building a great habit!"
                }
              </p>
            </div>
          </div>
        )}

        {stats.totalTasks === 0 && (
          <div className="p-4 border border-border rounded-lg bg-muted/20">
            <div className="text-center">
              <div className="text-2xl mb-2">📝</div>
              <p className="text-sm text-muted-foreground">
                No tasks this week yet. Start by adding some tasks to track your progress!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}
