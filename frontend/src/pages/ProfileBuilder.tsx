import React, { useState } from 'react'
import { Sparkles, Save, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { Layout, LoadingSpinner } from '../components'
import { ProfilePhase } from '../types'

const ORIGINS = ['Ethiopia', 'Colombia', 'Kenya', 'Guatemala', 'Brazil', 'Costa Rica', 'Panama', 'Yemen', 'Indonesia', 'Rwanda', 'Burundi', 'Other']
const VARIETIES = ['Geisha', 'Bourbon', 'Typica', 'SL28', 'SL34', 'Caturra', 'Catuai', 'Pacamara', 'Heirloom', 'Java', 'Other']
const PROCESSING = ['Washed', 'Natural', 'Honey Yellow', 'Honey Red', 'Honey Black', 'Anaerobic Natural', 'Anaerobic Washed', 'Carbonic Maceration', 'Other']
const FLAVOR_NOTES = ['Fruity', 'Floral', 'Chocolate', 'Nutty', 'Caramel', 'Spicy', 'Berry', 'Citrus', 'Tropical', 'Honey', 'Wine', 'Earthy', 'Cocoa', 'Vanilla', 'Stone Fruit', 'Jasmine']
const ROAST_LEVELS = ['Light', 'Medium-Light', 'Medium', 'Medium-Dark']

interface GeneratedProfile {
  name: string
  description: string
  totalTime: number
  phases: ProfilePhase[]
  explanation: string
}

export const ProfileBuilder: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [generatedProfile, setGeneratedProfile] = useState<GeneratedProfile | null>(null)

  // Coffee Details
  const [origin, setOrigin] = useState('Ethiopia')
  const [region, setRegion] = useState('')
  const [variety, setVariety] = useState('Bourbon')
  const [processing, setProcessing] = useState('Washed')
  const [altitude, setAltitude] = useState(1800)
  const [moisture, setMoisture] = useState(11)
  const [density, setDensity] = useState(750)
  const [screenSize, setScreenSize] = useState(17)

  // Flavor Target
  const [flavorNotes, setFlavorNotes] = useState<string[]>(['Fruity', 'Chocolate'])
  const [acidity, setAcidity] = useState(6)
  const [body, setBody] = useState(6)
  const [sweetness, setSweetness] = useState(6)
  const [roastLevel, setRoastLevel] = useState('Medium')

  // Batch Parameters
  const [batchSize, setBatchSize] = useState(150)
  const [ambientTemp, setAmbientTemp] = useState(22)

  const toggleFlavorNote = (note: string) => {
    setFlavorNotes((prev) =>
      prev.includes(note) ? prev.filter((n) => n !== note) : [...prev, note]
    )
  }

  const generateProfile = async () => {
    setIsLoading(true)
    try {
      // Simulate 2-second API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const phases: ProfilePhase[] = [
        {
          id: '1',
          roastProfileId: 'temp-1',
          phaseNumber: 1,
          phaseName: 'Charge',
          phaseDescription: 'Initial charge and heat-up',
          startSeconds: 0,
          endSeconds: 60,
          durationSeconds: 60,
          targetBeanTempStart: 20,
          targetBeanTempEnd: 160,
          targetRampRate: 2.3,
          powerPercentStart: 100,
          powerPercentEnd: 90,
          airflowPercentStart: 50,
          airflowPercentEnd: 60,
          temperatureToleranceCelsius: 3,
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          roastProfileId: 'temp-1',
          phaseNumber: 2,
          phaseName: 'Drying',
          phaseDescription: 'Moisture removal phase',
          startSeconds: 60,
          endSeconds: 180,
          durationSeconds: 120,
          targetBeanTempStart: 160,
          targetBeanTempEnd: 200,
          targetRampRate: 0.33,
          powerPercentStart: 90,
          powerPercentEnd: 75,
          airflowPercentStart: 60,
          airflowPercentEnd: 70,
          temperatureToleranceCelsius: 3,
          createdAt: new Date().toISOString(),
        },
        {
          id: '3',
          roastProfileId: 'temp-1',
          phaseNumber: 3,
          phaseName: 'Maillard',
          phaseDescription: 'Browning phase',
          startSeconds: 180,
          endSeconds: 320,
          durationSeconds: 140,
          targetBeanTempStart: 200,
          targetBeanTempEnd: 220,
          targetRampRate: 0.14,
          powerPercentStart: 75,
          powerPercentEnd: 80,
          airflowPercentStart: 70,
          airflowPercentEnd: 75,
          temperatureToleranceCelsius: 2,
          createdAt: new Date().toISOString(),
        },
        {
          id: '4',
          roastProfileId: 'temp-1',
          phaseNumber: 4,
          phaseName: 'Development',
          phaseDescription: 'Flavor development',
          startSeconds: 320,
          endSeconds: 420,
          durationSeconds: 100,
          targetBeanTempStart: 220,
          targetBeanTempEnd: 225,
          targetRampRate: 0.05,
          powerPercentStart: 80,
          powerPercentEnd: 40,
          airflowPercentStart: 75,
          airflowPercentEnd: 80,
          temperatureToleranceCelsius: 2,
          createdAt: new Date().toISOString(),
        },
        {
          id: '5',
          roastProfileId: 'temp-1',
          phaseNumber: 5,
          phaseName: 'Drop',
          phaseDescription: 'Cool down phase',
          startSeconds: 420,
          endSeconds: 430,
          durationSeconds: 10,
          targetBeanTempStart: 225,
          targetBeanTempEnd: 225,
          targetRampRate: 0,
          powerPercentStart: 0,
          powerPercentEnd: 0,
          airflowPercentStart: 100,
          airflowPercentEnd: 100,
          temperatureToleranceCelsius: 5,
          createdAt: new Date().toISOString(),
        },
      ]

      const profile: GeneratedProfile = {
        name: `${origin} ${roastLevel} Profile`,
        description: `AI-optimized profile for ${origin} ${variety} - ${processing}. Targets bright acidity and complex flavor development.`,
        totalTime: 430,
        phases,
        explanation: `This profile was generated based on your specifications. The ${origin} coffee from ${altitude}m altitude with ${moisture}% moisture benefits from a slow drying phase to prevent case hardening. The Maillard phase is carefully controlled to develop flavor complexity while the extended development phase brings out ${flavorNotes.join(', ')} notes. Total roast time of 7 minutes 10 seconds targets a ${roastLevel.toLowerCase()} roast level with emphasis on ${body > 6 ? 'body and texture' : 'clarity and brightness'}.`,
      }

      setGeneratedProfile(profile)
      toast.success('Profile generated successfully')
    } catch (error) {
      toast.error('Failed to generate profile')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!generatedProfile) return
    try {
      // Simulate save
      await new Promise((resolve) => setTimeout(resolve, 500))
      toast.success('Profile saved')
      setGeneratedProfile(null)
    } catch (error) {
      toast.error('Failed to save profile')
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-accent-amber">Profile Builder</h2>
          <p className="text-text-secondary mt-1">AI-assisted roast profile generation</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[calc(100vh-200px)]">
          {/* LEFT PANEL - Input Form */}
          <div className="space-y-6 overflow-y-auto pr-4">
            {/* Coffee Details */}
            <div className="bg-card rounded-xl border border-elevated p-6 space-y-4">
              <h3 className="text-lg font-bold text-accent-amber">COFFEE DETAILS</h3>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Origin</label>
                <select
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full px-3 py-2 bg-elevated text-text-primary rounded-lg border border-elevated focus:outline-none focus:ring-2 focus:ring-accent-amber"
                >
                  {ORIGINS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Region</label>
                <input
                  type="text"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder="e.g., Yirgacheffe, Huila"
                  className="w-full px-3 py-2 bg-elevated text-text-primary rounded-lg border border-elevated focus:outline-none focus:ring-2 focus:ring-accent-amber"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Variety</label>
                <select
                  value={variety}
                  onChange={(e) => setVariety(e.target.value)}
                  className="w-full px-3 py-2 bg-elevated text-text-primary rounded-lg border border-elevated focus:outline-none focus:ring-2 focus:ring-accent-amber"
                >
                  {VARIETIES.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Processing</label>
                <select
                  value={processing}
                  onChange={(e) => setProcessing(e.target.value)}
                  className="w-full px-3 py-2 bg-elevated text-text-primary rounded-lg border border-elevated focus:outline-none focus:ring-2 focus:ring-accent-amber"
                >
                  {PROCESSING.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Altitude (m)</label>
                  <input
                    type="number"
                    value={altitude}
                    onChange={(e) => setAltitude(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-elevated text-text-primary rounded-lg border border-elevated focus:outline-none focus:ring-2 focus:ring-accent-amber"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Moisture %</label>
                  <input
                    type="number"
                    min="9"
                    max="13"
                    step="0.1"
                    value={moisture}
                    onChange={(e) => setMoisture(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-elevated text-text-primary rounded-lg border border-elevated focus:outline-none focus:ring-2 focus:ring-accent-amber"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Density (g/L)</label>
                  <input
                    type="number"
                    value={density}
                    onChange={(e) => setDensity(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-elevated text-text-primary rounded-lg border border-elevated focus:outline-none focus:ring-2 focus:ring-accent-amber"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Screen Size</label>
                  <input
                    type="number"
                    value={screenSize}
                    onChange={(e) => setScreenSize(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-elevated text-text-primary rounded-lg border border-elevated focus:outline-none focus:ring-2 focus:ring-accent-amber"
                  />
                </div>
              </div>
            </div>

            {/* Flavor Target */}
            <div className="bg-card rounded-xl border border-elevated p-6 space-y-4">
              <h3 className="text-lg font-bold text-accent-amber">FLAVOR TARGET</h3>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-3">Flavor Notes</label>
                <div className="grid grid-cols-2 gap-2">
                  {FLAVOR_NOTES.map((note) => (
                    <button
                      key={note}
                      onClick={() => toggleFlavorNote(note)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                        flavorNotes.includes(note)
                          ? 'bg-accent-amber text-primary'
                          : 'bg-elevated text-text-secondary border border-elevated hover:border-accent-amber'
                      }`}
                    >
                      {note}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Acidity: {acidity}/10 {acidity < 4 ? '(Muted)' : acidity > 7 ? '(Bright)' : ''}
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={acidity}
                  onChange={(e) => setAcidity(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Body: {body}/10 {body < 4 ? '(Silky)' : body > 7 ? '(Full)' : ''}
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={body}
                  onChange={(e) => setBody(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Sweetness: {sweetness}/10 {sweetness < 4 ? '(Subtle)' : sweetness > 7 ? '(Intense)' : ''}
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={sweetness}
                  onChange={(e) => setSweetness(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-3">Roast Level</label>
                <div className="grid grid-cols-2 gap-2">
                  {ROAST_LEVELS.map((level) => (
                    <button
                      key={level}
                      onClick={() => setRoastLevel(level)}
                      className={`px-3 py-2 rounded-lg font-medium transition ${
                        roastLevel === level
                          ? 'bg-accent-amber text-primary'
                          : 'bg-elevated text-text-secondary border border-elevated hover:border-accent-amber'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Batch Parameters */}
            <div className="bg-card rounded-xl border border-elevated p-6 space-y-4">
              <h3 className="text-lg font-bold text-accent-amber">BATCH PARAMETERS</h3>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Batch Size (g)</label>
                <input
                  type="number"
                  value={batchSize}
                  onChange={(e) => setBatchSize(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-elevated text-text-primary rounded-lg border border-elevated focus:outline-none focus:ring-2 focus:ring-accent-amber"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Ambient Temperature (°C)</label>
                <input
                  type="number"
                  value={ambientTemp}
                  onChange={(e) => setAmbientTemp(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-elevated text-text-primary rounded-lg border border-elevated focus:outline-none focus:ring-2 focus:ring-accent-amber"
                />
              </div>

              <button
                onClick={generateProfile}
                disabled={isLoading}
                className="w-full px-6 py-3 bg-gradient-to-r from-accent-amber to-accent-gold text-primary font-semibold rounded-lg hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Sparkles size={20} />
                {isLoading ? 'Generating...' : 'Generate AI Profile'}
              </button>
            </div>
          </div>

          {/* RIGHT PANEL - Generated Profile */}
          <div className="sticky top-6 h-fit">
            {isLoading ? (
              <div className="bg-card rounded-xl border border-elevated p-8 flex items-center justify-center h-96">
                <LoadingSpinner />
              </div>
            ) : generatedProfile ? (
              <div className="bg-card rounded-xl border border-elevated p-6 space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-accent-amber">{generatedProfile.name}</h3>
                  <p className="text-text-secondary mt-2">{generatedProfile.description}</p>
                  <p className="text-sm text-text-muted mt-2">Total Time: {Math.round(generatedProfile.totalTime / 60)}m {generatedProfile.totalTime % 60}s</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-elevated">
                        <th className="text-left py-2 px-2 text-text-secondary">Phase</th>
                        <th className="text-left py-2 px-2 text-text-secondary">Duration</th>
                        <th className="text-left py-2 px-2 text-text-secondary">Temp Start</th>
                        <th className="text-left py-2 px-2 text-text-secondary">Temp End</th>
                        <th className="text-left py-2 px-2 text-text-secondary">Power %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {generatedProfile.phases.map((phase) => (
                        <tr key={phase.id} className="border-b border-elevated/50 hover:bg-elevated/50">
                          <td className="py-2 px-2 text-accent-gold font-medium">{phase.phaseName}</td>
                          <td className="py-2 px-2">{phase.durationSeconds}s</td>
                          <td className="py-2 px-2">{phase.targetBeanTempStart}°C</td>
                          <td className="py-2 px-2">{phase.targetBeanTempEnd}°C</td>
                          <td className="py-2 px-2">{phase.powerPercentStart}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-elevated/50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-accent-amber mb-2">AI Explanation</h4>
                  <p className="text-sm text-text-secondary leading-relaxed">{generatedProfile.explanation}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleSaveProfile}
                    className="px-4 py-2 bg-success text-primary font-semibold rounded-lg hover:shadow-lg transition flex items-center justify-center gap-2"
                  >
                    <Save size={18} />
                    Save Profile
                  </button>
                  <button
                    onClick={generateProfile}
                    className="px-4 py-2 bg-accent-amber text-primary font-semibold rounded-lg hover:shadow-lg transition flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={18} />
                    Regenerate
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-card rounded-xl border border-elevated p-8 text-center space-y-4 h-96 flex flex-col items-center justify-center">
                <Sparkles size={48} className="text-accent-amber/50 mx-auto" />
                <p className="text-text-secondary">Configure coffee details and flavor targets, then click "Generate AI Profile"</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default ProfileBuilder
