import React, { useState } from 'react'
import { FlavorCategory } from '../types'

interface FlavorWheelProps {
  selected?: FlavorCategory[]
  onChange?: (selected: FlavorCategory[]) => void
  readonly?: boolean
}

const flavorCategories: { category: FlavorCategory; color: string; icon: string }[] = [
  { category: 'fruity', color: 'from-pink-500 to-rose-500', icon: '🍇' },
  { category: 'floral', color: 'from-purple-500 to-indigo-500', icon: '🌸' },
  { category: 'herbal', color: 'from-green-500 to-emerald-500', icon: '🌿' },
  { category: 'spicy', color: 'from-orange-500 to-red-500', icon: '🌶️' },
  { category: 'nutty', color: 'from-amber-600 to-yellow-500', icon: '🥜' },
  { category: 'chocolate', color: 'from-amber-700 to-amber-900', icon: '🍫' },
  { category: 'sweet', color: 'from-pink-400 to-amber-300', icon: '🍯' },
  { category: 'sour', color: 'from-yellow-500 to-green-500', icon: '🍋' },
  { category: 'roasted', color: 'from-gray-600 to-gray-800', icon: '🔥' },
  { category: 'earthy', color: 'from-amber-800 to-gray-700', icon: '🪨' },
]

export const FlavorWheel: React.FC<FlavorWheelProps> = ({
  selected = [],
  onChange,
  readonly = false,
}) => {
  const [hoveredCategory, setHoveredCategory] = useState<FlavorCategory | null>(null)

  const handleToggle = (category: FlavorCategory) => {
    if (readonly || !onChange) return

    const newSelected = selected.includes(category)
      ? selected.filter((c) => c !== category)
      : [...selected, category]

    onChange(newSelected)
  }

  return (
    <div className="bg-espresso-900 border border-espresso-800 rounded-lg p-8">
      <h3 className="text-center text-amber-500 font-semibold mb-6">Flavor Wheel</h3>

      {/* Circular flavor wheel */}
      <div className="flex items-center justify-center mb-8">
        <div className="relative w-64 h-64">
          {flavorCategories.map((item, index) => {
            const angle = (index / flavorCategories.length) * Math.PI * 2 - Math.PI / 2
            const x = Math.cos(angle) * 100
            const y = Math.sin(angle) * 100
            const isSelected = selected.includes(item.category)
            const isHovered = hoveredCategory === item.category

            return (
              <button
                key={item.category}
                onClick={() => handleToggle(item.category)}
                onMouseEnter={() => setHoveredCategory(item.category)}
                onMouseLeave={() => setHoveredCategory(null)}
                disabled={readonly}
                className={`absolute w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all duration-200 ${
                  isSelected ? 'ring-2 ring-amber-400' : ''
                } ${isHovered && !readonly ? 'scale-110 ring-2 ring-amber-300' : ''} ${
                  readonly ? 'cursor-default' : 'cursor-pointer'
                } bg-gradient-to-br ${item.color} hover:shadow-lg`}
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  transform: 'translate(-50%, -50%)',
                }}
                title={item.category}
              >
                {item.icon}
              </button>
            )
          })}

          {/* Center circle */}
          <div className="absolute left-1/2 top-1/2 w-12 h-12 -translate-x-1/2 -translate-y-1/2 bg-espresso-800 border-2 border-amber-500 rounded-full flex items-center justify-center">
            <span className="text-2xl">☕</span>
          </div>
        </div>
      </div>

      {/* Legend and selected flavors */}
      <div className="flex flex-wrap gap-2 justify-center">
        {selected.length > 0 && (
          <div className="w-full">
            <p className="text-espresso-400 text-xs text-center mb-2">Selected Flavors:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {selected.map((flavor) => {
                const item = flavorCategories.find((f) => f.category === flavor)
                if (!item) return null
                return (
                  <div
                    key={flavor}
                    className={`px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${item.color} text-white`}
                  >
                    {item.icon} {flavor}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
