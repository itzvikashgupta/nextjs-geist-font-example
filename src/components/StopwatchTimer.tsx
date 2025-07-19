'use client'

import { useState, useEffect, useRef } from 'react'

export default function StopwatchTimer() {
  const [time, setTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [lapTimes, setLapTimes] = useState<number[]>([])
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime(prev => prev + 1)
      }, 10) // Update every 10ms for more precision
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
  }, [isRunning])

  const handleStart = () => {
    setIsRunning(!isRunning)
  }

  const handleReset = () => {
    setIsRunning(false)
    setTime(0)
    setLapTimes([])
  }

  const handleLap = () => {
    if (isRunning) {
      setLapTimes(prev => [...prev, time])
    }
  }

  const formatTime = (centiseconds: number) => {
    const totalSeconds = Math.floor(centiseconds / 100)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    const cs = centiseconds % 100

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${cs.toString().padStart(2, '0')}`
    } else {
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${cs.toString().padStart(2, '0')}`
    }
  }

  const formatDisplayTime = (centiseconds: number) => {
    const totalSeconds = Math.floor(centiseconds / 100)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    } else {
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
  }

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Circular Stopwatch Display */}
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
          {/* Running indicator circle */}
          {isRunning && (
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              strokeDasharray="4 4"
              className="text-primary animate-spin"
              style={{ animationDuration: '2s' }}
            />
          )}
        </svg>
        
        {/* Timer display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-foreground text-center">
            {formatDisplayTime(time)}
          </span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center space-x-3">
        <button
          onClick={handleStart}
          className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          <span>{isRunning ? '⏸️' : '▶️'}</span>
          <span>{isRunning ? 'Pause' : 'Start'}</span>
        </button>
        
        <button
          onClick={handleReset}
          className="flex items-center space-x-2 px-4 py-2 border border-border rounded-md text-foreground hover:bg-muted transition-colors"
        >
          <span>🔁</span>
          <span>Reset</span>
        </button>

        <button
          onClick={handleLap}
          disabled={!isRunning}
          className="flex items-center space-x-2 px-4 py-2 border border-border rounded-md text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>🏁</span>
          <span>Lap</span>
        </button>
      </div>

      {/* Lap Times */}
      {lapTimes.length > 0 && (
        <div className="w-full max-w-sm">
          <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center space-x-2">
            <span>🏁</span>
            <span>Lap Times</span>
          </h3>
          <div className="bg-muted/50 border border-border rounded-lg p-3 max-h-40 overflow-y-auto">
            {lapTimes.map((lapTime, index) => (
              <div
                key={index}
                className="flex justify-between items-center py-1 text-sm"
              >
                <span className="text-muted-foreground">
                  {index + 1}.
                </span>
                <span className="font-mono text-foreground">
                  {formatTime(lapTime)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
