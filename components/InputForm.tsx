'use client'

import { GroundType, CalculatorInput, Phase } from '@/lib/calculator'

interface InputFormProps {
  type: GroundType
  input: CalculatorInput
  onChange: (input: CalculatorInput) => void
  onCalculate: () => void
}

export function InputForm({ type, input, onChange, onCalculate }: InputFormProps) {
  return (
    <div className="p-4 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">入力値</p>

      {type === 'A' && (
        <label className="block">
          <span className="text-sm text-gray-700">過電流遮断器の定格電流 (A)</span>
          <input
            type="number"
            inputMode="decimal"
            placeholder="例: 100"
            value={input.breakerCurrent ?? ''}
            onChange={(e) =>
              onChange({ ...input, type, breakerCurrent: Number(e.target.value) })
            }
            className="mt-1 w-full rounded-lg border border-blue-300 p-3 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>
      )}

      {type === 'B' && (
        <>
          <label className="block">
            <span className="text-sm text-gray-700">変圧器容量 (kVA)</span>
            <input
              type="number"
              inputMode="decimal"
              placeholder="例: 300"
              value={input.transformerKva ?? ''}
              onChange={(e) =>
                onChange({ ...input, type, transformerKva: Number(e.target.value) })
              }
              className="mt-1 w-full rounded-lg border border-blue-300 p-3 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
          <label className="block">
            <span className="text-sm text-gray-700">二次側電圧 (V)</span>
            <input
              type="number"
              inputMode="decimal"
              placeholder="例: 200"
              value={input.secondaryVoltage ?? ''}
              onChange={(e) =>
                onChange({ ...input, type, secondaryVoltage: Number(e.target.value) })
              }
              className="mt-1 w-full rounded-lg border border-blue-300 p-3 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
          <div>
            <span className="text-sm text-gray-700">相数</span>
            <div className="mt-1 flex gap-2">
              {(['three', 'single'] as Phase[]).map((p) => (
                <button
                  key={p}
                  onClick={() => onChange({ ...input, type, phase: p })}
                  className={`flex-1 rounded-lg border py-2 text-sm font-bold transition-colors ${
                    (input.phase ?? 'three') === p
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-400'
                  }`}
                >
                  {p === 'three' ? '三相' : '単相'}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {(type === 'C' || type === 'D') && (
        <label className="block">
          <span className="text-sm text-gray-700">機器・電路の定格電流 (A)</span>
          <input
            type="number"
            inputMode="decimal"
            placeholder="例: 30"
            value={input.ratedCurrent ?? ''}
            onChange={(e) =>
              onChange({ ...input, type, ratedCurrent: Number(e.target.value) })
            }
            className="mt-1 w-full rounded-lg border border-blue-300 p-3 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>
      )}

      <button
        onClick={onCalculate}
        className="w-full rounded-xl bg-blue-700 py-3 text-base font-bold text-white active:bg-blue-800"
      >
        計　算
      </button>
    </div>
  )
}
