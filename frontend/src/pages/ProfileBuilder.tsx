import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save, Sparkles, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { Layout, FlavorWheel } from '../components'
import { aiAPI, profilesAPI } from '../api'
import { RoastProfile, ProfilePhase } from '../types'

export const ProfileBuilder: React.FC = () => {
  const navigate = useNavigate()
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showGenerateModal, setShowGenerateModal] = useState(false)

  const [profile, setProfile] = useState<Partial<RoastProfile>>({
    profileName: '',
    description: '',
    targetCoffeeOrigin: '',
    targetFlavorNotes: '',
    roastStrategy: 'medium',
    targetFirstCrackSeconds: 300,
    targetDevelopmentTimePercent: 20,
    targetDropTemperature: 205,
  })

  const [phases, setPhases] = useState<Partial<ProfilePhase>[]>([
    {
      phaseNumber: 1,
      phaseName: 'Drying',
      startSeconds: 0,
      endSeconds: 150,
      targetBeanTempStart: 40,
      targetBeanTempEnd: 80,
      powerPercentStart: 100,
      powerPercentEnd: 90,
      airflowPercentStart: 50,
      airflowPercentEnd: 60,
    },
    {
      phaseNumber: 2,
      phaseName: 'Browning',
      startSeconds: 150,
      endSeconds: 250,
      targetBeanTempStart: 80,
      targetBeanTempEnd: 150,
      powerPercentStart: 90,
      powerPercentEnd: 80,
      airflowPercentStart: 60,
      airflowPercentEnd: 70,
    },
    {
      phaseNumber: 3,
      phaseName: 'Development',
      startSeconds: 250,
      endSeconds: 350,
      targetBeanTempStart: 150,
      targetBeanTempEnd: 205,
      powerPercentStart: 80,
      powerPercentEnd: 50,
      airflowPercentStart: 70,
      airflowPercentEnd: 80,
    },
  ])

  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([])
  const [generateData, setGenerateData] = useState({
    coffeeOrigin: '',
    roastLevel: 'medium',
  })

  const handleGenerateProfile = async () => {
    if (!generateData.coffeeOrigin || selectedFlavors.length === 0) {
      toast.error('Please select coffee origin and at least one flavor')
      return
    }

    try {
      setIsLoading(true)
      const generatedProfile = await aiAPI.generateProfile({
        coffeeOrigin: generateData.coffeeOrigin,
        targetFlavorProfile: selectedFlavors,
        roastLevel: generateData.roastLevel,
      })

      setProfile(generatedProfile)
      if (generatedProfile.phases) {
        setPhases(generatedProfile.phases)
      }

      setShowGenerateModal(false)
      toast.success('Profile generated with AI!')
    } catch (err) {
      toast.error('Failed to generate profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!profile.profileName) {
      toast.error('Please enter a profile name')
      return
    }

    try {
      setIsSaving(true)
      await profilesAPI.create({
        ...profile,
        phases,
      } as any)

      toast.success('Profile saved!')
      navigate(`/profiles`)
    } catch (err) {
      toast.error('Failed to save profile')
    } finally {
      setIsSaving(false)
    }
  }

  const updatePhase = (index: number, key: string, value: any) => {
    const newPhases = [...phases]
    newPhases[index] = { ...newPhases[index], [key]: value }
    setPhases(newPhases)
  }

  const addPhase = () => {
    const lastPhase = phases[phases.length - 1]
    setPhases([
      ...phases,
      {
        phaseNumber: phases.length + 1,
        phaseName: 'Custom',
        startSeconds: lastPhase?.endSeconds || 0,
        endSeconds: (lastPhase?.endSeconds || 0) + 100,
        targetBeanTempStart: 100,
        targetBeanTempEnd: 150,
        powerPercentStart: 80,
        powerPercentEnd: 60,
        airflowPercentStart: 70,
        airflowPercentEnd: 80,
      },
    ])
  }

  const removePhase = (index: number) => {
    setPhases(phases.filter((_, i) => i !== index))
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-amber-500">Roast Profile Builder</h2>
            <p className="text-espresso-400 mt-1">Create and customize roast profiles with AI assistance</p>
          </div>
          <button
            onClick={() => setShowGenerateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg font-semibold hover:shadow-lg transition flex items-center gap-2"
          >
            <Sparkles size={20} />
            Generate with AI
          </button>
        </div>

        {/* AI Generation Modal */}
        {showGenerateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-espresso-900 border border-espresso-800 rounded-lg p-6 max-w-md w-full space-y-4">
              <h3 className="text-xl font-bold text-amber-500">Generate Profile with AI</h3>

              <div>
                <label className="block text-sm font-medium text-espresso-300 mb-2">
                  Coffee Origin
                </label>
                <input
                  type="text"
                  value={generateData.coffeeOrigin}
                  onChange={(e) =>
                    setGenerateData((prev) => ({ ...prev, coffeeOrigin: e.target.value }))
                  }
                  placeholder="e.g., Ethiopian Yirgacheffe"
                  className="w-full px-4 py-2 bg-espresso-800 border border-espresso-700 rounded-lg text-espresso-100 placeholder-espresso-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-espresso-300 mb-2">
                  Roast Level
                </label>
                <select
                  value={generateData.roastLevel}
                  onChange={(e) =>
                    setGenerateData((prev) => ({ ...prev, roastLevel: e.target.value }))
                  }
                  className="w-full px-4 py-2 bg-espresso-800 border border-espresso-700 rounded-lg text-espresso-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="light">Light</option>
                  <option value="medium">Medium</option>
                  <option value="dark">Dark</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-espresso-300 mb-3">
                  Desired Flavors
                </label>
                <FlavorWheel selected={selectedFlavors as any} onChange={setSelectedFlavors} />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="flex-1 px-4 py-2 bg-espresso-800 border border-espresso-700 text-espresso-300 rounded-lg hover:border-amber-500 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerateProfile}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition disabled:opacity-50"
                >
                  {isLoading ? 'Generating...' : 'Generate'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Profile Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-espresso-900 border border-espresso-800 rounded-lg p-6 space-y-4">
            <h3 className="text-amber-500 font-semibold text-lg">Profile Information</h3>

            <div>
              <label className="block text-sm font-medium text-espresso-300 mb-2">
                Profile Name *
              </label>
              <input
                type="text"
                value={profile.profileName || ''}
                onChange={(e) => setProfile((prev) => ({ ...prev, profileName: e.target.value }))}
                placeholder="e.g., Ethiopian Light Fruit Forward"
                className="w-full px-4 py-2 bg-espresso-800 border border-espresso-700 rounded-lg text-espresso-100 placeholder-espresso-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-espresso-300 mb-2">Description</label>
              <textarea
                value={profile.description || ''}
                onChange={(e) => setProfile((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Additional notes about this profile..."
                rows={3}
                className="w-full px-4 py-2 bg-espresso-800 border border-espresso-700 rounded-lg text-espresso-100 placeholder-espresso-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-espresso-300 mb-2">Target Coffee Origin</label>
              <input
                type="text"
                value={profile.targetCoffeeOrigin || ''}
                onChange={(e) =>
                  setProfile((prev) => ({ ...prev, targetCoffeeOrigin: e.target.value }))
                }
                placeholder="e.g., Ethiopia Yirgacheffe"
                className="w-full px-4 py-2 bg-espresso-800 border border-espresso-700 rounded-lg text-espresso-100 placeholder-espresso-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-espresso-300 mb-2">Roast Strategy</label>
              <select
                value={profile.roastStrategy || ''}
                onChange={(e) => setProfile((prev) => ({ ...prev, roastStrategy: e.target.value as any }))}
                className="w-full px-4 py-2 bg-espresso-800 border border-espresso-700 rounded-lg text-espresso-100 focus:outline-none focus:border-amber-500"
              >
                <option value="light">Light</option>
                <option value="medium">Medium</option>
                <option value="dark">Dark</option>
                <option value="espresso">Espresso</option>
                <option value="filter">Filter</option>
              </select>
            </div>
          </div>

          <div className="bg-espresso-900 border border-espresso-800 rounded-lg p-6 space-y-4">
            <h3 className="text-amber-500 font-semibold text-lg">Target Parameters</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-espresso-300 mb-2">
                  First Crack (s)
                </label>
                <input
                  type="number"
                  value={profile.targetFirstCrackSeconds || 0}
                  onChange={(e) =>
                    setProfile((prev) => ({
                      ...prev,
                      targetFirstCrackSeconds: Number(e.target.value),
                    }))
                  }
                  className="w-full px-4 py-2 bg-espresso-800 border border-espresso-700 rounded-lg text-espresso-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-espresso-300 mb-2">
                  Dev Time %
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={profile.targetDevelopmentTimePercent || 0}
                  onChange={(e) =>
                    setProfile((prev) => ({
                      ...prev,
                      targetDevelopmentTimePercent: Number(e.target.value),
                    }))
                  }
                  className="w-full px-4 py-2 bg-espresso-800 border border-espresso-700 rounded-lg text-espresso-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-espresso-300 mb-2">
                  Drop Temperature (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={profile.targetDropTemperature || 0}
                  onChange={(e) =>
                    setProfile((prev) => ({
                      ...prev,
                      targetDropTemperature: Number(e.target.value),
                    }))
                  }
                  className="w-full px-4 py-2 bg-espresso-800 border border-espresso-700 rounded-lg text-espresso-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Phases Editor */}
        <div className="bg-espresso-900 border border-espresso-800 rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-amber-500 font-semibold text-lg">Roast Phases</h3>
            <button
              onClick={addPhase}
              className="px-4 py-2 bg-espresso-800 border border-espresso-700 text-espresso-300 rounded-lg hover:border-amber-500 transition flex items-center gap-2"
            >
              <Plus size={16} />
              Add Phase
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-espresso-700">
                  <th className="text-left py-3 px-4 text-espresso-400">Phase</th>
                  <th className="text-left py-3 px-4 text-espresso-400">Time (s)</th>
                  <th className="text-left py-3 px-4 text-espresso-400">Bean Temp (°C)</th>
                  <th className="text-left py-3 px-4 text-espresso-400">Power %</th>
                  <th className="text-left py-3 px-4 text-espresso-400">Airflow %</th>
                  <th className="text-left py-3 px-4 text-espresso-400"></th>
                </tr>
              </thead>
              <tbody>
                {phases.map((phase, idx) => (
                  <tr key={idx} className="border-b border-espresso-800 hover:bg-espresso-800/30">
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        value={phase.phaseName || ''}
                        onChange={(e) => updatePhase(idx, 'phaseName', e.target.value)}
                        className="w-24 px-2 py-1 bg-espresso-800 border border-espresso-700 rounded text-espresso-100 text-sm focus:outline-none focus:border-amber-500"
                      />
                    </td>
                    <td className="py-3 px-4">
                      {phase.startSeconds} - {phase.endSeconds}
                    </td>
                    <td className="py-3 px-4">
                      {phase.targetBeanTempStart} - {phase.targetBeanTempEnd}
                    </td>
                    <td className="py-3 px-4">
                      {phase.powerPercentStart} - {phase.powerPercentEnd}
                    </td>
                    <td className="py-3 px-4">
                      {phase.airflowPercentStart} - {phase.airflowPercentEnd}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => removePhase(idx)}
                        className="p-1 hover:bg-error-900/30 rounded transition"
                      >
                        <Trash2 size={16} className="text-error-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Save button */}
        <div className="flex gap-3">
          <button
            onClick={handleSaveProfile}
            disabled={isSaving || !profile.profileName}
            className="px-6 py-3 bg-gradient-to-r from-success-600 to-success-700 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 flex items-center gap-2"
          >
            <Save size={20} />
            {isSaving ? 'Saving...' : 'Save Profile'}
          </button>
          <button
            onClick={() => navigate('/profiles')}
            className="px-6 py-3 bg-espresso-800 border border-espresso-700 text-espresso-300 rounded-lg font-semibold hover:border-amber-500 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </Layout>
  )
}
