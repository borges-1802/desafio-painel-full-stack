const db = require('../database/index')

function parseChild(row) {
  return {
    ...row,
    saude: row.saude ? JSON.parse(row.saude) : null,
    educacao: row.educacao ? JSON.parse(row.educacao) : null,
    assistencia_social: row.assistencia_social ? JSON.parse(row.assistencia_social) : null,
    revisado: row.revisado === 1,
  }
}

function hasAlert(c) {
  return (
    (Array.isArray(c.saude?.alertas) && c.saude.alertas.length > 0) ||
    (Array.isArray(c.educacao?.alertas) && c.educacao.alertas.length > 0) ||
    (Array.isArray(c.assistencia_social?.alertas) && c.assistencia_social.alertas.length > 0)
  )
}

function parseBoolean(value) {
  if (value === 'true') return true
  if (value === 'false') return false
  return undefined
}

function listChildren(req, res) {
  const { bairro, alertas, revisado, page = 1, limit = 25 } = req.query

  const pageNum = Number(page)
  const limitNum = Number(limit)
  const revisadoBool = parseBoolean(revisado)

  if (isNaN(pageNum) || pageNum < 1) {
    return res.status(400).json({ message: 'page inválido' })
  }

  if (isNaN(limitNum) || limitNum < 1) {
    return res.status(400).json({ message: 'limit inválido' })
  }

  let children = db.prepare('SELECT * FROM children').all().map(parseChild)

  if (bairro) {
    children = children.filter(c => c.bairro === bairro)
  }

  if (alertas === 'true') {
    children = children.filter(hasAlert)
  }

  if (revisado !== undefined) {
    children = children.filter(c => c.revisado === (revisado === 'true'))
  }

  const total = children.length
  const start = (pageNum - 1) * limitNum
  const data = children.slice(start, start + limitNum)

  return res.json({
    data,
    meta: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    }
  })
}

function getChild(req, res) {
  const { id } = req.params
  const row = db.prepare('SELECT * FROM children WHERE id = ?').get(id)

  if (!row) {
    return res.status(404).json({ error: 'Criança não encontrada' })
  }

  return res.json(parseChild(row))
}

function reviewChild(req, res) {
  const { id } = req.params
  const { preferred_username } = req.user

  if (!preferred_username) {
    return res.status(401).json({ error: 'Usuário inválido no token' })
  }

  const row = db.prepare('SELECT * FROM children WHERE id = ?').get(id)

  if (!row) {
    return res.status(404).json({ error: 'Criança não encontrada' })
  }

  if (row.revisado === 1) {
    return res.json(parseChild(row))
  }

  db.prepare(`
    UPDATE children
    SET revisado = 1,
        revisado_por = ?,
        revisado_em = ?
    WHERE id = ?
  `).run(preferred_username, new Date().toISOString(), id)

  const updated = db.prepare('SELECT * FROM children WHERE id = ?').get(id)

  return res.status(200).json({
    message: 'Caso revisado com sucesso',
    data: parseChild(updated)
  })
}

module.exports = { listChildren, getChild, reviewChild }