export interface Task {
  id: string
  title: string
  description?: string
  date: string
  time?: string
  completed: boolean
  priority: 'none' | 'low' | 'medium' | 'high'
  reminder: 'none' | 'on_day' | '1_day_early' | '1_week_early' | 'custom'
  repeat: 'none' | 'daily' | 'weekly' | 'monthly' | 'custom'
  subject: string
  createdAt: string
  updatedAt: string
}

export interface Settings {
  dailyReminderTime: string
  strictStreakMode: boolean
  theme: 'light' | 'dark' | 'system'
}

export interface PomodoroSession {
  id: string
  taskId?: string
  duration: number
  type: 'focus' | 'break'
  completedAt: string
}

const TASKS_KEY = 'smart_study_planner_tasks'
const SETTINGS_KEY = 'smart_study_planner_settings'
const POMODORO_KEY = 'smart_study_planner_pomodoro'

// Task Management
export async function getTasks(): Promise<Task[]> {
  try {
    const stored = localStorage.getItem(TASKS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Error getting tasks:', error)
    return []
  }
}

export async function addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
  try {
    const tasks = await getTasks()
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    tasks.push(newTask)
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks))
    return newTask
  } catch (error) {
    console.error('Error adding task:', error)
    throw error
  }
}

export async function updateTask(taskId: string, updates: Partial<Task>): Promise<Task | null> {
  try {
    const tasks = await getTasks()
    const taskIndex = tasks.findIndex(t => t.id === taskId)
    if (taskIndex === -1) return null
    
    tasks[taskIndex] = {
      ...tasks[taskIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks))
    return tasks[taskIndex]
  } catch (error) {
    console.error('Error updating task:', error)
    throw error
  }
}

export async function deleteTask(taskId: string): Promise<boolean> {
  try {
    const tasks = await getTasks()
    const filteredTasks = tasks.filter(t => t.id !== taskId)
    localStorage.setItem(TASKS_KEY, JSON.stringify(filteredTasks))
    return true
  } catch (error) {
    console.error('Error deleting task:', error)
    return false
  }
}

export async function getTasksForDate(date: string): Promise<Task[]> {
  try {
    const tasks = await getTasks()
    return tasks.filter(task => task.date === date).sort((a, b) => {
      if (!a.time && !b.time) return 0
      if (!a.time) return 1
      if (!b.time) return -1
      return a.time.localeCompare(b.time)
    })
  } catch (error) {
    console.error('Error getting tasks for date:', error)
    return []
  }
}

// Settings Management
export async function getSettings(): Promise<Settings> {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY)
    return stored ? JSON.parse(stored) : {
      dailyReminderTime: '09:00',
      strictStreakMode: false,
      theme: 'system'
    }
  } catch (error) {
    console.error('Error getting settings:', error)
    return {
      dailyReminderTime: '09:00',
      strictStreakMode: false,
      theme: 'system'
    }
  }
}

export async function updateSettings(updates: Partial<Settings>): Promise<Settings> {
  try {
    const currentSettings = await getSettings()
    const newSettings = { ...currentSettings, ...updates }
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings))
    return newSettings
  } catch (error) {
    console.error('Error updating settings:', error)
    throw error
  }
}

// Pomodoro Sessions
export async function addPomodoroSession(session: Omit<PomodoroSession, 'id'>): Promise<PomodoroSession> {
  try {
    const stored = localStorage.getItem(POMODORO_KEY)
    const sessions: PomodoroSession[] = stored ? JSON.parse(stored) : []
    const newSession: PomodoroSession = {
      ...session,
      id: Date.now().toString()
    }
    sessions.push(newSession)
    localStorage.setItem(POMODORO_KEY, JSON.stringify(sessions))
    return newSession
  } catch (error) {
    console.error('Error adding pomodoro session:', error)
    throw error
  }
}

export async function getPomodoroSessions(): Promise<PomodoroSession[]> {
  try {
    const stored = localStorage.getItem(POMODORO_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Error getting pomodoro sessions:', error)
    return []
  }
}

// Stats and Analytics
export async function getWeeklyStats(startDate: Date): Promise<{
  dailyCompletions: number[]
  totalTasks: number
  completedTasks: number
  incompleteTasks: number
  mostProductiveDay: string
  currentStreak: number
}> {
  try {
    const tasks = await getTasks()
    const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const dailyCompletions = new Array(7).fill(0)
    
    let totalTasks = 0
    let completedTasks = 0
    let mostProductiveCount = 0
    let mostProductiveDay = 'Monday'
    
    // Calculate daily completions for the week
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]
      
      const dayTasks = tasks.filter(task => task.date === dateStr)
      const dayCompleted = dayTasks.filter(task => task.completed).length
      
      dailyCompletions[i] = dayCompleted
      totalTasks += dayTasks.length
      completedTasks += dayCompleted
      
      if (dayCompleted > mostProductiveCount) {
        mostProductiveCount = dayCompleted
        mostProductiveDay = weekDays[i]
      }
    }
    
    // Calculate current streak
    const currentStreak = await calculateCurrentStreak()
    
    return {
      dailyCompletions,
      totalTasks,
      completedTasks,
      incompleteTasks: totalTasks - completedTasks,
      mostProductiveDay,
      currentStreak
    }
  } catch (error) {
    console.error('Error getting weekly stats:', error)
    return {
      dailyCompletions: [0, 0, 0, 0, 0, 0, 0],
      totalTasks: 0,
      completedTasks: 0,
      incompleteTasks: 0,
      mostProductiveDay: 'Monday',
      currentStreak: 0
    }
  }
}

export async function calculateCurrentStreak(): Promise<number> {
  try {
    const tasks = await getTasks()
    const settings = await getSettings()
    let streak = 0
    const today = new Date()
    
    for (let i = 0; i < 365; i++) { // Check up to a year back
      const checkDate = new Date(today)
      checkDate.setDate(today.getDate() - i)
      const dateStr = checkDate.toISOString().split('T')[0]
      
      const dayTasks = tasks.filter(task => task.date === dateStr)
      if (dayTasks.length === 0) break
      
      const completedTasks = dayTasks.filter(task => task.completed)
      
      if (settings.strictStreakMode) {
        // Strict mode: all tasks must be completed
        if (completedTasks.length === dayTasks.length && dayTasks.length > 0) {
          streak++
        } else {
          break
        }
      } else {
        // Normal mode: at least one task must be completed
        if (completedTasks.length > 0) {
          streak++
        } else {
          break
        }
      }
    }
    
    return streak
  } catch (error) {
    console.error('Error calculating streak:', error)
    return 0
  }
}

// Clear all data
export async function clearAllTasks(): Promise<void> {
  try {
    localStorage.removeItem(TASKS_KEY)
  } catch (error) {
    console.error('Error clearing tasks:', error)
    throw error
  }
}
