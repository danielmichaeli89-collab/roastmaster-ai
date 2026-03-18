import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './hooks'
import {
  Login,
  Register,
  Dashboard,
  RoastMonitor,
  ProfileBuilder,
  ProfileManager,
  RoastHistory,
  CoffeeInventory,
  Analytics,
  CuppingForm,
  Settings,
} from './pages'

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-espresso-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-espresso-700 border-t-amber-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/monitor/:roastId?"
          element={
            <ProtectedRoute>
              <RoastMonitor />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profiles"
          element={
            <ProtectedRoute>
              <ProfileManager />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profiles/new"
          element={
            <ProtectedRoute>
              <ProfileBuilder />
            </ProtectedRoute>
          }
        />

        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <RoastHistory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/inventory"
          element={
            <ProtectedRoute>
              <CoffeeInventory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cupping"
          element={
            <ProtectedRoute>
              <CuppingForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#2d2d2d',
            color: '#f0eeec',
            border: '1px solid #8B4513',
          },
        }}
      />
    </Router>
  )
}
