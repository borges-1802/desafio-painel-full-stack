const request = require('supertest')

jest.mock('../src/database/seeders/seed', () => jest.fn())

jest.mock('../src/database/index', () => {
  const Database = require('better-sqlite3')
  const db = new Database(':memory:')

  db.exec(`
    CREATE TABLE IF NOT EXISTS children (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      data_nascimento TEXT NOT NULL,
      bairro TEXT NOT NULL,
      saude TEXT,
      educacao TEXT,
      assistencia_social TEXT,
      revisado INTEGER DEFAULT 0,
      revisado_por TEXT,
      revisado_em TEXT
    )
  `)

  const insert = db.prepare(
    'INSERT INTO children (nome, data_nascimento, bairro, saude, educacao, assistencia_social, revisado) VALUES (?, ?, ?, ?, ?, ?, ?)'
  )

  insert.run('Ana Silva', '2015-03-10', 'Copacabana',
    JSON.stringify({ alertas: ['vacinas_atrasadas'] }),
    JSON.stringify({ alertas: [] }),
    JSON.stringify({ alertas: [] }),
    0
  )
  insert.run('João Santos', '2018-07-20', 'Tijuca',
    JSON.stringify({ alertas: [] }),
    JSON.stringify({ alertas: ['baixa_frequencia'] }),
    JSON.stringify({ alertas: [] }),
    1
  )
  insert.run('Maria Oliveira', '2020-11-05', 'Copacabana',
    null, null, null, 0
  )

  return db
})

const app = require('../src/app')

let token

beforeAll(async () => {
  const res = await request(app)
    .post('/auth/token')
    .send({ email: 'tecnico@prefeitura.rio', senha: 'painel@2024' })
  token = res.body.token
})

describe('GET /summary', () => {
  test('retorna 401 sem token', async () => {
    const res = await request(app).get('/summary')
    expect(res.status).toBe(401)
  })

  test('retorna estrutura completa', async () => {
    const res = await request(app)
      .get('/summary')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('total')
    expect(res.body).toHaveProperty('revisados')
    expect(res.body).toHaveProperty('com_alertas')
    expect(res.body).toHaveProperty('alertas_por_area')
    expect(res.body).toHaveProperty('detalhes_alertas')
    expect(res.body).toHaveProperty('por_bairro')
    expect(res.body).toHaveProperty('insights')
  })

  test('conta totais corretamente', async () => {
    const res = await request(app)
      .get('/summary')
      .set('Authorization', `Bearer ${token}`)

    expect(res.body.total).toBe(3)
    expect(res.body.revisados).toBe(1)
    expect(res.body.com_alertas).toBe(2)
  })

  test('conta alertas por área', async () => {
    const res = await request(app)
      .get('/summary')
      .set('Authorization', `Bearer ${token}`)

    expect(res.body.alertas_por_area.saude).toBe(1)
    expect(res.body.alertas_por_area.educacao).toBe(1)
    expect(res.body.alertas_por_area.assistencia_social).toBe(0)
  })

  test('por_bairro contém os bairros corretos', async () => {
    const res = await request(app)
      .get('/summary')
      .set('Authorization', `Bearer ${token}`)

    const bairros = res.body.por_bairro.map(b => b.bairro)
    expect(bairros).toContain('Copacabana')
    expect(bairros).toContain('Tijuca')
  })

  test('por_bairro está ordenado por comAlertas decrescente', async () => {
    const res = await request(app)
      .get('/summary')
      .set('Authorization', `Bearer ${token}`)

    const valores = res.body.por_bairro.map(b => b.comAlertas)
    for (let i = 0; i < valores.length - 1; i++) {
      expect(valores[i]).toBeGreaterThanOrEqual(valores[i + 1])
    }
  })

  test('insights é array não vazio com tipo e mensagem', async () => {
    const res = await request(app)
      .get('/summary')
      .set('Authorization', `Bearer ${token}`)

    expect(Array.isArray(res.body.insights)).toBe(true)
    expect(res.body.insights.length).toBeGreaterThan(0)
    expect(res.body.insights[0]).toHaveProperty('tipo')
    expect(res.body.insights[0]).toHaveProperty('mensagem')
  })

  test('insights estão ordenados por prioridade (critico → atencao → info)', async () => {
    const res = await request(app)
      .get('/summary')
      .set('Authorization', `Bearer ${token}`)

    const prioridade = { critico: 0, atencao: 1, info: 2 }
    const niveis = res.body.insights.map(i => prioridade[i.tipo])
    for (let i = 0; i < niveis.length - 1; i++) {
      expect(niveis[i]).toBeLessThanOrEqual(niveis[i + 1])
    }
  })
})