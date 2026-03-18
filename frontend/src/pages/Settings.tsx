import React, { useState } from 'react'
import { Save, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { Layout } from '../components'
import { useAuth } from '../hooks'

export const Settings: React.FC = () => {
  const { user, updateProfile, changePassword } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    organizationName: user?.organizationName || '',
    roesterSerialNumber: user?.roesterSerialNumber || '',
  })

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true)
      await updateProfile(profileData)
      setIsEditing(false)
      toast.success('Profile updated')
    } catch (err) {
      toast.error('Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    try {
      setIsSaving(true)
      await changePassword(passwordData.oldPassword, passwordData.newPassword)
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' })
      toast.success('Password changed')
    } catch (err) {
      toast.error('Failed to change password')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Layout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h2 className="text-3xl font-bold text-amber-500">Settings</h2>
          <p className="text-espresso-400 mt-1">Manage your account and preferences</p>
        </div>

        {/* Profile section */}
        <div className="bg-espresso-900 border border-espresso-800 rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-amber-500">Account Information</h3>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-4 py-2 rounded-lg transition ${
                isEditing
                  ? 'bg-espresso-800 border border-espresso-700'
                  : 'bg-amber-900/50 border border-amber-500'
              }`}
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-espresso-300 mb-2">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-2 bg-espresso-800 border border-espresso-700 rounded-lg text-espresso-500 cursor-not-allowed"
              />
              <p className="text-espresso-500 text-xs mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-espresso-300 mb-2">Full Name</label>
              <input
                type="text"
                value={profileData.fullName}
                onChange={(e) =>
                  setProfileData((prev) => ({ ...prev, fullName: e.target.value }))
                }
                disabled={!isEditing}
                className={`w-full px-4 py-2 bg-espresso-800 border border-espresso-700 rounded-lg text-espresso-100 focus:outline-none focus:border-amber-500 ${
                  !isEditing && 'cursor-not-allowed'
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-espresso-300 mb-2">
                Organization Name
              </label>
              <input
                type="text"
                value={profileData.organizationName}
                onChange={(e) =>
                  setProfileData((prev) => ({ ...prev, organizationName: e.target.value }))
                }
                disabled={!isEditing}
                className={`w-full px-4 py-2 bg-espresso-800 border border-espresso-700 rounded-lg text-espresso-100 focus:outline-none focus:border-amber-500 ${
                  !isEditing && 'cursor-not-allowed'
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-espresso-300 mb-2">
                ROEST Serial Number
              </label>
              <input
                type="text"
                value={profileData.roesterSerialNumber}
                onChange={(e) =>
                  setProfileData((prev) => ({ ...prev, roesterSerialNumber: e.target.value }))
                }
                disabled={!isEditing}
                className={`w-full px-4 py-2 bg-espresso-800 border border-espresso-700 rounded-lg text-espresso-100 focus:outline-none focus:border-amber-500 ${
                  !isEditing && 'cursor-not-allowed'
                }`}
              />
            </div>

            {isEditing && (
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="w-full px-4 py-2 bg-success-600 text-white rounded-lg hover:bg-success-700 transition disabled:opacity-50 flex items-center justify-center gap-2 font-semibold"
              >
                <Save size={18} />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            )}
          </div>
        </div>

        {/* Security section */}
        <div className="bg-espresso-900 border border-espresso-800 rounded-lg p-6 space-y-4">
          <h3 className="text-xl font-semibold text-amber-500 mb-6">Change Password</h3>

          <div>
            <label className="block text-sm font-medium text-espresso-300 mb-2">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordData.oldPassword}
                onChange={(e) =>
                  setPasswordData((prev) => ({ ...prev, oldPassword: e.target.value }))
                }
                className="w-full px-4 py-2 bg-espresso-800 border border-espresso-700 rounded-lg text-espresso-100 placeholder-espresso-500 focus:outline-none focus:border-amber-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-espresso-400 hover:text-espresso-300"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-espresso-300 mb-2">
              New Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))
              }
              className="w-full px-4 py-2 bg-espresso-800 border border-espresso-700 rounded-lg text-espresso-100 placeholder-espresso-500 focus:outline-none focus:border-amber-500"
            />
            <p className="text-espresso-500 text-xs mt-1">At least 8 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-espresso-300 mb-2">
              Confirm New Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))
              }
              className="w-full px-4 py-2 bg-espresso-800 border border-espresso-700 rounded-lg text-espresso-100 placeholder-espresso-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            onClick={handleChangePassword}
            disabled={isSaving || !passwordData.oldPassword || !passwordData.newPassword}
            className="w-full px-4 py-2 bg-warning-600 text-white rounded-lg hover:bg-warning-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            {isSaving ? 'Updating...' : 'Update Password'}
          </button>
        </div>

        {/* Preferences section */}
        <div className="bg-espresso-900 border border-espresso-800 rounded-lg p-6 space-y-4">
          <h3 className="text-xl font-semibold text-amber-500 mb-6">Preferences</h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-espresso-800 rounded-lg">
              <div>
                <p className="font-semibold text-espresso-100">Dark Mode</p>
                <p className="text-espresso-400 text-sm">Always enabled for this app</p>
              </div>
              <div className="w-12 h-6 bg-amber-600 rounded-full relative">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-espresso-800 rounded-lg">
              <div>
                <p className="font-semibold text-espresso-100">Email Notifications</p>
                <p className="text-espresso-400 text-sm">Receive updates on roast completion</p>
              </div>
              <div className="w-12 h-6 bg-espresso-700 rounded-full relative cursor-pointer">
                <div className="absolute left-1 top-1 w-4 h-4 bg-espresso-500 rounded-full" />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-espresso-800 rounded-lg">
              <div>
                <p className="font-semibold text-espresso-100">RTL Support</p>
                <p className="text-espresso-400 text-sm">Right-to-left interface layout</p>
              </div>
              <div className="w-12 h-6 bg-espresso-700 rounded-full relative cursor-pointer">
                <div className="absolute left-1 top-1 w-4 h-4 bg-espresso-500 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Danger zone */}
        <div className="bg-error-900/20 border border-error-500 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-error-400">Danger Zone</h3>

          <button className="w-full px-4 py-2 bg-error-600 text-white rounded-lg hover:bg-error-700 transition font-semibold">
            Delete Account
          </button>
          <p className="text-error-400 text-xs">
            Permanently delete your account and all associated data. This cannot be undone.
          </p>
        </div>
      </div>
    </Layout>
  )
}
