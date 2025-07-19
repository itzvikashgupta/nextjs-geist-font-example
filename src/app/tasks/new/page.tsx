'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { addTask } from '@/lib/db'
import CalendarPicker from '@/components/CalendarPicker'

const subjects = [
  'Physics', 'Math', 'Programming', 'Chemistry', 'Biology', 
  'History', 'English', 'Art', 'Music', 'Geography', 
  'Economics', 'Psychology', 'Philosophy', 'Language', 
  'Literature', 'Science', 'Engineering', 'Business', 'Law', 'Medicine'
]

const priorities = [
  { value: 'none', label: 'No Priority' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' }
]

const reminderOptions = [
  { value: 'none', label: 'None' },
  { value: 'on_day', label: 'On the day' },
  { value: '1_day_early', label: '1 day early' },
  { value: '1_week_early', label: '1 week early' },
  { value: 'custom', label: 'Custom' }
]

const repeatOptions = [
  { value: 'none', label: 'None' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'custom', label: 'Custom' }
]

export default function NewTaskPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [showCustomSubject, setShowCustomSubject] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    priority: 'none',
    reminder: 'none',
    repeat: 'none',
    subject: 'Physics',
    customSubject: ''
  })

  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}
    
    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required'
    }
    
    if (!formData.date) {
      newErrors.date = 'Date is required'
    }

    if (showCustomSubject && !formData.customSubject.trim()) {
      newErrors.customSubject = 'Custom subject is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      await addTask({
        title: formData.title,
        description: formData.description,
        date: formData.date,
        time: formData.time || undefined,
        completed: false,
        priority: formData.priority as any,
        reminder: formData.reminder as any,
        repeat: formData.repeat as any,
        subject: showCustomSubject ? formData.customSubject : formData.subject
      })
      
      router.push('/')
    } catch (error) {
      console.error('Error creating task:', error)
      setErrors({ submit: 'Failed to create task. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handleDateSelect = (date: Date) => {
    setFormData(prev => ({
      ...prev,
      date: date.toISOString().split('T')[0]
    }))
  }

  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow'
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric' 
      })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top App Bar */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-foreground hover:text-muted-foreground transition-colors"
        >
          <span>←</span>
          <span>Back</span>
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <span>💾</span>
          <span>{loading ? 'Saving...' : 'Save'}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {/* Task Title */}
        <div>
          <input
            type="text"
            placeholder="Task Title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full p-3 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
        </div>

        {/* Description */}
        <div>
          <textarea
            placeholder="Description (optional)"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full p-3 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>

        {/* Date & Priority */}
        <div className="flex items-center justify-between p-3 border border-border rounded-md">
          <button
            type="button"
            onClick={() => setShowCalendar(true)}
            className="flex items-center space-x-2 text-foreground hover:text-muted-foreground transition-colors"
          >
            <span>📅</span>
            <span>{formatDisplayDate(formData.date)}</span>
          </button>
          
          <select
            value={formData.priority}
            onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
            className="bg-background text-foreground border-none focus:outline-none"
          >
            {priorities.map(priority => (
              <option key={priority.value} value={priority.value}>
                🚩 {priority.label} ▼
              </option>
            ))}
          </select>
        </div>

        {/* Time Picker */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Time (optional)
          </label>
          <input
            type="time"
            value={formData.time}
            onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
            className="w-full p-3 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Reminder */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            🔔 Reminder
          </label>
          <div className="space-y-2">
            {reminderOptions.map(option => (
              <label key={option.value} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="reminder"
                  value={option.value}
                  checked={formData.reminder === option.value}
                  onChange={(e) => setFormData(prev => ({ ...prev, reminder: e.target.value }))}
                  className="text-primary focus:ring-primary"
                />
                <span className="text-foreground">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Repeat */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            🔁 Repeat
          </label>
          <div className="space-y-2">
            {repeatOptions.map(option => (
              <label key={option.value} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="repeat"
                  value={option.value}
                  checked={formData.repeat === option.value}
                  onChange={(e) => setFormData(prev => ({ ...prev, repeat: e.target.value }))}
                  className="text-primary focus:ring-primary"
                />
                <span className="text-foreground">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            📚 Subject
          </label>
          <div className="space-y-3">
            <select
              value={showCustomSubject ? 'custom' : formData.subject}
              onChange={(e) => {
                if (e.target.value === 'custom') {
                  setShowCustomSubject(true)
                } else {
                  setShowCustomSubject(false)
                  setFormData(prev => ({ ...prev, subject: e.target.value }))
                }
              }}
              className="w-full p-3 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {subjects.map(subject => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
              <option value="custom">➕ Custom</option>
            </select>
            
            {showCustomSubject && (
              <div>
                <input
                  type="text"
                  placeholder="Enter custom subject"
                  value={formData.customSubject}
                  onChange={(e) => setFormData(prev => ({ ...prev, customSubject: e.target.value }))}
                  className="w-full p-3 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.customSubject && <p className="text-red-500 text-sm mt-1">{errors.customSubject}</p>}
              </div>
            )}
          </div>
        </div>

        {errors.submit && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{errors.submit}</p>
          </div>
        )}
      </form>

      {/* Calendar Modal */}
      {showCalendar && (
        <CalendarPicker
          selectedDate={new Date(formData.date)}
          onDateSelect={handleDateSelect}
          onClose={() => setShowCalendar(false)}
        />
      )}
    </div>
  )
}
