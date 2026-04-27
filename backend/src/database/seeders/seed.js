const db = require('../index')
const fs = require('fs')
const path = require('path')

function runSeed() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS children (
      id TEXT PRIMARY KEY,
      nome TEXT NOT NULL,
      data_nascimento TEXT,
      bairro TEXT,
      responsavel TEXT,
      saude TEXT,
      educacao TEXT,
      assistencia_social TEXT,
      revisado INTEGER DEFAULT 0,
      revisado_por TEXT,
      revisado_em TEXT
    )
  `)

  const seedPath = path.resolve(__dirname, '../../../data/seed.json')
  const children = JSON.parse(fs.readFileSync(seedPath, 'utf-8'))

  const insert = db.prepare(`
    INSERT OR IGNORE INTO children (
      id, nome, data_nascimento, bairro, responsavel,
      saude, educacao, assistencia_social,
      revisado, revisado_por, revisado_em
    ) VALUES (
      @id, @nome, @data_nascimento, @bairro, @responsavel,
      @saude, @educacao, @assistencia_social,
      @revisado, @revisado_por, @revisado_em
    )
  `)

  for (const child of children) {
    insert.run({
      ...child,
      saude: child.saude ? JSON.stringify(child.saude) : null,
      educacao: child.educacao ? JSON.stringify(child.educacao) : null,
      assistencia_social: child.assistencia_social ? JSON.stringify(child.assistencia_social) : null,
      revisado: child.revisado ? 1 : 0,
    })
  }
}

module.exports = runSeed