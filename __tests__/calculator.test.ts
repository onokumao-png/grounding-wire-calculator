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
