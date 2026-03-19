import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { Layout, LoadingSpinner, CoffeeCard } from '../components'
import { inventoryAPI } from '../api'
import { GreenCoffee } from '../types'

export const CoffeeInventory: React.FC = () => {
  const [coffees, setCoffees] = useState<GreenCoffee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedCoffee, setSelectedCoffee] = useState<GreenCoffee | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  const [formData, setFormData] = useState({
    coffeeName: '',
    originCountry: '',
    originRegion: '',
    processingMethod: '',
    quantityKg: 0,
    densityScore: 5,
    moisturePercent: 11,
    expectedFlavorNotes: '',
    supplier: '',
    lotNumber: '',
    variety: '',
    altitude: '',
  })

  useEffect(() => {
    loadCoffees()
  }, [])

  const loadCoffees = async () => {
    try {
      setIsLoading(true)
      const response = await inventoryAPI.list(1, 100)
      // Map backend snake_case to frontend camelCase
      const mapped = (response.data || response || []).map((c: any) => ({
        ...c,
        id: c.id,
        coffeeName: c.name || c.coffeeName || '',
        originCountry: c.origin_country || c.originCountry || '',
        originRegion: c.region || c.originRegion || '',
        processingMethod: c.processing_method || c.processingMethod || '',
        quantityKg: c.quantity_kg || c.quantityKg || 0,
        density: c.density || 0,
        moisturePercent: c.moisture_content || c.moisturePercent || 0,
        flavorNotes: c.flavor_notes || c.flavorNotes || '',
      }))
      setCoffees(mapped)
    } catch (err) {
      console.error('Load coffees error:', err)
      setCoffees([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddNew = () => {
    setSelectedCoffee(null)
    setFormData({
      coffeeName: '',
      originCountry: '',
      originRegion: '',
      processingMethod: '',
      quantityKg: 0,
      densityScore: 5,
      moisturePercent: 11,
      expectedFlavorNotes: '',
      supplier: '',
      lotNumber: '',
      variety: '',
      altitude: '',
    })
    setShowModal(true)
  }

  const handleEdit = (coffee: GreenCoffee) => {
    setSelectedCoffee(coffee)
    setFormData({
      coffeeName: coffee.coffeeName,
      originCountry: coffee.originCountry,
      originRegion: coffee.originRegion || '',
      processingMethod: coffee.processingMethod,
      quantityKg: coffee.quantityKg,
      densityScore: coffee.densityScore,
      moisturePercent: coffee.moisturePercent,
      expectedFlavorNotes: coffee.expectedFlavorNotes || '',
      supplier: coffee.supplierName || '',
      lotNumber: coffee.lotNumber || '',
      variety: (coffee as any).variety || '',
      altitude: (coffee as any).altitude || '',
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!formData.coffeeName || !formData.originCountry) {
      toast.error('Please fill in required fields')
      return
    }

    // Map frontend camelCase fields to backend snake_case
    const apiData = {
      name: formData.coffeeName,
      origin_country: formData.originCountry,
      region: formData.originRegion,
      processing_method: formData.processingMethod,
      quantity_kg: formData.quantityKg ? parseFloat(formData.quantityKg as any) : null,
      density: formData.densityScore ? parseFloat(formData.densityScore as any) : null,
      moisture_content: formData.moisturePercent ? parseFloat(formData.moisturePercent as any) : null,
      flavor_notes: formData.expectedFlavorNotes || null,
      variety: (formData as any).variety || null,
      altitude: (formData as any).altitude ? parseInt((formData as any).altitude) : null,
    }

    try {
      if (selectedCoffee) {
        await inventoryAPI.update(selectedCoffee.id, apiData as any)
        toast.success('Coffee updated successfully!')
      } else {
        await inventoryAPI.create(apiData as any)
        toast.success('Coffee added successfully!')
      }
      await loadCoffees()
      setShowModal(false)
    } catch (err: any) {
      console.error('Save coffee error:', err)
      toast.error(err?.response?.data?.error || 'Failed to save coffee')
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this coffee?')) return

    try {
      await inventoryAPI.delete(id)
      toast.success('Coffee deleted')
      loadCoffees()
    } catch (err) {
      toast.error('Failed to delete coffee')
    }
  }

  const filteredCoffees = coffees.filter(
    (c) =>
      (c.coffeeName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.originCountry || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

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
            <h2 className="text-3xl font-bold text-accent-amber">Coffee Inventory</h2>
            <p className="text-text-secondary mt-1">{filteredCoffees.length} coffees in stock</p>
          </div>
          <button
            onClick={handleAddNew}
            className="px-6 py-3 bg-gradient-to-r from-accent-amber to-accent-gold text-primary rounded-lg font-semibold hover:shadow-lg transition flex items-center gap-2"
          >
            <Plus size={20} />
            Add Coffee
          </button>
        </div>

        {/* Search and View Toggle */}
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search by name or origin..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-6 py-3 bg-card text-text-primary rounded-lg border border-elevated focus:outline-none focus:ring-2 focus:ring-accent-amber"
          />
          <div className="flex gap-2 bg-card rounded-lg border border-elevated p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded font-medium transition ${viewMode === 'grid' ? 'bg-accent-amber text-primary' : 'text-text-secondary'}`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 rounded font-medium transition ${viewMode === 'table' ? 'bg-accent-amber text-primary' : 'text-text-secondary'}`}
            >
              Table
            </button>
          </div>
        </div>

        {/* Grid View */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCoffees.map((coffee) => (
              <div key={coffee.id} className="relative group">
                <CoffeeCard coffee={coffee} />
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() => handleEdit(coffee)}
                    className="p-2 bg-info hover:shadow-lg rounded-full text-white transition"
                    title="Edit"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(coffee.id)}
                    className="p-2 bg-danger hover:shadow-lg rounded-full text-white transition"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Table View */}
        {viewMode === 'table' && (
          <div className="bg-card rounded-xl border border-elevated overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-elevated border-b border-elevated">
                <tr>
                  <th className="text-left py-3 px-4 text-text-secondary font-semibold">Name</th>
                  <th className="text-left py-3 px-4 text-text-secondary font-semibold">Origin</th>
                  <th className="text-left py-3 px-4 text-text-secondary font-semibold">Processing</th>
                  <th className="text-left py-3 px-4 text-text-secondary font-semibold">Qty (kg)</th>
                  <th className="text-left py-3 px-4 text-text-secondary font-semibold">Moisture %</th>
                  <th className="text-left py-3 px-4 text-text-secondary font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCoffees.map((coffee) => (
                  <tr key={coffee.id} className="border-b border-elevated/50 hover:bg-elevated/50">
                    <td className="py-3 px-4 text-text-primary font-medium">{coffee.coffeeName}</td>
                    <td className="py-3 px-4 text-accent-gold">{coffee.originCountry} {coffee.originRegion && `- ${coffee.originRegion}`}</td>
                    <td className="py-3 px-4 text-text-secondary">{coffee.processingMethod}</td>
                    <td className="py-3 px-4 text-text-primary">{Number(coffee.quantityKg || 0).toFixed(1)}</td>
                    <td className="py-3 px-4 text-text-primary">{Number(coffee.moisturePercent || 0).toFixed(1)}</td>
                    <td className="py-3 px-4 flex gap-2">
                      <button
                        onClick={() => handleEdit(coffee)}
                        className="p-1 hover:bg-info/20 rounded transition text-info"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(coffee.id)}
                        className="p-1 hover:bg-danger/20 rounded transition text-danger"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-elevated rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-4">
              <h3 className="text-xl font-bold text-accent-amber">
                {selectedCoffee ? 'Edit Coffee' : 'Add Coffee'}
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-text-primary mb-2">Coffee Name</label>
                  <input
                    type="text"
                    value={formData.coffeeName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, coffeeName: e.target.value }))}
                    className="w-full px-4 py-2 bg-elevated text-text-primary rounded-lg border border-elevated focus:outline-none focus:ring-2 focus:ring-accent-amber"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Country</label>
                  <input
                    type="text"
                    value={formData.originCountry}
                    onChange={(e) => setFormData((prev) => ({ ...prev, originCountry: e.target.value }))}
                    className="w-full px-4 py-2 bg-elevated text-text-primary rounded-lg border border-elevated focus:outline-none focus:ring-2 focus:ring-accent-amber"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Region</label>
                  <input
                    type="text"
                    value={formData.originRegion}
                    onChange={(e) => setFormData((prev) => ({ ...prev, originRegion: e.target.value }))}
                    className="w-full px-4 py-2 bg-elevated text-text-primary rounded-lg border border-elevated focus:outline-none focus:ring-2 focus:ring-accent-amber"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Processing</label>
                  <input
                    type="text"
                    value={formData.processingMethod}
                    onChange={(e) => setFormData((prev) => ({ ...prev, processingMethod: e.target.value }))}
                    placeholder="Washed, Natural, etc."
                    className="w-full px-4 py-2 bg-elevated text-text-primary rounded-lg border border-elevated focus:outline-none focus:ring-2 focus:ring-accent-amber"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Quantity (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.quantityKg}
                    onChange={(e) => setFormData((prev) => ({ ...prev, quantityKg: Number(e.target.value) }))}
                    className="w-full px-4 py-2 bg-elevated text-text-primary rounded-lg border border-elevated focus:outline-none focus:ring-2 focus:ring-accent-amber"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Density (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    step="0.1"
                    value={formData.densityScore}
                    onChange={(e) => setFormData((prev) => ({ ...prev, densityScore: Number(e.target.value) }))}
                    className="w-full px-4 py-2 bg-elevated text-text-primary rounded-lg border border-elevated focus:outline-none focus:ring-2 focus:ring-accent-amber"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Moisture (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    step="0.1"
                    value={formData.moisturePercent}
                    onChange={(e) => setFormData((prev) => ({ ...prev, moisturePercent: Number(e.target.value) }))}
                    className="w-full px-4 py-2 bg-elevated text-text-primary rounded-lg border border-elevated focus:outline-none focus:ring-2 focus:ring-accent-amber"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Variety</label>
                  <input
                    type="text"
                    value={(formData as any).variety}
                    onChange={(e) => setFormData((prev) => ({ ...prev, variety: e.target.value } as any))}
                    placeholder="e.g., Bourbon, Typica"
                    className="w-full px-4 py-2 bg-elevated text-text-primary rounded-lg border border-elevated focus:outline-none focus:ring-2 focus:ring-accent-amber"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Altitude (m)</label>
                  <input
                    type="number"
                    value={(formData as any).altitude}
                    onChange={(e) => setFormData((prev) => ({ ...prev, altitude: e.target.value } as any))}
                    placeholder="e.g., 1500"
                    className="w-full px-4 py-2 bg-elevated text-text-primary rounded-lg border border-elevated focus:outline-none focus:ring-2 focus:ring-accent-amber"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-text-primary mb-2">Flavor Notes</label>
                  <textarea
                    value={formData.expectedFlavorNotes}
                    onChange={(e) => setFormData((prev) => ({ ...prev, expectedFlavorNotes: e.target.value }))}
                    rows={2}
                    className="w-full px-4 py-2 bg-elevated text-text-primary rounded-lg border border-elevated focus:outline-none focus:ring-2 focus:ring-accent-amber"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-elevated text-text-secondary rounded-lg hover:bg-elevated border border-elevated transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-accent-amber text-primary rounded-lg hover:shadow-lg transition font-semibold"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default CoffeeInventory
