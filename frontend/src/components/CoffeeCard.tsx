import React from 'react'
import { MapPin, Package, Calendar, TrendingUp } from 'lucide-react'
import { GreenCoffee } from '../types'
import { format } from 'date-fns'

interface CoffeeCardProps {
  coffee: GreenCoffee
  onClick?: () => void
}

export const CoffeeCard: React.FC<CoffeeCardProps> = ({ coffee, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-espresso-900 border border-espresso-800 rounded-lg p-4 transition-all ${
        onClick ? 'cursor-pointer hover:border-amber-500 hover:shadow-md-coffee' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-amber-500 font-semibold">{coffee.coffeeName}</h3>
          <p className="text-espresso-400 text-sm">{coffee.processingMethod}</p>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-espresso-300">
          <MapPin size={14} className="text-amber-500 flex-shrink-0" />
          <span>
            {coffee.originCountry}
            {coffee.originRegion && `, ${coffee.originRegion}`}
          </span>
        </div>

        <div className="flex items-center gap-2 text-espresso-300">
          <Package size={14} className="text-amber-500 flex-shrink-0" />
          <span>{coffee.quantityKg.toFixed(1)} kg ({coffee.quantityBags} bags)</span>
        </div>

        <div className="flex items-center gap-2 text-espresso-300">
          <Calendar size={14} className="text-amber-500 flex-shrink-0" />
          <span>Received {format(new Date(coffee.receivedDate), 'MMM dd')}</span>
        </div>

        {coffee.expectedFlavorNotes && (
          <div className="flex items-start gap-2 text-espresso-300">
            <TrendingUp size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <span className="line-clamp-1">{coffee.expectedFlavorNotes}</span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-espresso-800 flex items-center justify-between">
        <div className="text-xs">
          <p className="text-espresso-500">Density</p>
          <p className="text-amber-500 font-semibold">{coffee.densityScore}/10</p>
        </div>
        <div className="text-xs">
          <p className="text-espresso-500">Moisture</p>
          <p className="text-amber-500 font-semibold">{coffee.moisturePercent.toFixed(1)}%</p>
        </div>
        <div className="text-xs">
          <p className="text-espresso-500">Altitude</p>
          <p className="text-amber-500 font-semibold">{coffee.altitudeMeters}m</p>
        </div>
      </div>
    </div>
  )
}
