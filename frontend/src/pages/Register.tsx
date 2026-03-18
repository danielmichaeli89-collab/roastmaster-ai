import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Coffee, UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks'

export const Register: React.FC = () => {
  const navigate = useNavigate()
  const { register, isLoading, error } = useAuth()

  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    organizationName: '',
    roesterSerialNumber: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.email || !formData.username || !formData.password || !formData.fullName) {
      toast.error('Please fill in required fields')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    try {
      await register({
        email: formData.email,
        username: formData.username,
        password: formData.password,
        fullName: formData.fullName,
        organizationName: formData.organizationName,
        roesterSerialNumber: formData.roesterSerialNumber,
      })
      toast.success('Account created successfully!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(error || 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen bg-espresso-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-600 to-amber-800 rounded-full mb-4">
            <Coffee className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-amber-500 mb-2">RoastMaster AI</h1>
          <p className="text-espresso-400">Create Your Account</p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-espresso-900 border border-espresso-800 rounded-lg p-8 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-espresso-300 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full px-4 py-2 bg-espresso-800 border border-espresso-700 rounded-lg text-espresso-100 placeholder-espresso-500 focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-espresso-300 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              className="w-full px-4 py-2 bg-espresso-800 border border-espresso-700 rounded-lg text-espresso-100 placeholder-espresso-500 focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-espresso-300 mb-2">
              Username *
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="roastmaster"
              className="w-full px-4 py-2 bg-espresso-800 border border-espresso-700 rounded-lg text-espresso-100 placeholder-espresso-500 focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-espresso-300 mb-2">
              Password *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-2 bg-espresso-800 border border-espresso-700 rounded-lg text-espresso-100 placeholder-espresso-500 focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-espresso-300 mb-2">
              Confirm Password *
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-2 bg-espresso-800 border border-espresso-700 rounded-lg text-espresso-100 placeholder-espresso-500 focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-espresso-300 mb-2">
              Organization Name
            </label>
            <input
              type="text"
              name="organizationName"
              value={formData.organizationName}
              onChange={handleChange}
              placeholder="My Roastery"
              className="w-full px-4 py-2 bg-espresso-800 border border-espresso-700 rounded-lg text-espresso-100 placeholder-espresso-500 focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-espresso-300 mb-2">
              ROEST Serial Number
            </label>
            <input
              type="text"
              name="roesterSerialNumber"
              value={formData.roesterSerialNumber}
              onChange={handleChange}
              placeholder="L200-XXXX"
              className="w-full px-4 py-2 bg-espresso-800 border border-espresso-700 rounded-lg text-espresso-100 placeholder-espresso-500 focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          {error && (
            <div className="bg-error-900/30 border border-error-500 text-error-400 rounded-lg p-3 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg font-semibold hover:from-amber-700 hover:to-amber-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <UserPlus size={18} />
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        {/* Login link */}
        <p className="text-center text-espresso-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-amber-500 hover:text-amber-400 font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
