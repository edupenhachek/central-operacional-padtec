import { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  CheckSquare,
  FileText,
  GraduationCap,
  Bot,
  BrainCircuit,
  ArrowRightLeft,
  Users,
  Moon,
  Sun,
  LogOut,
  Menu,
  X,
  Bot as RobotIcon,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useTheme } from '@/hooks/use-theme'
import { Button } from '@/components/ui/button'
import { PadtecEmblem } from '@/components/PadtecLogo'
import { GutenbergDrawer } from '@/components/GutenbergDrawer'

export default function Layout() {
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const isAdmin = user?.role === 'ADMIN'

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Validador OPS', path: '/validador-ops', icon: CheckSquare },
    { label: 'Documentacao', path: '/documentacao', icon: FileText },
    { label: 'Treinamentos', path: '/treinamentos', icon: GraduationCap },
    { label: 'Gutenberg', path: '/gutenberg', icon: BrainCircuit },
    { label: 'Transbordo', path: '/transbordo', icon: ArrowRightLeft },
    ...(isAdmin ? [{ label: 'Usuarios', path: '/usuarios', icon: Users }] : []),
  ]

  const handleLogout = () => {
    signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex bg-background text-foreground transition-colors duration-200">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-card/60 backdrop-blur-md justify-between select-none">
        <div>
          {/* Header */}
          <div className="p-6 flex items-center gap-3 border-b border-border/50">
            <PadtecEmblem />
            <div>
              <h1 className="font-bold text-sm tracking-tight text-foreground">
                Central Operacional Padtec
              </h1>
              <p className="text-xs text-muted-foreground font-medium">NOC • COPE • BKO</p>
            </div>
          </div>

          {/* Nav List */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-muted text-foreground border-l-4 border-blue-600 font-semibold shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : ''}`} />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border/50 space-y-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="w-full justify-start gap-2.5 text-muted-foreground hover:text-foreground text-xs"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </Button>

          <div className="pt-2 border-t border-border/30 flex items-center justify-between">
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
        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="lg:hidden fixed top-0 inset-x-0 h-16 bg-card border-b border-border z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <PadtecEmblem className="w-8 h-8 text-lg" />
          <span className="font-bold text-sm">Central Operacional</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 w-64 bg-card z-50 transform transition-transform duration-300 ease-in-out flex flex-col justify-between p-4 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
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
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium ${
                    isActive
                      ? 'bg-muted text-foreground border-l-4 border-blue-600 font-semibold'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
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

      {/* Main Content Area */}
      <main className="flex-1 lg:p-8 p-4 pt-20 lg:pt-8 overflow-y-auto max-w-7xl mx-auto w-full">
        <Outlet />
      </main>

      {/* Floating Action Button for Gutenberg Assistant */}
      <button
        onClick={() => setDrawerOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-40 group"
        title="Gutenberg AI Assistant"
      >
        <RobotIcon className="w-7 h-7 group-hover:scale-110 transition-transform duration-200" />
      </button>

      {/* Gutenberg AI Side Drawer */}
      <GutenbergDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  )
}
