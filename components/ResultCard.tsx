'use client'

import { CalculatorResult } from '@/lib/calculator'

interface ResultCardProps {
  result: CalculatorResult
}

export function ResultCard({ result }: ResultCardProps) {
  return (
    <div className="bg-green-50 border-t-2 border-green-300 p-4 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-green-700">計算結果</p>

      <div className="rounded-xl border border-green-200 bg-white p-4 text-center">
        <p className="text-xs text-gray-400 mb-1">最小接地線太さ</p>
        <p className="text-4xl font-bold text-green-600">{result.minCrossSection}</p>
        <p className="text-sm text-gray-500 mt-1">mm² 以上</p>
        <p className="text-xs text-gray-400 mt-1">
          （計算値: {result.rawCrossSection.toFixed(2)} mm²）
        </p>
      </div>

      <div className="rounded-xl border border-green-200 bg-white px-4 py-3">
        <p className="text-xs text-gray-400 mb-1">接地抵抗値</p>
        <p className="text-lg font-bold text-gray-800">{result.maxResistance}</p>
      </div>

      <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
        <p className="text-xs font-semibold text-blue-700 mb-1">📖 根拠条文</p>
        <p className="text-sm text-blue-800 leading-relaxed">{result.legalBasis}</p>
        {result.note && (
          <p className="text-xs text-blue-600 mt-1">{result.note}</p>
        )}
      </div>
    </div>
  )
}
