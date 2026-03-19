import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  X,
  Home,
  Flame,
  BookOpen,
  Package,
  BarChart3,
  Settings,
  LogOut,
  Coffee,
  Clock,
  Bell,
  Activity,
  Upload,
} from 'lucide-react'
import { useAuth } from '../hooks'

interface LayoutProps {
  children: React.ReactNode
  isRoasting?: boolean
}

interface MenuSection {
  title: string
  items: Array<{
    path: string
    icon: React.ReactNode
    label: string
  }>
}

export const Layout: React.FC<LayoutProps> = ({ children, isRoasting = false }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const menuSections: MenuSection[] = [
    {
      title: 'MONITORING',
      items: [
        { path: '/dashboard', icon: <Home size={20} />, label: 'Dashboard' },
        { path: '/monitor', icon: <Flame size={20} />, label: 'Live Roast' },
      ],
    },
    {
      title: 'MANAGEMENT',
      items: [
        { path: '/profiles', icon: <BookOpen size={20} />, label: 'Profiles' },
        { path: '/inventory', icon: <Package size={20} />, label: 'Coffee Inventory' },
        { path: '/history', icon: <Clock size={20} />, label: 'Roast History' },
      ],
    },
    {
      title: 'ANALYSIS',
      items: [
        { path: '/analytics', icon: <BarChart3 size={20} />, label: 'Analytics' },
        { path: '/cupping', icon: <Coffee size={20} />, label: 'Cupping Notes' },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        { path: '/import-csv', icon: <Upload size={20} />, label: 'Import CSV' },
        { path: '/settings', icon: <Settings size={20} />, label: 'Settings' },
      ],
    },
  ]

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const isActive = (path: string) => location.pathname.startsWith(path)
  const currentSection = menuSections.find((section) =>
    section.items.some((item) => isActive(item.path))
  )
  const currentLabel = currentSection?.items.find((item) => isActive(item.path))?.label || 'Dashboard'

  return (
    <div className="flex h-screen bg-primary">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-72' : 'w-20'
        } bg-secondary border-r border-elevated transition-all duration-300 flex flex-col overflow-hidden shadow-elevation`}
      >
        {/* Logo */}
        <div className="h-20 border-b border-elevated flex items-center justify-between px-4">
          <div className={`flex items-center gap-3 ${!sidebarOpen && 'w-full justify-center'}`}>
            <div className="p-2 rounded-lg bg-accent-amber bg-opacity-20">
              <Coffee className="text-accent-amber" size={24} />
            </div>
            {sidebarOpen && (
              <div>
                <p className="text-accent-gold font-bold text-lg leading-tight">RoastMaster</p>
                <p className="text-text-muted text-xs">AI Edition</p>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 hover:bg-elevated rounded-lg transition-colors"
            >
              <X size={18} className="text-text-secondary" />
            </button>
          )}
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 overflow-y-auto py-6 space-y-8 px-3">
          {menuSections.map((section) => (
            <div key={section.title}>
              {sidebarOpen && (
                <p className="text-text-muted text-xs font-semibold tracking-wider uppercase mb-3 px-2">
                  {section.title}
                </p>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const active = isActive(item.path)

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${
                        active
                          ? 'bg-accent-amber bg-opacity-10 text-accent-amber border-l-2 border-accent-amber'
                          : 'text-text-secondary hover:text-text-primary hover:bg-elevated'
                      }`}
                      title={!sidebarOpen ? item.label : undefined}
                    >
                      {active && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-amber rounded-r-full" />
                      )}
                      <span className="flex-shrink-0">{item.icon}</span>
                      {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User section */}
        <div className="border-t border-elevated p-4 space-y-4">
          {isRoasting && sidebarOpen && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-success bg-opacity-10 border border-success border-opacity-20">
              <Activity size={16} className="text-success animate-pulse-glow" />
              <p className="text-success text-xs font-medium">Roast Active</p>
            </div>
          )}
          {sidebarOpen && (
            <div className="space-y-2">
              <p className="text-text-muted text-xs font-semibold tracking-wider uppercase">User</p>
              <div>
                <p className="text-accent-gold font-semibold text-sm">{user?.fullName}</p>
                <p className="text-text-muted text-xs truncate">{user?.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center justify-center gap-2 px-3 py-2 bg-danger bg-opacity-10 border border-danger border-opacity-20 text-danger rounded-lg hover:bg-opacity-20 transition-all duration-200 font-medium text-sm ${
              !sidebarOpen && 'p-3'
            }`}
            title={!sidebarOpen ? 'Logout' : undefined}
          >
            <LogOut size={16} />
            {sidebarOpen && 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-secondary border-b border-elevated flex items-center justify-between px-6 shadow-elevation">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-text-gradient">{currentLabel}</h1>
          </div>
          <div className="flex items-center gap-6">
            {isRoasting && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success bg-opacity-10 border border-success border-opacity-20">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <p className="text-success text-sm font-medium">Live Roast</p>
              </div>
            )}
            <button
              onClick={() => toast.success('No new notifications')}
              className="p-2 hover:bg-elevated rounded-lg transition-colors relative"
              title="Notifications"
            >
              <Bell size={20} className="text-text-secondary" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full" />
            </button>
            {user && (
              <div className="flex items-center gap-3 pl-6 border-l border-elevated">
                <div className="text-right">
                  <p className="text-text-primary text-sm font-medium">{user.organizationName || user.email}</p>
                  <p className="text-text-muted text-xs">{user.role || 'roaster'}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-amber to-accent-gold flex items-center justify-center text-primary font-bold">
                  {(user.fullName || user.username || user.email || 'U').charAt(0).toUpperCase()}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-primary">
          <div className="p-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
