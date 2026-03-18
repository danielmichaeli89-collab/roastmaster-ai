import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Edit2, Trash2, Copy, Download } from 'lucide-react'
import toast from 'react-hot-toast'
import { Layout, LoadingSpinner } from '../components'
import { profilesAPI } from '../api'
import { RoastProfile } from '../types'

export const ProfileManager: React.FC = () => {
  const navigate = useNavigate()
  const [profiles, setProfiles] = useState<RoastProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [templates, setTemplates] = useState<RoastProfile[]>([])

  useEffect(() => {
    loadProfiles()
    loadTemplates()
  }, [])

  const loadProfiles = async () => {
    try {
      setIsLoading(true)
      const response = await profilesAPI.list(1, 50)
      setProfiles(response.data)
    } catch (err) {
      toast.error('Failed to load profiles')
    } finally {
      setIsLoading(false)
    }
  }

  const loadTemplates = async () => {
    try {
      const data = await profilesAPI.listTemplates()
      setTemplates(data)
    } catch (err) {
      console.error('Failed to load templates', err)
    }
  }

  const handleDuplicate = async (profileId: string, profileName: string) => {
    try {
      const newName = `${profileName} (Copy)`
      await profilesAPI.duplicate(profileId, newName)
      toast.success('Profile duplicated')
      loadProfiles()
    } catch (err) {
      toast.error('Failed to duplicate profile')
    }
  }

  const handleDelete = async (profileId: string) => {
    if (!window.confirm('Delete this profile?')) return

    try {
      await profilesAPI.delete(profileId)
      toast.success('Profile deleted')
      loadProfiles()
    } catch (err) {
      toast.error('Failed to delete profile')
    }
  }

  const handleExport = async (profileId: string, profileName: string) => {
    try {
      const blob = await profilesAPI.exportProfile(profileId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${profileName}.json`
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success('Profile exported')
    } catch (err) {
      toast.error('Failed to export profile')
    }
  }

  if (isLoading) {
    return (
      <Layout>
        <LoadingSpinner />
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-amber-500">Roast Profiles</h2>
            <p className="text-espresso-400 mt-1">{profiles.length} custom profiles</p>
          </div>
          <button
            onClick={() => navigate('/profiles')}
            className="px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg font-semibold hover:shadow-lg transition flex items-center gap-2"
          >
            <Plus size={20} />
            Create Profile
          </button>
        </div>

        {/* Profile Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="bg-espresso-900 border border-espresso-800 rounded-lg p-6 space-y-4 hover:border-amber-500 transition"
            >
              <div>
                <h3 className="text-lg font-bold text-amber-500">{profile.profileName}</h3>
                {profile.description && (
                  <p className="text-espresso-400 text-sm mt-1">{profile.description}</p>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-espresso-400">Target Strategy</span>
                  <span className="text-espresso-100 font-semibold capitalize">
                    {profile.roastStrategy}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-espresso-400">First Crack</span>
                  <span className="text-espresso-100 font-semibold">
                    {profile.targetFirstCrackSeconds}s
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-espresso-400">Dev Time %</span>
                  <span className="text-espresso-100 font-semibold">
                    {profile.targetDevelopmentTimePercent}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-espresso-400">Drop Temp</span>
                  <span className="text-espresso-100 font-semibold">
                    {profile.targetDropTemperature}°C
                  </span>
                </div>
              </div>

              {profile.aiGenerated && (
                <div className="px-2 py-1 bg-purple-900/30 border border-purple-500 rounded text-purple-400 text-xs font-semibold text-center">
                  AI Generated
                </div>
              )}

              {profile.phases && (
                <div className="text-xs text-espresso-400">
                  {profile.phases.length} phases
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-espresso-700">
                <button
                  onClick={() => navigate(`/profiles?edit=${profile.id}`)}
                  className="flex-1 px-3 py-2 bg-blue-900/50 border border-blue-500 text-blue-400 rounded-lg hover:bg-blue-900 transition text-sm font-medium flex items-center justify-center gap-1"
                >
                  <Edit2 size={14} />
                  Edit
                </button>

                <button
                  onClick={() => handleDuplicate(profile.id, profile.profileName)}
                  className="flex-1 px-3 py-2 bg-indigo-900/50 border border-indigo-500 text-indigo-400 rounded-lg hover:bg-indigo-900 transition text-sm font-medium flex items-center justify-center gap-1"
                >
                  <Copy size={14} />
                  Copy
                </button>

                <button
                  onClick={() => handleExport(profile.id, profile.profileName)}
                  className="flex-1 px-3 py-2 bg-emerald-900/50 border border-emerald-500 text-emerald-400 rounded-lg hover:bg-emerald-900 transition text-sm font-medium flex items-center justify-center gap-1"
                >
                  <Download size={14} />
                </button>

                <button
                  onClick={() => handleDelete(profile.id)}
                  className="flex-1 px-3 py-2 bg-error-900/50 border border-error-500 text-error-400 rounded-lg hover:bg-error-900 transition text-sm font-medium"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Templates section */}
        {templates.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-amber-500">Community Templates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((profile) => (
                <div
                  key={profile.id}
                  className="bg-espresso-800/50 border-2 border-dashed border-amber-500 rounded-lg p-6 space-y-4 hover:border-amber-400 transition"
                >
                  <div>
                    <h4 className="text-lg font-bold text-amber-400">{profile.profileName}</h4>
                    {profile.description && (
                      <p className="text-espresso-400 text-sm mt-1">{profile.description}</p>
                    )}
                  </div>

                  <button
                    onClick={() => handleDuplicate(profile.id, profile.profileName)}
                    className="w-full px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition font-semibold flex items-center justify-center gap-2"
                  >
                    <Copy size={16} />
                    Use Template
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {profiles.length === 0 && templates.length === 0 && (
          <div className="text-center py-12">
            <p className="text-espresso-400 text-lg mb-4">No profiles yet</p>
            <button
              onClick={() => navigate('/profiles')}
              className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition font-semibold"
            >
              Create Your First Profile
            </button>
          </div>
        )}
      </div>
    </Layout>
  )
}
