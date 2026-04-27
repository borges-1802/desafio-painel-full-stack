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
    JSON.stringify({ alertas: ['vacinas_atrasadas'], ultima_consulta: '2024-01-01' }),
    JSON.stringify({ alertas: [], frequencia: 95 }),
    JSON.stringify({ alertas: [] }),
    0
  )
  insert.run('João Santos', '2018-07-20', 'Tijuca',
    JSON.stringify({ alertas: [] }),
    JSON.stringify({ alertas: ['baixa_frequencia'], frequencia: 60 }),
    JSON.stringify({ alertas: [] }),
    1
  )
  insert.run('Maria Oliveira', '2020-11-05', 'Copacabana',
    JSON.stringify({ alertas: [] }),
    null,
    null,
    0
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

describe('GET /children', () => {
  test('retorna 401 sem token', async () => {
    const res = await request(app).get('/children')
    expect(res.status).toBe(401)
  })

  test('retorna lista paginada com token válido', async () => {
    const res = await request(app)
      .get('/children')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.meta).toMatchObject({ total: 3, page: 1, totalPages: 1 })
  })

  test('filtra por bairro', async () => {
    const res = await request(app)
      .get('/children?bairro=Copacabana')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.meta.total).toBe(2)
    expect(res.body.data.every(c => c.bairro === 'Copacabana')).toBe(true)
  })

  test('filtra por alertas=true', async () => {
    const res = await request(app)
      .get('/children?alertas=true')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.meta.total).toBe(2)
  })

  test('filtra por revisado=true', async () => {
    const res = await request(app)
      .get('/children?revisado=true')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.meta.total).toBe(1)
    expect(res.body.data[0].nome).toBe('João Santos')
  })

  test('busca por nome parcial sem acento', async () => {
    const res = await request(app)
      .get('/children?nome=ana')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.meta.total).toBe(1)
    expect(res.body.data[0].nome).toBe('Ana Silva')
  })

  test('retorna 400 com page inválido', async () => {
    const res = await request(app)
      .get('/children?page=abc')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty('message', 'page inválido')
  })

  test('retorna 400 com limit zero', async () => {
    const res = await request(app)
      .get('/children?limit=0')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty('message', 'limit inválido')
  })
})

describe('GET /children/:id', () => {
  test('retorna criança pelo id', async () => {
    const res = await request(app)
      .get('/children/1')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.nome).toBe('Ana Silva')
    expect(res.body.revisado).toBe(false)
  })

  test('retorna 404 para id inexistente', async () => {
    const res = await request(app)
      .get('/children/999')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(404)
    expect(res.body).toHaveProperty('error', 'Criança não encontrada')
  })

  test('retorna 401 sem token', async () => {
    const res = await request(app).get('/children/1')
    expect(res.status).toBe(401)
  })
})

describe('PATCH /children/:id/review', () => {
  test('retorna 401 sem token', async () => {
    const res = await request(app).patch('/children/3/review')
    expect(res.status).toBe(401)
  })

  test('retorna 404 para id inexistente', async () => {
    const res = await request(app)
      .patch('/children/999/review')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(404)
    expect(res.body).toHaveProperty('error', 'Criança não encontrada')
  })

  test('retorna dados sem alterar se já revisado', async () => {
    const res = await request(app)
      .patch('/children/2/review')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.revisado).toBe(true)
  })

  test('marca criança como revisada e retorna mensagem', async () => {
    const res = await request(app)
      .patch('/children/3/review')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('message', 'Caso revisado com sucesso')
    expect(res.body.data.revisado).toBe(true)
    expect(res.body.data.revisado_por).toBe('tecnico@prefeitura.rio')
  })
})