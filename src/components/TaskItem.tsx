'use client'

import { Task } from '@/lib/db'
import { updateTask } from '@/lib/db'
import { useState } from 'react'

interface TaskItemProps {
  task: Task
  onTaskUpdate: () => void
  onTaskEdit: (taskId: string) => void
}

const subjectEmojis: { [key: string]: string } = {
  'Physics': '📘',
  'Math': '🧮',
  'Programming': '💻',
  'Chemistry': '🧪',
  'Biology': '🔬',
  'History': '📚',
  'English': '📝',
  'Art': '🎨',
  'Music': '🎵',
  'Geography': '🌍',
  'Economics': '💰',
  'Psychology': '🧠',
  'Philosophy': '🤔',
  'Language': '🗣️',
  'Literature': '📖',
  'Science': '⚗️',
  'Engineering': '⚙️',
  'Business': '💼',
  'Law': '⚖️',
  'Medicine': '🏥'
}

export default function TaskItem({ task, onTaskUpdate, onTaskEdit }: TaskItemProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  const handleToggleComplete = async () => {
    if (isUpdating) return
    
    setIsUpdating(true)
    try {
      await updateTask(task.id, { completed: !task.completed })
      onTaskUpdate()
    } catch (error) {
      console.error('Error updating task:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const formatTime = (time?: string) => {
    if (!time) return ''
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const getSubjectEmoji = (subject: string) => {
    return subjectEmojis[subject] || '📋'
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500'
      case 'medium': return 'text-yellow-500'
      case 'low': return 'text-blue-500'
      default: return 'text-gray-500'
    }
  }

  return (
    <div 
      className="flex items-start justify-between p-4 border-b border-border hover:bg-muted/50 transition-colors cursor-pointer"
      onClick={() => onTaskEdit(task.id)}
    >
      <div className="flex items-start space-x-3 flex-1">
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleToggleComplete()
          }}
          disabled={isUpdating}
          className="mt-1 text-lg hover:scale-110 transition-transform"
        >
          {task.completed ? '✅' : '☐'}
        </button>
        
        <div className="flex-1 min-w-0">
          <h3 className={`font-medium text-sm ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
            {task.title}
          </h3>
          {task.description && (
            <p className={`text-xs mt-1 ${task.completed ? 'line-through text-muted-foreground' : 'text-muted-foreground'}`}>
              {task.description}
            </p>
          )}
          {task.priority !== 'none' && (
            <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
              {task.priority.toUpperCase()}
            </span>
          )}
        </div>
      </div>
      
      <div className="flex flex-col items-end space-y-1 ml-3">
        {task.time && (
          <span className={`text-xs font-medium ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
            {formatTime(task.time)}
          </span>
        )}
        <span className="text-lg">
          {getSubjectEmoji(task.subject)}
        </span>
      </div>
    </div>
  )
}
