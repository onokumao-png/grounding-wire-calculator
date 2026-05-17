'use client'

import { useState } from 'react'
import { TypeTabs } from '@/components/TypeTabs'
import { StandardToggle } from '@/components/StandardToggle'
import { InputForm } from '@/components/InputForm'
import { ResultCard } from '@/components/ResultCard'
import {
  GroundType,
  Standard,
  CalculatorInput,
  CalculatorResult,
  calculate,
} from '@/lib/calculator'

export default function Home() {
  const [type, setType] = useState<GroundType>('B')
  const [standard, setStandard] = useState<Standard>('denki')
  const [input, setInput] = useState<CalculatorInput>({ type: 'B', phase: 'three' })
  const [result, setResult] = useState<CalculatorResult | null>(null)

  function handleTypeChange(newType: GroundType) {
    setType(newType)
    setInput({ type: newType, phase: 'three' })
    setResult(null)
  }

  function handleCalculate() {
    setResult(calculate({ ...input, standard }))
  }

  return (
    <main className="mx-auto max-w-md min-h-screen bg-white shadow-lg flex flex-col">
      <div className="bg-blue-700 px-4 py-4">
        <h1 className="text-lg font-bold text-white">⚡ 接地線太さ計算</h1>
        <p className="text-xs text-blue-200 mt-0.5">電技解釈 / 内線規程 対応</p>
      </div>

      <StandardToggle selected={standard} onChange={setStandard} />
      <TypeTabs selected={type} onChange={handleTypeChange} />

      <InputForm
        type={type}
        input={input}
        onChange={setInput}
        onCalculate={handleCalculate}
      />

      {result && <ResultCard result={result} />}
    </main>
  )
}
