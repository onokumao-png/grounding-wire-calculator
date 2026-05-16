'use client'

import { Standard } from '@/lib/calculator'

interface StandardToggleProps {
  selected: Standard
  onChange: (s: Standard) => void
}

export function StandardToggle({ selected, onChange }: StandardToggleProps) {
  return (
    <div className="flex gap-2 bg-gray-100 p-2">
      {(['denki', 'naisen'] as Standard[]).map((s) => (
        <button
          key={s}
          onClick={() => onChange(s)}
          className={`flex-1 rounded-md py-2 text-xs font-bold transition-all ${
            selected === s
              ? 'bg-white text-blue-700 shadow-sm border border-blue-200'
              : 'text-gray-400'
          }`}
        >
          {s === 'denki' ? '電技解釈' : '内線規程'}
        </button>
      ))}
    </div>
  )
}
