import { useState, useEffect, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getTabConfig } from '@/lib/tab-config'
import { useAuth } from '@/hooks/use-auth'

export interface Tab {
  id: string
  title: string
  path: string
}

export function useTabs() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [tabs, setTabs] = useState<Tab[]>([])
  const [activePath, setActivePath] = useState<string | null>(null)

  useEffect(() => {
    const config = getTabConfig(location.pathname)
    if (!config) return

    const hasPermission =
      !config.requiredRole || user?.role === config.requiredRole || user?.role === 'SUPERADMIN'

    if (!hasPermission) {
      navigate('/')
      return
    }

    setTabs((prev) => {
      if (prev.find((t) => t.path === config.path)) return prev
      return [...prev, { id: config.path, title: config.title, path: config.path }]
    })
    setActivePath(config.path)
  }, [location.pathname, user, navigate])

  const closeTab = useCallback(
    (path: string) => {
      const idx = tabs.findIndex((t) => t.path === path)
      if (idx === -1) return

      const newTabs = tabs.filter((t) => t.path !== path)
      setTabs(newTabs)

      if (activePath === path) {
        const nextTab = newTabs[idx - 1] || newTabs[0]
        if (nextTab) {
          navigate(nextTab.path)
        } else {
          setActivePath(null)
        }
      }
    },
    [tabs, activePath, navigate],
  )

  return { tabs, activePath, closeTab }
}
