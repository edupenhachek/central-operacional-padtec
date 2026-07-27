import { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
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
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useTheme } from '@/hooks/use-theme'
import { Button } from '@/components/ui/button'
import { PadtecEmblem } from '@/components/PadtecLogo'
import { GutenbergDrawer } from '@/components/GutenbergDrawer'
import { cn } from '@/lib/utils'

export default function Layout() {
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  const isAdmin = user?.role === 'ADMIN'

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

  return (
    <div className="min-h-screen flex bg-background text-foreground transition-colors duration-200">
      <aside
        className={cn(
          'relative hidden lg:flex flex-col border-r border-border bg-card/60 backdrop-blur-md justify-between select-none transition-all duration-300',
          collapsed ? 'w-16' : 'w-64',
        )}
      >
        <div>
          <div
            className={cn(
              'border-b border-border/50 flex items-center',
              collapsed ? 'justify-center p-4' : 'gap-3 p-6',
            )}
          >
            <PadtecEmblem />
            {!collapsed && (
              <div>
                <h1 className="font-bold text-sm tracking-tight text-foreground">
                  Central Operacional Padtec
                </h1>
                <p className="text-xs text-muted-foreground font-medium">NOC • COPE • BKO</p>
              </div>
            )}
          </div>

          <nav className={cn('space-y-1', collapsed ? 'p-2' : 'p-4')}>
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    'flex items-center rounded-lg text-sm font-medium transition-all duration-150',
                    collapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3.5 py-2.5',
                    isActive
                      ? 'bg-muted text-foreground font-semibold shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
                  )}
                >
                  <Icon className={cn('w-4 h-4 shrink-0', isActive && 'text-blue-600')} />
                  {!collapsed && item.label}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="border-t border-border/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              'w-full text-muted-foreground hover:text-foreground text-xs',
              collapsed ? 'justify-center px-2 py-2' : 'justify-start gap-2 px-4 py-2',
            )}
            title={collapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            {collapsed ? (
              <ChevronsRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronsLeft className="w-4 h-4" /> Recolher
              </>
            )}
          </Button>

          <div
            className={cn(
              'border-t border-border/30',
              collapsed ? 'p-2 flex flex-col items-center gap-1' : 'p-4',
            )}
          >
            <Button
              variant="ghost"
              size={collapsed ? 'icon' : 'sm'}
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              className={cn(
                'text-muted-foreground hover:text-foreground',
                !collapsed && 'w-full justify-start gap-2.5 text-xs',
              )}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {!collapsed && (theme === 'dark' ? 'Light Mode' : 'Dark Mode')}
            </Button>

            {collapsed ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                title="Sair"
                className="text-muted-foreground hover:text-destructive"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            ) : (
              <div className="pt-2 mt-2 border-t border-border/30 flex items-center justify-between">
                <div className="truncate">
                  <p className="font-semibold text-xs text-foreground truncate">
                    {user?.name || user?.email || 'Administrador BKO'}
                  </p>
                  <p className="text-[11px] text-muted-foreground capitalize">
                    {user?.role || 'Administrador'}
                  </p>
                </div>
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
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-20 -right-3 w-6 h-12 z-30 bg-card border border-border rounded-r-lg shadow-md hover:shadow-lg flex items-center justify-center hover:bg-muted transition-all duration-200"
          title={collapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {collapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
        </button>
      </aside>

      <div className="lg:hidden fixed top-0 inset-x-0 h-16 bg-card border-b border-border z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <PadtecEmblem className="w-8 h-8 text-lg" />
          <span className="font-bold text-sm">Central Operacional</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
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
              <h1 className="font-bold text-sm">Central Operacional Padtec</h1>
              <p className="text-xs text-muted-foreground">NOC • COPE • BKO</p>
            </div>
          </div>
          <nav className="mt-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium',
                    isActive
                      ? 'bg-muted text-foreground font-semibold'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="space-y-3 pt-4 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="w-full justify-start gap-2 text-muted-foreground text-xs"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-xs">{user?.name || 'Administrador BKO'}</p>
              <p className="text-[10px] text-muted-foreground capitalize">
                {user?.role || 'Administrador'}
              </p>
            </div>
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

      <main className="flex-1 lg:p-8 p-4 pt-20 lg:pt-8 overflow-y-auto max-w-7xl mx-auto w-full">
        <Outlet />
      </main>

      <button
        onClick={() => setDrawerOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-40 group"
        title="Gutenberg AI Assistant"
      >
        <Bot className="w-7 h-7 group-hover:scale-110 transition-transform duration-200" />
      </button>

      <GutenbergDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  )
}
