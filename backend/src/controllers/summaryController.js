const db = require('../database/index')

function parseRow(row) {
  return {
    saude: row.saude ? JSON.parse(row.saude) : null,
    educacao: row.educacao ? JSON.parse(row.educacao) : null,
    assistencia_social: row.assistencia_social ? JSON.parse(row.assistencia_social) : null,
    revisado: row.revisado === 1,
  }
}

function contarAlertas(children, area) {
  const contagem = {}
  for (const c of children) {
    const alertas = c[area]?.alertas || []
    for (const alerta of alertas) {
      contagem[alerta] = (contagem[alerta] || 0) + 1
    }
  }
  return Object.entries(contagem).map(([alerta, total]) => ({ alerta, total }))
}

function getSummary(req, res) {
  const rows = db.prepare('SELECT * FROM children').all()
  const total = rows.length

  let revisados = 0
  let com_alertas = 0
  let alertas_saude = 0
  let alertas_educacao = 0
  let alertas_assistencia = 0

  const parsed = rows.map(parseRow)

  for (const row of rows) {
    const c = parseRow(row)

    if (c.revisado) revisados++

    const hasSaude = Array.isArray(c.saude?.alertas) && c.saude.alertas.length > 0
    const hasEducacao = Array.isArray(c.educacao?.alertas) && c.educacao.alertas.length > 0
    const hasAssistencia = Array.isArray(c.assistencia_social?.alertas) && c.assistencia_social.alertas.length > 0

    if (hasSaude) alertas_saude++
    if (hasEducacao) alertas_educacao++
    if (hasAssistencia) alertas_assistencia++
    if (hasSaude || hasEducacao || hasAssistencia) com_alertas++
  }

  return res.json({
    total,
    revisados,
    com_alertas,
    alertas_por_area: {
      saude: alertas_saude,
      educacao: alertas_educacao,
      assistencia_social: alertas_assistencia,
    },
    detalhes_alertas: {
      saude: contarAlertas(parsed, 'saude'),
      educacao: contarAlertas(parsed, 'educacao'),
      assistencia_social: contarAlertas(parsed, 'assistencia_social'),
    }
  })
}

module.exports = { getSummary }