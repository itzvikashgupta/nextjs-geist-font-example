'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Task, getTasksForDate, calculateCurrentStreak } from '@/lib/db'
import TaskList from '@/components/TaskList'
import BottomNavigation from '@/components/BottomNavigation'

export default function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [streak, setStreak] = useState(0)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const loadTasks = async () => {
    try {
      const dateStr = selectedDate.toISOString().split('T')[0]
      const dayTasks = await getTasksForDate(dateStr)
      setTasks(dayTasks)
    } catch (error) {
      console.error('Error loading tasks:', error)
    }
  }

  const loadStreak = async () => {
    try {
      const currentStreak = await calculateCurrentStreak()
      setStreak(currentStreak)
    } catch (error) {
      console.error('Error loading streak:', error)
    }
  }

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true)
      await Promise.all([loadTasks(), loadStreak()])
      setLoading(false)
    }
    initializeData()
  }, [selectedDate])

  const formatHeaderDate = (date: Date) => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric' 
      })
    }
  }

  const getWeekDates = () => {
    const today = new Date()
    const currentDay = today.getDay() // 0 = Sunday
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - currentDay)

    const weekDates = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      weekDates.push(date)
    }
    return weekDates
  }

  const weekDates = getWeekDates()
  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
  }

  const handleTaskEdit = (taskId: string) => {
    router.push(`/tasks/${taskId}`)
  }

  const handleAddTask = () => {
    router.push('/tasks/new')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-2">📚</div>
          <p className="text-muted-foreground">Loading your tasks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h1 className="text-lg font-semibold text-foreground">
          {formatHeaderDate(selectedDate)}
        </h1>
        <div className="flex items-center space-x-1">
          <span className="text-lg">🔥</span>
          <span className="text-lg font-bold text-foreground">{streak}</span>
        </div>
      </div>

      {/* Date Strip Navigator */}
      <div className="p-4 border-b border-border">
        <div className="flex justify-between items-center">
          {weekDates.map((date, index) => {
            const isSelected = date.toDateString() === selectedDate.toDateString()
            const isToday = date.toDateString() === new Date().toDateString()
            
            return (
              <button
                key={date.toISOString()}
                onClick={() => handleDateSelect(date)}
                className="flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors hover:bg-muted"
              >
                <span className="text-xs text-muted-foreground font-medium">
                  {dayLabels[index]}
                </span>
                <span 
                  className={`text-sm font-medium w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    isSelected 
                      ? 'bg-primary text-primary-foreground' 
                      : isToday 
                        ? 'bg-muted text-foreground font-bold' 
                        : 'text-foreground hover:bg-muted'
                  }`}
                >
                  {date.getDate()}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Task List */}
      <TaskList
        tasks={tasks}
        onTaskUpdate={loadTasks}
        onTaskEdit={handleTaskEdit}
      />

      {/* Floating Action Button */}
      <button
        onClick={handleAddTask}
        className="fixed bottom-20 right-4 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center text-2xl font-light z-10"
      >
        ⊕
      </button>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}
