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
  })

  useEffect(() => {
    loadCoffees()
  }, [])

  const loadCoffees = async () => {
    try {
      setIsLoading(true)
      const response = await inventoryAPI.list(1, 100)
      setCoffees(response.data)
    } catch (err) {
      toast.error('Failed to load inventory')
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
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!formData.coffeeName || !formData.originCountry) {
      toast.error('Please fill in required fields')
      return
    }

    try {
      if (selectedCoffee) {
        await inventoryAPI.update(selectedCoffee.id, formData as any)
        toast.success('Coffee updated')
      } else {
        await inventoryAPI.create(formData as any)
        toast.success('Coffee added')
      }
      loadCoffees()
      setShowModal(false)
    } catch (err) {
      toast.error('Failed to save coffee')
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
      c.coffeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.originCountry.toLowerCase().includes(searchQuery.toLowerCase())
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
            <h2 className="text-3xl font-bold text-amber-500">Coffee Inventory</h2>
            <p className="text-espresso-400 mt-1">{filteredCoffees.length} coffees in stock</p>
          </div>
          <button
            onClick={handleAddNew}
            className="px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg font-semibold hover:shadow-lg transition flex items-center gap-2"
          >
            <Plus size={20} />
            Add Coffee
          </button>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search by name or origin..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-6 py-3 bg-espresso-900 border border-espresso-800 rounded-lg text-espresso-100 placeholder-espresso-500 focus:outline-none focus:border-amber-500 transition"
        />

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCoffees.map((coffee) => (
            <div key={coffee.id} className="relative group">
              <CoffeeCard coffee={coffee} />
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                <button
                  onClick={() => handleEdit(coffee)}
                  className="p-2 bg-blue-600 hover:bg-blue-700 rounded-full text-white transition"
                  title="Edit"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(coffee.id)}
                  className="p-2 bg-error-600 hover:bg-error-700 rounded-full text-white transition"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-espresso-900 border border-espresso-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-4">
              <h3 className="text-xl font-bold text-amber-500">
                {selectedCoffee ? 'Edit Coffee' : 'Add Coffee'}
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-espresso-300 mb-2">Coffee Name *</label>
                  <input
                    type="text"
                    value={formData.coffeeName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, coffeeName: e.target.value }))}
                    className="w-full px-4 py-2 bg-espresso-800 border border-espresso-700 rounded-lg text-espresso-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-espresso-300 mb-2">Country *</label>
                  <input
                    type="text"
                    value={formData.originCountry}
                    onChange={(e) => setFormData((prev) => ({ ...prev, originCountry: e.target.value }))}
                    className="w-full px-4 py-2 bg-espresso-800 border border-espresso-700 rounded-lg text-espresso-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-espresso-300 mb-2">Region</label>
                  <input
                    type="text"
                    value={formData.originRegion}
                    onChange={(e) => setFormData((prev) => ({ ...prev, originRegion: e.target.value }))}
                    className="w-full px-4 py-2 bg-espresso-800 border border-espresso-700 rounded-lg text-espresso-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-espresso-300 mb-2">Processing</label>
                  <input
                    type="text"
                    value={formData.processingMethod}
                    onChange={(e) => setFormData((prev) => ({ ...prev, processingMethod: e.target.value }))}
                    placeholder="Washed, Natural, etc."
                    className="w-full px-4 py-2 bg-espresso-800 border border-espresso-700 rounded-lg text-espresso-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-espresso-300 mb-2">Quantity (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.quantityKg}
                    onChange={(e) => setFormData((prev) => ({ ...prev, quantityKg: Number(e.target.value) }))}
                    className="w-full px-4 py-2 bg-espresso-800 border border-espresso-700 rounded-lg text-espresso-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-espresso-300 mb-2">Density (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    step="0.1"
                    value={formData.densityScore}
                    onChange={(e) => setFormData((prev) => ({ ...prev, densityScore: Number(e.target.value) }))}
                    className="w-full px-4 py-2 bg-espresso-800 border border-espresso-700 rounded-lg text-espresso-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-espresso-300 mb-2">Moisture (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    step="0.1"
                    value={formData.moisturePercent}
                    onChange={(e) => setFormData((prev) => ({ ...prev, moisturePercent: Number(e.target.value) }))}
                    className="w-full px-4 py-2 bg-espresso-800 border border-espresso-700 rounded-lg text-espresso-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-espresso-300 mb-2">Flavor Notes</label>
                  <textarea
                    value={formData.expectedFlavorNotes}
                    onChange={(e) => setFormData((prev) => ({ ...prev, expectedFlavorNotes: e.target.value }))}
                    rows={2}
                    className="w-full px-4 py-2 bg-espresso-800 border border-espresso-700 rounded-lg text-espresso-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-espresso-800 border border-espresso-700 text-espresso-300 rounded-lg hover:border-amber-500 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
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
