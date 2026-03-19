import React, { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { Layout, FlavorWheel, ScoreRadar } from '../components'
import { inventoryAPI } from '../api'

export const CuppingForm: React.FC = () => {
  const [searchParams] = useSearchParams()
  const coffeeId = searchParams.get('coffeeId') || ''
  const [isSaving, setIsSaving] = useState(false)
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([])

  const [formData, setFormData] = useState({
    aroma: 7.5,
    flavor: 7.5,
    aftertaste: 7.5,
    acidity: 7.5,
    body: 7.5,
    balance: 7.5,
    uniformity: 7.5,
    cleanCup: 7.5,
    sweetness: 7.5,
    overall: 7.5,
    defects: 0,
    mouthFeel: 'medium',
    finishQuality: 'medium',
    tastingNotes: '',
    cupperName: '',
  })

  const totalScore = [
    formData.aroma,
    formData.flavor,
    formData.aftertaste,
    formData.acidity,
    formData.body,
    formData.balance,
    formData.uniformity,
    formData.cleanCup,
    formData.sweetness,
    formData.overall,
  ].reduce((a, b) => a + b, 0) - formData.defects

  const scoreRadarData = [
    { category: 'Aroma', score: formData.aroma },
    { category: 'Flavor', score: formData.flavor },
    { category: 'Aftertaste', score: formData.aftertaste },
    { category: 'Acidity', score: formData.acidity },
    { category: 'Body', score: formData.body },
    { category: 'Balance', score: formData.balance },
    { category: 'Uniformity', score: formData.uniformity },
    { category: 'Clean Cup', score: formData.cleanCup },
    { category: 'Sweetness', score: formData.sweetness },
    { category: 'Overall', score: formData.overall },
  ]

  const handleSave = async () => {
    if (!coffeeId) {
      toast.error('No coffee selected')
      return
    }

    try {
      setIsSaving(true)
      await inventoryAPI.addCuppingNotes(coffeeId, {
        ...formData,
        dominantFlavors: selectedFlavors,
        totalScore,
        cuppingDate: new Date().toISOString().split('T')[0],
        cuppingMethod: 'manual',
      } as any)

      toast.success('Cupping notes saved!')
    } catch (err) {
      toast.error('Failed to save cupping notes')
    } finally {
      setIsSaving(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 9) return 'text-success-500'
    if (score >= 8) return 'text-green-500'
    if (score >= 7) return 'text-accent-amber'
    return 'text-warning-500'
  }

  return (
    <Layout>
      <div className="space-y-6 max-w-6xl">
        <div>
          <h2 className="text-3xl font-bold text-accent-amber">SCA Cupping Form</h2>
          <p className="text-text-secondary mt-1">Score and analyze this coffee's sensory profile</p>
        </div>

        {!coffeeId && (
          <div className="bg-card rounded-xl border border-elevated p-12 text-center">
            <p className="text-text-primary text-lg font-semibold mb-2">No coffee selected</p>
            <p className="text-text-secondary">Complete a roast first, then add cupping notes</p>
          </div>
        )}

        {coffeeId && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Scoring panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-card rounded-xl border border-elevated p-6 space-y-4">
              <h3 className="text-accent-amber font-bold text-lg">Cupping Info</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Cupper Name
                  </label>
                  <input
                    type="text"
                    value={formData.cupperName}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, cupperName: e.target.value }))
                    }
                    placeholder="Your name"
                    className="w-full px-4 py-2 bg-elevated border border-elevated rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-amber"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Mouth Feel
                  </label>
                  <select
                    value={formData.mouthFeel}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, mouthFeel: e.target.value }))
                    }
                    className="w-full px-4 py-2 bg-elevated border border-elevated rounded-lg text-text-primary focus:outline-none focus:border-accent-amber"
                  >
                    <option value="light">Light</option>
                    <option value="medium">Medium</option>
                    <option value="full">Full</option>
                    <option value="syrupy">Syrupy</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Tasting Notes
                </label>
                <textarea
                  value={formData.tastingNotes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, tastingNotes: e.target.value }))
                  }
                  placeholder="Describe the tasting experience..."
                  rows={3}
                  className="w-full px-4 py-2 bg-elevated border border-elevated rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-amber"
                />
              </div>
            </div>

            {/* Scores Grid */}
            <div className="bg-card border border-elevated rounded-lg p-6 space-y-4">
              <h3 className="text-accent-amber font-semibold text-lg">SCA Scores (0-10)</h3>

              <div className="grid grid-cols-2 gap-4">
                {[
                  'aroma',
                  'flavor',
                  'aftertaste',
                  'acidity',
                  'body',
                  'balance',
                  'uniformity',
                  'cleanCup',
                  'sweetness',
                  'overall',
                ].map((key) => (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-text-primary capitalize">
                        {key.replace(/([A-Z])/g, ' $1')}
                      </label>
                      <span className={`font-bold ${getScoreColor(formData[key as keyof typeof formData] as number)}`}>
                        {(formData[key as keyof typeof formData] as number).toFixed(1)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="0.5"
                      value={formData[key as keyof typeof formData]}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          [key]: Number(e.target.value),
                        }))
                      }
                      className="w-full"
                    />
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-elevated">
                <label className="text-sm font-medium text-text-primary mb-2 block">
                  Defects (deduct points)
                </label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  value={formData.defects}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, defects: Number(e.target.value) }))
                  }
                  className="w-full"
                />
                <p className="text-text-secondary text-xs mt-1">-{formData.defects} points</p>
              </div>
            </div>

            {/* Flavor Wheel */}
            <FlavorWheel selected={selectedFlavors as any} onChange={setSelectedFlavors} />
          </div>

          {/* Right column: Score display and radar */}
          <div className="space-y-6">
            {/* Total score */}
            <div className="bg-gradient-to-br from-amber-900/50 to-orange-900/50 border border-accent-amber rounded-lg p-6 text-center">
              <p className="text-accent-gold text-sm font-semibold mb-2">Total Score</p>
              <p className="text-5xl font-bold text-accent-amber mb-3">{totalScore.toFixed(2)}</p>
              <p className="text-text-primary text-sm">
                {totalScore >= 90
                  ? '⭐⭐⭐ Exceptional'
                  : totalScore >= 85
                    ? '⭐⭐ Excellent'
                    : totalScore >= 80
                      ? '⭐ Very Good'
                      : 'Good'}
              </p>
            </div>

            {/* Radar chart */}
            <ScoreRadar data={scoreRadarData} height={300} />

            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full px-4 py-3 bg-gradient-to-r from-success-600 to-success-700 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save size={20} />
              {isSaving ? 'Saving...' : 'Save Cupping'}
            </button>
          </div>
        </div>
        )}
      </div>
    </Layout>
  )
}
