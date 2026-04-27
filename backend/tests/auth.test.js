const request = require('supertest')

jest.mock('../src/database/seeders/seed', () => jest.fn())

const app = require('../src/app')

describe('POST /auth/token', () => {
  test('retorna token com credenciais corretas', async () => {
    const res = await request(app)
      .post('/auth/token')
      .send({ email: 'tecnico@prefeitura.rio', senha: 'painel@2024' })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('token')
    expect(typeof res.body.token).toBe('string')
  })

  test('retorna 401 com senha incorreta', async () => {
    const res = await request(app)
      .post('/auth/token')
      .send({ email: 'tecnico@prefeitura.rio', senha: 'errada' })

    expect(res.status).toBe(401)
    expect(res.body).toHaveProperty('error')
  })

  test('retorna 401 com email incorreto', async () => {
    const res = await request(app)
      .post('/auth/token')
      .send({ email: 'outro@prefeitura.rio', senha: 'painel@2024' })

    expect(res.status).toBe(401)
  })

  test('retorna 401 com body vazio', async () => {
    const res = await request(app)
      .post('/auth/token')
      .send({})

    expect(res.status).toBe(401)
  })
})