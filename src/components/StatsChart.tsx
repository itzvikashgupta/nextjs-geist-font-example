'use client'

interface StatsChartProps {
  dailyCompletions: number[]
  weekDays?: string[]
}

export default function StatsChart({ dailyCompletions, weekDays }: StatsChartProps) {
  const defaultWeekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  const days = weekDays || defaultWeekDays
  
  const maxCompletions = Math.max(...dailyCompletions, 1)
  const maxHeight = 80 // Maximum height in pixels

  const getBarHeight = (completions: number) => {
    if (maxCompletions === 0) return 4
    return Math.max((completions / maxCompletions) * maxHeight, 4)
  }

  const getBarColor = (completions: number) => {
    if (completions === 0) return 'bg-muted'
    if (completions <= 2) return 'bg-blue-400'
    if (completions <= 4) return 'bg-green-400'
    if (completions <= 6) return 'bg-yellow-400'
    return 'bg-red-400'
  }

  return (
    <div className="p-4 border border-border rounded-lg bg-card">
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
        <span>📅</span>
        <span>Weekly Progress</span>
      </h3>
      
      <div className="flex items-end justify-between space-x-2 h-24 mb-3">
        {dailyCompletions.map((completions, index) => (
          <div key={index} className="flex flex-col items-center space-y-2 flex-1">
            <div
              className={`w-full rounded-t-sm transition-all duration-300 ${getBarColor(completions)}`}
              style={{ height: `${getBarHeight(completions)}px` }}
              title={`${completions} tasks completed`}
            />
            <span className="text-xs font-medium text-muted-foreground">
              {days[index]}
            </span>
          </div>
        ))}
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-muted rounded-sm" />
          <span>0</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-blue-400 rounded-sm" />
          <span>1-2</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-green-400 rounded-sm" />
          <span>3-4</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-yellow-400 rounded-sm" />
          <span>5-6</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-red-400 rounded-sm" />
          <span>7+</span>
        </div>
      </div>
    </div>
  )
}
