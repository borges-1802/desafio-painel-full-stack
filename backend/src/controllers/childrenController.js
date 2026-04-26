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

function calcularIdade(dataNascimento) {
  const hoje = new Date()
  const nascimento = new Date(dataNascimento)
  let idade = hoje.getFullYear() - nascimento.getFullYear()
  const m = hoje.getMonth() - nascimento.getMonth()
  if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) idade--
  return idade
}

function listChildren(req, res) {
  const { bairro, alertas, revisado, nome, area, faixaEtaria, tipoAlerta, orderBy, orderDir, page = 1, limit = 25 } = req.query

  const pageNum = Number(page)
  const limitNum = Number(limit)
  const revisadoBool = parseBoolean(revisado)
  const alertasBool = parseBoolean(alertas)

  if (isNaN(pageNum) || pageNum < 1) {
    return res.status(400).json({ message: 'page inválido' })
  }

  if (isNaN(limitNum) || limitNum < 1) {
    return res.status(400).json({ message: 'limit inválido' })
  }

  let children = db.prepare('SELECT * FROM children').all().map(parseChild)

  if (nome) {
    const nomeNorm = nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    children = children.filter(c =>
      c.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(nomeNorm)
    )
  }

  if (bairro) {
    children = children.filter(c => c.bairro === bairro)
  }

  if (alertasBool === true) {
    children = children.filter(hasAlert)
  }

  if (alertasBool === false) {
    children = children.filter(c => !hasAlert(c))
  }

  if (area && area !== 'todos') {
    const areaMap = {
      saude: 'saude',
      educacao: 'educacao',
      assistencia: 'assistencia_social',
    }
    const areaKey = areaMap[area]
    if (areaKey) {
      children = children.filter(c =>
        Array.isArray(c[areaKey]?.alertas) && c[areaKey].alertas.length > 0
      )
    }
  }
  
  if (faixaEtaria && faixaEtaria !== 'todos') {
  children = children.filter(c => {
    const idade = calcularIdade(c.data_nascimento)
    if (faixaEtaria === '0-5') return idade <= 5
    if (faixaEtaria === '6-12') return idade >= 6 && idade <= 12
    if (faixaEtaria === '13-17') return idade >= 13
    return true
  })
  }

  if (tipoAlerta && tipoAlerta !== 'todos') {
    children = children.filter(c => {
      const alertas = [
        ...(c.saude?.alertas || []),
        ...(c.educacao?.alertas || []),
        ...(c.assistencia_social?.alertas || []),
      ]
      return alertas.includes(tipoAlerta)
    })
  }

  if (revisadoBool !== undefined) {
    children = children.filter(c => c.revisado === revisadoBool)
  }

  const total = children.length
  const start = (pageNum - 1) * limitNum
  if (orderBy === 'nome') {
  children = children.sort((a, b) =>
    orderDir === 'desc'
      ? b.nome.localeCompare(a.nome, 'pt-BR')
      : a.nome.localeCompare(b.nome, 'pt-BR')
  )
}
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