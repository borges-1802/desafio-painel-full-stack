const db = require('../index')

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

  console.log('Tabela criada!')
}

module.exports = runSeed