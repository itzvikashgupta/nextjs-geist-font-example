'use client'

import { usePathname, useRouter } from 'next/navigation'

export default function BottomNavigation() {
  const pathname = usePathname()
  const router = useRouter()

  const navItems = [
    {
      id: 'pomodoro',
      label: '⏱️ Pomodoro',
      path: '/pomodoro',
      isActive: pathname.startsWith('/pomodoro') || pathname.startsWith('/stopwatch')
    },
    {
      id: 'tasks',
      label: '📝 Tasks',
      path: '/',
      isActive: pathname === '/' || pathname.startsWith('/tasks')
    },
    {
      id: 'stats',
      label: '📊 Stats',
      path: '/stats',
      isActive: pathname.startsWith('/stats')
    },
    {
      id: 'settings',
      label: '⚙️',
      path: '/settings',
      isActive: pathname.startsWith('/settings')
    }
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border">
      <div className="flex items-center justify-around py-2 max-w-md mx-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => router.push(item.path)}
            className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors ${
              item.isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <span className="text-sm font-medium">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
