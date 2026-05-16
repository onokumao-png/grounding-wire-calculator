'use client'

import { GroundType } from '@/lib/calculator'

// 接地種別の定義
const TYPES: { value: GroundType; label: string; desc: string }[] = [
  { value: 'A', label: 'A種', desc: '高圧機器外箱 / 10Ω以下' },
  { value: 'B', label: 'B種', desc: '変圧器中性点' },
  { value: 'C', label: 'C種', desc: '300V超機器 / 10Ω以下' },
  { value: 'D', label: 'D種', desc: '300V以下機器 / 100Ω以下' },
]

interface TypeTabsProps {
  selected: GroundType
  onChange: (type: GroundType) => void
}

export function TypeTabs({ selected, onChange }: TypeTabsProps) {
  return (
    <div className="flex border-b border-gray-200 bg-white">
      {TYPES.map((t) => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={`flex-1 py-3 text-sm font-semibold transition-colors ${
            selected === t.value
              ? 'border-b-2 border-blue-700 text-blue-700'
              : 'text-gray-400 hover:text-gray-600'
          }`}
          title={t.desc}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
