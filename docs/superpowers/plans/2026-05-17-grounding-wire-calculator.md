# 接地線太さ計算アプリ 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A種〜D種接地の接地線最小太さをスマホで即計算できるNext.js Webアプリを作り、Vercelにデプロイする

**Architecture:** 1ページ完結型。計算ロジックは`lib/calculator.ts`に純粋関数として分離し、UIコンポーネントから切り離す。状態管理はReact useStateのみ（外部ライブラリ不使用）。

**Tech Stack:** Next.js 15 (App Router), TypeScript (strict), Tailwind CSS, Vitest

---

## ファイル構成

```
接地線/
├── app/
│   ├── page.tsx          # メインUI・状態管理
│   ├── layout.tsx        # レイアウト・メタデータ
│   └── globals.css       # グローバルスタイル（Tailwind）
├── components/
│   ├── TypeTabs.tsx      # A/B/C/D種タブ
│   ├── StandardToggle.tsx # 電技解釈/内線規程トグル
│   ├── InputForm.tsx     # 入力フォーム（種別で動的変化）
│   └── ResultCard.tsx    # 計算結果カード
├── lib/
│   └── calculator.ts     # 計算ロジック（純粋関数）
└── __tests__/
    └── calculator.test.ts
```

---

## Task 1: Next.jsプロジェクトセットアップ

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.ts`（create-next-appが生成）
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`

- [ ] **Step 1: Next.jsプロジェクトを作成する**

```bash
cd /Users/yoshiharu-ono/接地線
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*" \
  --yes
```

Expected: `Success! Created ...` が出てファイル群が生成される

- [ ] **Step 2: Vitestをインストールする**

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

Expected: `added XX packages` が出る

- [ ] **Step 3: vitest.config.tsを作成する**

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
})
```

- [ ] **Step 4: vitest.setup.tsを作成する**

```typescript
// vitest.setup.ts
import '@testing-library/jest-dom'
```

- [ ] **Step 5: package.jsonにtestスクリプトを追加する**

`package.json` の `"scripts"` に以下を追加：

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 6: 動作確認**

```bash
npm run dev
```

Expected: `http://localhost:3000` でNext.jsデフォルト画面が表示される。確認したら Ctrl+C で止める。

- [ ] **Step 7: コミット**

```bash
git add -A
git commit -m "feat: Next.jsプロジェクト初期セットアップ"
```

---

## Task 2: 計算ロジック（lib/calculator.ts）

**Files:**
- Create: `lib/calculator.ts`
- Create: `__tests__/calculator.test.ts`

- [ ] **Step 1: テストファイルを作成する**

```typescript
// __tests__/calculator.test.ts
import { describe, it, expect } from 'vitest'
import { roundUpToStandard, calculate } from '@/lib/calculator'

describe('roundUpToStandard', () => {
  it('2.0mm²以下は2.0を返す', () => {
    expect(roundUpToStandard(1.0)).toBe(2.0)
    expect(roundUpToStandard(2.0)).toBe(2.0)
  })
  it('2.0〜3.5の間は3.5を返す', () => {
    expect(roundUpToStandard(2.1)).toBe(3.5)
  })
  it('ぴったり5.5は5.5を返す', () => {
    expect(roundUpToStandard(5.5)).toBe(5.5)
  })
  it('100を超える場合は100を返す', () => {
    expect(roundUpToStandard(150)).toBe(100)
  })
})

describe('calculate - A種', () => {
  it('遮断器100Aの場合: 0.052×100=5.2 → 切り上げ5.5mm²', () => {
    const result = calculate({ type: 'A', breakerCurrent: 100 })
    expect(result.rawCrossSection).toBeCloseTo(5.2)
    expect(result.minCrossSection).toBe(5.5)
    expect(result.maxResistance).toBe('10Ω以下')
  })
  it('遮断器400Aの場合: 0.052×400=20.8 → 切り上げ22mm²', () => {
    const result = calculate({ type: 'A', breakerCurrent: 400 })
    expect(result.minCrossSection).toBe(22)
  })
  it('最低値は5.5mm²（遮断器が小さくても）', () => {
    const result = calculate({ type: 'A', breakerCurrent: 10 })
    expect(result.minCrossSection).toBe(5.5)
  })
})

describe('calculate - B種', () => {
  it('三相300kVA 200V: 二次電流=866A → 0.052×866=45.0 → 60mm²', () => {
    const result = calculate({
      type: 'B',
      transformerKva: 300,
      secondaryVoltage: 200,
      phase: 'three',
    })
    expect(result.rawCrossSection).toBeCloseTo(45.0, 0)
    expect(result.minCrossSection).toBe(60)
  })
  it('単相10kVA 200V: 二次電流=50A → 0.052×50=2.6 → 最低5.5mm²', () => {
    const result = calculate({
      type: 'B',
      transformerKva: 10,
      secondaryVoltage: 200,
      phase: 'single',
    })
    expect(result.minCrossSection).toBe(5.5)
  })
})

describe('calculate - C種', () => {
  it('定格電流30Aの場合: 0.052×30=1.56 → 最低2.0mm²', () => {
    const result = calculate({ type: 'C', ratedCurrent: 30 })
    expect(result.minCrossSection).toBe(2.0)
    expect(result.maxResistance).toBe('10Ω以下（ELB付き: 500Ω以下）')
  })
  it('定格電流200Aの場合: 0.052×200=10.4 → 切り上げ14mm²', () => {
    const result = calculate({ type: 'C', ratedCurrent: 200 })
    expect(result.minCrossSection).toBe(14)
  })
})

describe('calculate - D種', () => {
  it('定格電流20Aの場合: 0.052×20=1.04 → 最低2.0mm²', () => {
    const result = calculate({ type: 'D', ratedCurrent: 20 })
    expect(result.minCrossSection).toBe(2.0)
    expect(result.maxResistance).toBe('100Ω以下（ELB付き: 500Ω以下）')
  })
  it('定格電流500Aの場合: 0.052×500=26 → 切り上げ38mm²', () => {
    const result = calculate({ type: 'D', ratedCurrent: 500 })
    expect(result.minCrossSection).toBe(38)
  })
})
```

- [ ] **Step 2: テストが失敗することを確認する**

```bash
npm test
```

Expected: `FAIL __tests__/calculator.test.ts` — `Cannot find module '@/lib/calculator'`

- [ ] **Step 3: lib/calculator.tsを実装する**

```typescript
// lib/calculator.ts

export type GroundType = 'A' | 'B' | 'C' | 'D'
export type Phase = 'single' | 'three'
export type Standard = 'denki' | 'naisen'

export interface CalculatorInput {
  type: GroundType
  standard?: Standard       // 電技解釈(denki) / 内線規程(naisen)
  breakerCurrent?: number   // A種: 過電流遮断器の定格電流 (A)
  transformerKva?: number   // B種: 変圧器容量 (kVA)
  secondaryVoltage?: number // B種: 二次側電圧 (V)
  phase?: Phase             // B種: 単相/三相
  ratedCurrent?: number     // C/D種: 機器・電路の定格電流 (A)
}

export interface CalculatorResult {
  minCrossSection: number // mm²（規格品切り上げ後）
  rawCrossSection: number // mm²（計算値そのまま）
  maxResistance: string   // "10Ω以下" など
  legalBasis: string      // 根拠条文
  note?: string           // 補足（B種の二次電流など）
}

// 規格品サイズ（mm²）
const STANDARD_SIZES = [2.0, 3.5, 5.5, 8, 14, 22, 38, 60, 100]

export function roundUpToStandard(raw: number): number {
  return STANDARD_SIZES.find((s) => s >= raw) ?? 100
}

export function calculate(input: CalculatorInput): CalculatorResult {
  switch (input.type) {
    case 'A': return calcA(input)
    case 'B': return calcB(input)
    case 'C': return calcC(input)
    case 'D': return calcD(input)
  }
}

// 規格ごとの条文テキスト
const LEGAL_BASIS: Record<GroundType, Record<Standard, string>> = {
  A: {
    denki: '電技解釈 第17条第1項',
    naisen: '内線規程 1350-4表',
  },
  B: {
    denki: '電技解釈 第17条第2項・第24条',
    naisen: '内線規程 1350-5表 / 資料1-3-6',
  },
  C: {
    denki: '電技解釈 第17条第3項',
    naisen: '内線規程 1350-3表',
  },
  D: {
    denki: '電技解釈 第17条第4項',
    naisen: '内線規程 1350-3表',
  },
}

function calcA(input: CalculatorInput): CalculatorResult {
  const current = input.breakerCurrent ?? 0
  const raw = 0.052 * current
  const minCrossSection = Math.max(roundUpToStandard(raw), 5.5)
  return {
    minCrossSection,
    rawCrossSection: raw,
    maxResistance: '10Ω以下',
    legalBasis: LEGAL_BASIS.A[input.standard ?? 'denki'],
  }
}

function calcB(input: CalculatorInput): CalculatorResult {
  const kva = input.transformerKva ?? 0
  const v = input.secondaryVoltage ?? 200
  const secondaryCurrent =
    input.phase === 'three'
      ? (kva * 1000) / (Math.sqrt(3) * v)
      : (kva * 1000) / v
  const raw = 0.052 * secondaryCurrent
  const minCrossSection = Math.max(roundUpToStandard(raw), 5.5)
  return {
    minCrossSection,
    rawCrossSection: raw,
    maxResistance: '150/IG (Ω) 以下',
    legalBasis: LEGAL_BASIS.B[input.standard ?? 'denki'],
    note: `二次定格電流: ${secondaryCurrent.toFixed(1)} A`,
  }
}

function calcC(input: CalculatorInput): CalculatorResult {
  const current = input.ratedCurrent ?? 0
  const raw = 0.052 * current
  const minCrossSection = Math.max(roundUpToStandard(raw), 2.0)
  return {
    minCrossSection,
    rawCrossSection: raw,
    maxResistance: '10Ω以下（ELB付き: 500Ω以下）',
    legalBasis: LEGAL_BASIS.C[input.standard ?? 'denki'],
  }
}

function calcD(input: CalculatorInput): CalculatorResult {
  const current = input.ratedCurrent ?? 0
  const raw = 0.052 * current
  const minCrossSection = Math.max(roundUpToStandard(raw), 2.0)
  return {
    minCrossSection,
    rawCrossSection: raw,
    maxResistance: '100Ω以下（ELB付き: 500Ω以下）',
    legalBasis: LEGAL_BASIS.D[input.standard ?? 'denki'],
  }
}
```

- [ ] **Step 4: テストがパスすることを確認する**

```bash
npm test
```

Expected: `✓ __tests__/calculator.test.ts (12 tests)` — 全テストグリーン

- [ ] **Step 5: コミット**

```bash
git add lib/calculator.ts __tests__/calculator.test.ts
git commit -m "feat: 接地線太さ計算ロジック実装（TDD）"
```

---

## Task 3: TypeTabsコンポーネント

**Files:**
- Create: `components/TypeTabs.tsx`

- [ ] **Step 1: TypeTabs.tsxを作成する**

```tsx
// components/TypeTabs.tsx
import { GroundType } from '@/lib/calculator'

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
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: コミット**

```bash
git add components/TypeTabs.tsx
git commit -m "feat: TypeTabsコンポーネント追加"
```

---

## Task 4: StandardToggleコンポーネント

**Files:**
- Create: `components/StandardToggle.tsx`

- [ ] **Step 1: StandardToggle.tsxを作成する**

```tsx
// components/StandardToggle.tsx
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
```

- [ ] **Step 2: コミット**

```bash
git add components/StandardToggle.tsx
git commit -m "feat: StandardToggleコンポーネント追加"
```

---

## Task 5: InputFormコンポーネント

**Files:**
- Create: `components/InputForm.tsx`

- [ ] **Step 1: InputForm.tsxを作成する**

```tsx
// components/InputForm.tsx
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
```

- [ ] **Step 2: コミット**

```bash
git add components/InputForm.tsx
git commit -m "feat: InputFormコンポーネント追加"
```

---

## Task 6: ResultCardコンポーネント

**Files:**
- Create: `components/ResultCard.tsx`

- [ ] **Step 1: ResultCard.tsxを作成する**

```tsx
// components/ResultCard.tsx
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
```

- [ ] **Step 2: コミット**

```bash
git add components/ResultCard.tsx
git commit -m "feat: ResultCardコンポーネント追加"
```

---

## Task 7: メインページ組み立て

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: globals.cssをTailwindのみにする**

```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 2: layout.tsxを更新する**

```tsx
// app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '接地線太さ計算',
  description: 'A種・B種・C種・D種接地の接地線最小太さを現場で即計算',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-gray-100 min-h-screen">{children}</body>
    </html>
  )
}
```

- [ ] **Step 3: page.tsxをメインUIに書き換える**

```tsx
// app/page.tsx
'use client'

import { useState } from 'react'
import { TypeTabs } from '@/components/TypeTabs'
import { StandardToggle } from '@/components/StandardToggle'
import { GroundType, CalculatorInput, CalculatorResult, Standard, calculate } from '@/lib/calculator'

import { InputForm } from '@/components/InputForm'
import { ResultCard } from '@/components/ResultCard'
import { GroundType, CalculatorInput, CalculatorResult, calculate } from '@/lib/calculator'

export default function Home() {
  const [type, setType] = useState<GroundType>('A')
  const [standard, setStandard] = useState<Standard>('denki')
  const [input, setInput] = useState<CalculatorInput>({ type: 'A', phase: 'three' })
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
      {/* ヘッダー */}
      <div className="bg-blue-700 px-4 py-4">
        <h1 className="text-lg font-bold text-white">⚡ 接地線太さ計算</h1>
        <p className="text-xs text-blue-200 mt-0.5">電技解釈 / 内線規程 対応</p>
      </div>

      {/* 規格切り替え */}
      <StandardToggle selected={standard} onChange={setStandard} />

      {/* 種別タブ */}
      <TypeTabs selected={type} onChange={handleTypeChange} />

      {/* 入力フォーム */}
      <InputForm
        type={type}
        input={input}
        onChange={setInput}
        onCalculate={handleCalculate}
      />

      {/* 計算結果 */}
      {result && <ResultCard result={result} />}
    </main>
  )
}
```

- [ ] **Step 4: 開発サーバーで動作確認する**

```bash
npm run dev
```

ブラウザで `http://localhost:3000` を開いて以下を確認：
- A種タブで遮断器電流100Aを入力 → 計算ボタン → 「5.5 mm² 以上」が表示される
- B種タブで300kVA / 200V / 三相 → 計算 → 「60 mm² 以上」が表示される
- C種タブで30A → 計算 → 「2.0 mm² 以上」が表示される
- D種タブで20A → 計算 → 「2.0 mm² 以上」が表示される

- [ ] **Step 5: コミット**

```bash
git add app/page.tsx app/layout.tsx app/globals.css
git commit -m "feat: メインページ組み立て完了"
```

---

## Task 8: Vercelデプロイ

**Files:**
- Create: `.gitignore`（Next.jsが生成済みのはず）

- [ ] **Step 1: テストを全部通す**

```bash
npm test
```

Expected: 全テストグリーン

- [ ] **Step 2: ビルドが通ることを確認する**

```bash
npm run build
```

Expected: `Route (app) / ... ✓ Compiled` — エラーなし

- [ ] **Step 3: Vercel CLIでデプロイする（プレビュー）**

```bash
npx vercel
```

対話形式で聞かれたら：
- Set up and deploy? → Y
- Which scope? → よしはるさんのアカウントを選択
- Link to existing project? → N
- Project name? → `chisetsu-calculator`（または任意）
- In which directory? → `.`（そのままEnter）

Expected: `✅ Preview: https://chisetsu-calculator-xxx.vercel.app` のURLが出る

- [ ] **Step 4: プレビューURLをスマホで確認する**

URLをスマホで開いて実際に操作してみる。問題がなければ次へ。

- [ ] **Step 5: 本番デプロイ**

```bash
npx vercel --prod
```

Expected: `✅ Production: https://chisetsu-calculator.vercel.app` のURLが出る

- [ ] **Step 6: 最終コミット**

```bash
git add -A
git commit -m "chore: Vercelデプロイ設定"
```
