const db = require('../database/index')

function parseRow(row) {
  return {
    saude: row.saude ? JSON.parse(row.saude) : null,
    educacao: row.educacao ? JSON.parse(row.educacao) : null,
    assistencia_social: row.assistencia_social ? JSON.parse(row.assistencia_social) : null,
    revisado: row.revisado === 1,
  }
}

function getSummary(req, res) {
  const rows = db.prepare('SELECT * FROM children').all()
  const total = rows.length

  let revisados = 0
  let com_alertas = 0
  let alertas_saude = 0
  let alertas_educacao = 0
  let alertas_assistencia = 0

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
    }
  })
}

module.exports = { getSummary }