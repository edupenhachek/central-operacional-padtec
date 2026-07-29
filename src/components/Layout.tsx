import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTabs } from '@/hooks/use-tabs'
import { TabBar } from '@/components/TabBar'
import { getTabConfig } from '@/lib/tab-config'
import {
  LayoutDashboard,
  FileText,
  BrainCircuit,
  Users,
  Moon,
  Sun,
  LogOut,
  Menu,
  X,
  Bot,
  ChevronsLeft,
  ChevronsRight,
  CalendarDays,
  UserCircle,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useTheme } from '@/hooks/use-theme'
import { Button } from '@/components/ui/button'
import { PadtecEmblem } from '@/components/PadtecLogo'
import { GutenbergDrawer } from '@/components/GutenbergDrawer'
import { ProfileModal } from '@/components/ProfileModal'
import { cn } from '@/lib/utils'

export default function Layout() {
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const { tabs, activePath, closeTab } = useTabs()

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPERADMIN'

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Escalas', path: '/escalas', icon: CalendarDays },
    { label: 'Documentação', path: '/documentacao', icon: FileText },
    { label: 'Gutenberg', path: '/gutenberg', icon: BrainCircuit },
    ...(isAdmin ? [{ label: 'Usuários', path: '/usuarios', icon: Users }] : []),
  ]

  const handleLogout = () => {
    signOut()
    navigate('/login')
  }

  const ThemeToggle = ({ className }: { className?: string }) => (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
      className={cn('text-muted-foreground hover:text-foreground', className)}
    >
      {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </Button>
  )

  return (
    <div className="h-screen flex bg-slate-50 dark:bg-background text-foreground transition-colors duration-200 overflow-hidden">
      <aside
        className={cn(
          'relative hidden lg:flex flex-col h-screen border-r border-border bg-card justify-between select-none transition-all duration-300 shrink-0',
          collapsed ? 'w-16' : 'w-64',
        )}
      >
        <div className="flex flex-col overflow-hidden">
          <div
            className={cn(
              'border-b border-border/50 flex items-center gap-2',
              collapsed ? 'justify-center p-4' : 'p-4',
            )}
          >
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
              title={collapsed ? 'Expandir menu' : 'Recolher menu'}
            >
              {collapsed ? (
                <ChevronsRight className="w-5 h-5" />
              ) : (
                <ChevronsLeft className="w-5 h-5" />
              )}
            </button>
            {!collapsed && (
              <div className="flex items-center gap-2 overflow-hidden">
                <PadtecEmblem />
                <div className="overflow-hidden">
                  <h1 className="font-bold text-sm tracking-tight text-foreground dark:text-white truncate">
                    Central Operacional
                  </h1>
                  <p className="text-xs text-muted-foreground dark:text-gray-400 font-medium">
                    NOC • COPE • BKO
                  </p>
                </div>
              </div>
            )}
            {collapsed && <PadtecEmblem className="hidden" />}
          </div>

          <nav className={cn('flex-1 overflow-y-auto', collapsed ? 'p-2' : 'p-4')}>
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                const isGutenberg = item.path === '/gutenberg'
                const itemCls = cn(
                  'flex items-center rounded-lg text-sm font-medium transition-all duration-150',
                  collapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3.5 py-2.5',
                  isActive
                    ? 'bg-muted text-foreground dark:text-white font-semibold shadow-sm'
                    : 'text-muted-foreground hover:text-foreground dark:hover:text-white hover:bg-muted/50',
                )
                if (isGutenberg) {
                  return (
                    <button
                      key={item.path}
                      onClick={() => setDrawerOpen(!drawerOpen)}
                      title={collapsed ? item.label : undefined}
                      className={itemCls}
                    >
                      <Icon className="w-4 h-4 shrink-0 text-blue-600" />
                      {!collapsed && item.label}
                    </button>
                  )
                }
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    title={collapsed ? item.label : undefined}
                    className={itemCls}
                  >
                    <Icon className={cn('w-4 h-4 shrink-0', isActive && 'text-blue-600')} />
                    {!collapsed && item.label}
                  </Link>
                )
              })}
            </div>
          </nav>
        </div>

        <div
          className={cn(
            'border-t border-border/50',
            collapsed ? 'p-2 flex flex-col items-center gap-1' : 'p-4',
          )}
        >
          {collapsed ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setProfileModalOpen(true)}
                title="Meu Perfil"
                className="text-muted-foreground hover:text-foreground"
              >
                <UserCircle className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                title="Sair"
                className="text-muted-foreground hover:text-destructive"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <div className="flex items-center justify-between">
              <button
                onClick={() => setProfileModalOpen(true)}
                className="truncate text-left hover:bg-muted/50 rounded-md px-1.5 py-1 -mx-1.5 transition-colors"
                title="Meu Perfil"
              >
                <p className="font-semibold text-xs text-foreground dark:text-white truncate">
                  {user?.name || user?.email || 'Administrador BKO'}
                </p>
                <p className="text-[11px] text-muted-foreground dark:text-gray-400 capitalize">
                  {user?.role || 'Administrador'}
                </p>
              </button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                title="Sair"
                className="text-muted-foreground hover:text-destructive shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="hidden lg:flex items-center justify-end px-6 h-14 border-b border-border bg-card/60 backdrop-blur-md shrink-0">
          <ThemeToggle />
        </header>

        <div className="lg:hidden flex items-center justify-between h-16 px-4 bg-card border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <PadtecEmblem className="w-8 h-8 text-lg" />
            <span className="font-bold text-sm dark:text-white">Central Operacional</span>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {mobileOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileOpen(false)}
          />
        )}

        <div
          className={cn(
            'lg:hidden fixed inset-y-0 left-0 w-64 bg-card z-50 transform transition-transform duration-300 ease-in-out flex flex-col justify-between p-4',
            mobileOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <div>
            <div className="p-2 flex items-center gap-3 border-b border-border/50 pb-4">
              <PadtecEmblem />
              <div>
                <h1 className="font-bold text-sm dark:text-white">Central Operacional Padtec</h1>
                <p className="text-xs text-muted-foreground dark:text-gray-400">NOC • COPE • BKO</p>
              </div>
            </div>
            <nav className="mt-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                const isGutenberg = item.path === '/gutenberg'
                const itemCls = cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium',
                  isActive
                    ? 'bg-muted text-foreground dark:text-white font-semibold'
                    : 'text-muted-foreground hover:text-foreground dark:hover:text-white hover:bg-muted/50',
                )
                if (isGutenberg) {
                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        setMobileOpen(false)
                        setDrawerOpen(!drawerOpen)
                      }}
                      className={itemCls}
                    >
                      <Icon className="w-4 h-4 text-blue-600" />
                      {item.label}
                    </button>
                  )
                }
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={itemCls}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>
          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  setMobileOpen(false)
                  setProfileModalOpen(true)
                }}
                className="text-left hover:bg-muted/50 rounded-md px-1.5 py-1 -mx-1.5 transition-colors"
                title="Meu Perfil"
              >
                <p className="font-semibold text-xs dark:text-white">
                  {user?.name || 'Administrador BKO'}
                </p>
                <p className="text-[10px] text-muted-foreground dark:text-gray-400 capitalize">
                  {user?.role || 'Administrador'}
                </p>
              </button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-muted-foreground"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <TabBar
          tabs={tabs}
          activePath={activePath}
          onActivate={(p) => navigate(p)}
          onClose={closeTab}
        />
        <main className="flex-1 lg:p-8 p-4 overflow-y-auto max-w-7xl mx-auto w-full">
          {tabs.length === 0 ? (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground dark:text-slate-400">
              Nenhuma aba aberta. Clique em um item do menu para começar.
            </div>
          ) : (
            tabs.map((tab) => {
              const config = getTabConfig(tab.path)
              if (!config) return null
              if (
                config.requiredRole &&
                user?.role !== config.requiredRole &&
                user?.role !== 'SUPERADMIN'
              )
                return null
              const Comp = config.component
              return (
                <div key={tab.path} className={cn(tab.path === activePath ? 'block' : 'hidden')}>
                  <Comp />
                </div>
              )
            })
          )}
        </main>
      </div>

      <button
        onClick={() => setDrawerOpen(!drawerOpen)}
        className={cn(
          'fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-50 group',
          drawerOpen
            ? 'bg-slate-800 hover:bg-slate-900 text-white'
            : 'bg-blue-600 hover:bg-blue-700 text-white',
        )}
        title={drawerOpen ? 'Fechar Gutenberg AI' : 'Gutenberg AI Assistant'}
      >
        {drawerOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Bot className="w-7 h-7 group-hover:scale-110 transition-transform duration-200" />
        )}
      </button>

      <GutenbergDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <ProfileModal open={profileModalOpen} onClose={() => setProfileModalOpen(false)} />
    </div>
  )
}
