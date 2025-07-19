'use client'

import { Task } from '@/lib/db'
import TaskItem from './TaskItem'
import { useState } from 'react'

interface TaskListProps {
  tasks: Task[]
  onTaskUpdate: () => void
  onTaskEdit: (taskId: string) => void
}

type FilterType = 'all' | 'completed' | 'incomplete'

export default function TaskList({ tasks, onTaskUpdate, onTaskEdit }: TaskListProps) {
  const [filter, setFilter] = useState<FilterType>('all')
  const [showFilterMenu, setShowFilterMenu] = useState(false)

  const filteredTasks = tasks.filter(task => {
    switch (filter) {
      case 'completed':
        return task.completed
      case 'incomplete':
        return !task.completed
      default:
        return true
    }
  })

  const getFilterLabel = () => {
    switch (filter) {
      case 'completed':
        return 'Completed'
      case 'incomplete':
        return 'Incomplete'
      default:
        return 'All Tasks'
    }
  }

  return (
    <div className="flex-1">
      {/* Section Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">
          📅 Today
        </h2>
        <div className="relative">
          <button
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            className="p-2 hover:bg-muted rounded-md transition-colors"
          >
            <span className="text-lg">⋮</span>
          </button>
          
          {showFilterMenu && (
            <div className="absolute right-0 top-full mt-1 bg-popover border border-border rounded-md shadow-lg z-10 min-w-[120px]">
              <button
                onClick={() => {
                  setFilter('all')
                  setShowFilterMenu(false)
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors ${
                  filter === 'all' ? 'bg-muted font-medium' : ''
                }`}
              >
                All Tasks
              </button>
              <button
                onClick={() => {
                  setFilter('completed')
                  setShowFilterMenu(false)
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors ${
                  filter === 'completed' ? 'bg-muted font-medium' : ''
                }`}
              >
                Completed
              </button>
              <button
                onClick={() => {
                  setFilter('incomplete')
                  setShowFilterMenu(false)
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors ${
                  filter === 'incomplete' ? 'bg-muted font-medium' : ''
                }`}
              >
                Incomplete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filter indicator */}
      {filter !== 'all' && (
        <div className="px-4 py-2 bg-muted/50 border-b border-border">
          <span className="text-sm text-muted-foreground">
            Showing: {getFilterLabel()} ({filteredTasks.length})
          </span>
        </div>
      )}

      {/* Task List */}
      <div className="flex-1 overflow-y-auto">
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              {filter === 'all' ? 'No tasks for today' : `No ${filter} tasks`}
            </h3>
            <p className="text-sm text-muted-foreground text-center">
              {filter === 'all' 
                ? 'Tap the + button to add your first task'
                : `You have no ${filter} tasks for today`
              }
            </p>
          </div>
        ) : (
          <div>
            {filteredTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onTaskUpdate={onTaskUpdate}
                onTaskEdit={onTaskEdit}
              />
            ))}
          </div>
        )}
      </div>

      {/* Click outside to close filter menu */}
      {showFilterMenu && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowFilterMenu(false)}
        />
      )}
    </div>
  )
}
