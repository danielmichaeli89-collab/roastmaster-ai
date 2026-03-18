import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Menu,
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
} from 'lucide-react'
import { useAuth } from '../hooks'

interface LayoutProps {
  children: React.ReactNode
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const menuItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/monitor', icon: Flame, label: 'Roast Monitor' },
    { path: '/profiles', icon: BookOpen, label: 'Profiles' },
    { path: '/inventory', icon: Package, label: 'Inventory' },
    { path: '/history', icon: Clock, label: 'History' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/cupping', icon: Coffee, label: 'Cupping' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ]

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="flex h-screen bg-espresso-950">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-espresso-900 border-r border-espresso-800 transition-all duration-300 flex flex-col overflow-hidden`}
      >
        {/* Logo */}
        <div className="h-20 border-b border-espresso-800 flex items-center justify-between px-4">
          <div className={`flex items-center gap-2 ${!sidebarOpen && 'w-full justify-center'}`}>
            <Coffee className="text-amber-500" size={28} />
            {sidebarOpen && <span className="text-amber-500 font-bold text-lg">RoastMaster</span>}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-espresso-800 rounded transition"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition ${
                  active
                    ? 'bg-amber-900/50 text-amber-500 border border-amber-500'
                    : 'text-espresso-300 hover:bg-espresso-800'
                }`}
                title={!sidebarOpen ? item.label : undefined}
              >
                <Icon size={20} className="flex-shrink-0" />
                {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* User section */}
        {sidebarOpen && (
          <div className="border-t border-espresso-800 p-4">
            <div className="mb-4">
              <p className="text-espresso-400 text-xs uppercase">User</p>
              <p className="text-amber-500 font-semibold truncate">{user?.fullName}</p>
              <p className="text-espresso-500 text-xs truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 bg-error-900/30 border border-error-500 text-error-400 rounded-lg hover:bg-error-900/50 transition text-sm font-medium"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        )}
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-espresso-900 border-b border-espresso-800 flex items-center justify-between px-6">
          <h1 className="text-2xl font-bold text-amber-500">
            {menuItems.find((item) => isActive(item.path))?.label || 'RoastMaster AI'}
          </h1>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-espresso-300 text-sm">{user?.organizationName}</p>
              <p className="text-espresso-500 text-xs">{user?.role}</p>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-espresso-950">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
