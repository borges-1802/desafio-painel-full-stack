const { calcularIdade } = require('../src/utils')

describe('calcularIdade', () => {
  beforeAll(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-04-27'))
  })

  afterAll(() => jest.useRealTimers())

  test('retorna idade correta quando aniversário já passou no ano', () => {
    expect(calcularIdade('2010-01-15')).toBe(16)
  })

  test('não incrementa quando aniversário ainda não chegou', () => {
    expect(calcularIdade('2010-12-31')).toBe(15)
  })

  test('conta corretamente no dia do aniversário', () => {
    expect(calcularIdade('2010-04-27')).toBe(16)
  })

  test('retorna 0 para bebê nascido no mesmo ano', () => {
    expect(calcularIdade('2026-01-01')).toBe(0)
  })
})