'use client'

import { useState, useEffect, useRef } from 'react'
import { addPomodoroSession } from '@/lib/db'

interface PomodoroTimerProps {
  focusDuration: number
  breakDuration: number
  linkedTaskId?: string
  onSessionComplete?: () => void
}

export default function PomodoroTimer({ 
  focusDuration, 
  breakDuration, 
  linkedTaskId,
  onSessionComplete 
}: PomodoroTimerProps) {
  const [timeLeft, setTimeLeft] = useState(focusDuration * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [currentMode, setCurrentMode] = useState<'focus' | 'break'>('focus')
  const [sessionCount, setSessionCount] = useState(1)
  const [totalSessions] = useState(4)
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      handleSessionComplete()
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, timeLeft])

  const handleSessionComplete = async () => {
    setIsRunning(false)
    
    try {
      await addPomodoroSession({
        taskId: linkedTaskId,
        duration: currentMode === 'focus' ? focusDuration : breakDuration,
        type: currentMode,
        completedAt: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error saving pomodoro session:', error)
    }

    if (currentMode === 'focus') {
      if (sessionCount < totalSessions) {
        // Switch to break
        setCurrentMode('break')
        setTimeLeft(breakDuration * 60)
      } else {
        // All sessions complete
        setSessionCount(1)
        setTimeLeft(focusDuration * 60)
        onSessionComplete?.()
      }
    } else {
      // Break complete, switch to focus
      setCurrentMode('focus')
      setSessionCount(prev => prev + 1)
      setTimeLeft(focusDuration * 60)
    }
  }

  const handleStart = () => {
    setIsRunning(!isRunning)
  }

  const handleReset = () => {
    setIsRunning(false)
    setCurrentMode('focus')
    setSessionCount(1)
    setTimeLeft(focusDuration * 60)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getProgress = () => {
    const totalTime = currentMode === 'focus' ? focusDuration * 60 : breakDuration * 60
    return ((totalTime - timeLeft) / totalTime) * 100
  }

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Session Info */}
      <div className="text-center space-y-2">
        <p className="text-lg font-medium text-foreground">
          🔁 Current Mode: {currentMode === 'focus' ? 'Focus' : 'Break'}
        </p>
        <p className="text-muted-foreground">
          ⏳ Session {sessionCount} of {totalSessions}
        </p>
      </div>

      {/* Circular Timer */}
      <div className="relative w-48 h-48">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="text-muted"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - getProgress() / 100)}`}
            className={`transition-all duration-1000 ${
              currentMode === 'focus' ? 'text-primary' : 'text-green-500'
            }`}
            strokeLinecap="round"
          />
        </svg>
        
        {/* Timer display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-foreground">
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center space-x-4">
        <button
          onClick={handleStart}
          className="flex items-center space-x-2 px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          <span>{isRunning ? '⏸️' : '▶️'}</span>
          <span>{isRunning ? 'Pause' : 'Start'}</span>
        </button>
        
        <button
          onClick={handleReset}
          className="flex items-center space-x-2 px-6 py-3 border border-border rounded-md text-foreground hover:bg-muted transition-colors"
        >
          <span>🔁</span>
          <span>Reset</span>
        </button>
      </div>
    </div>
  )
}
