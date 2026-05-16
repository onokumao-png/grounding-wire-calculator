// lib/calculator.ts
// 接地線太さ計算ロジック（電技解釈 第17条 / 内線規程 1350節 準拠）

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

// JIS規格品サイズ（mm²）昇順
const STANDARD_SIZES = [2.0, 3.5, 5.5, 8, 14, 22, 38, 60, 100]

/**
 * 計算値を規格品サイズに切り上げる。
 * 100mm²を超える場合は100mm²を返す（上限扱い）。
 */
export function roundUpToStandard(raw: number): number {
  return STANDARD_SIZES.find((s) => s >= raw) ?? 100
}

/**
 * 接地種別に応じた接地線最小太さを計算して返す。
 */
export function calculate(input: CalculatorInput): CalculatorResult {
  switch (input.type) {
    case 'A': return calcA(input)
    case 'B': return calcB(input)
    case 'C': return calcC(input)
    case 'D': return calcD(input)
  }
}

// ─────────────────────────────────────────────
// 根拠条文テキスト
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────
// A種接地工事
// 最低 5.5mm²、算式: 0.052 × 過電流遮断器定格電流
// ─────────────────────────────────────────────
function calcA(input: CalculatorInput): CalculatorResult {
  const current = input.breakerCurrent ?? 0
  const raw = 0.052 * current
  // 算出値を規格品に切り上げ、さらに最低5.5mm²を保証
  const minCrossSection = Math.max(roundUpToStandard(raw), 5.5)
  return {
    minCrossSection,
    rawCrossSection: raw,
    maxResistance: '10Ω以下',
    legalBasis: LEGAL_BASIS.A[input.standard ?? 'denki'],
  }
}

// ─────────────────────────────────────────────
// B種接地工事
// 最低 5.5mm²、算式: 0.052 × 変圧器二次定格電流
// 三相: I = kVA×1000 / (√3×V)、単相: I = kVA×1000 / V
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────
// C種接地工事
// 最低 2.0mm²、算式: 0.052 × 機器の定格電流
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────
// D種接地工事
// 最低 2.0mm²、算式: 0.052 × 機器の定格電流
// ─────────────────────────────────────────────
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
