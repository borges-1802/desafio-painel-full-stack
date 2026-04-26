import { calcularIdade } from '../utils'

const db = require('../database/index')

function parseRow(row) {
  return {
    saude: row.saude ? JSON.parse(row.saude) : null,
    educacao: row.educacao ? JSON.parse(row.educacao) : null,
    assistencia_social: row.assistencia_social ? JSON.parse(row.assistencia_social) : null,
    revisado: row.revisado === 1,
  }
}

function mapObj(obj) {
  return Object.entries(obj).map(([alerta, total]) => ({ alerta, total }))
}

function separarAlertasPorArea(parsed) {
  const result = {
    saude: {},
    educacao: {},
    assistencia_social: {}
  }

  for (const c of parsed) {
    for (const a of c.saude?.alertas || []) {
      result.saude[a] = (result.saude[a] || 0) + 1
    }
    for (const a of c.educacao?.alertas || []) {
      result.educacao[a] = (result.educacao[a] || 0) + 1
    }
    for (const a of c.assistencia_social?.alertas || []) {
      result.assistencia_social[a] = (result.assistencia_social[a] || 0) + 1
    }
  }

  return {
    saude: mapObj(result.saude),
    educacao: mapObj(result.educacao),
    assistencia_social: mapObj(result.assistencia_social),
  }
}

function gerarInsights(rows, parsed, contagemAlertas, bairros) {
  const insights = []

  let multiplos = 0
  let semDados = 0
  let naoRevisados = 0

  const faixas = { '0-5': 0, '6-12': 0, '13-17': 0 }
  const faixasAlerta = { '0-5': 0, '6-12': 0, '13-17': 0 }

  for (let i = 0; i < rows.length; i++) {
    const c = parsed[i]

    if (!c.revisado) naoRevisados++

    const areas =
      (c.saude?.alertas?.length ? 1 : 0) +
      (c.educacao?.alertas?.length ? 1 : 0) +
      (c.assistencia_social?.alertas?.length ? 1 : 0)

    if (areas >= 2) multiplos++

    if (!c.saude && !c.educacao && !c.assistencia_social) semDados++

    const idade = calcularIdade(rows[i].data_nascimento)
    const faixa = idade <= 5 ? '0-5' : idade <= 12 ? '6-12' : '13-17'

    faixas[faixa]++
    if (areas > 0) faixasAlerta[faixa]++
  }

  if (multiplos > 0) {
    insights.push({
      tipo: 'critico',
      mensagem: `${multiplos} criança${multiplos > 1 ? 's têm' : ' tem'} alertas em múltiplas áreas`
    })
  }

  const faixaCritica = Object.entries(faixasAlerta).sort((a, b) => b[1] - a[1])[0]

  if (faixaCritica) {
    const [faixa, total] = faixaCritica
    const base = faixas[faixa] || 1
    const pct = Math.round((total / base) * 100)

    if (total > 0) {
      insights.push({
        tipo: 'atencao',
        mensagem: `${pct}% das crianças de ${faixa} anos têm alertas ativos`
      })
    }
  }

  if (semDados > 0) {
    insights.push({
      tipo: 'atencao',
      mensagem: `${semDados} criança${semDados > 1 ? 's' : ''} sem dados em nenhuma área`
    })
  }

  const maisComum = Object.entries(contagemAlertas).sort((a, b) => b[1] - a[1])[0]

  if (maisComum) {
    insights.push({
      tipo: 'info',
      mensagem: `Alerta mais frequente: "${maisComum[0].replace(/_/g, ' ')}" (${maisComum[1]} casos)`
    })
  }

  const entries = Object.entries(bairros)

  const topSaude = [...entries].sort((a, b) => b[1].porArea.saude - a[1].porArea.saude)[0]
  if (topSaude && topSaude[1].porArea.saude > 0) {
    insights.push({
      tipo: 'critico',
      mensagem: `Maior concentração de alertas de saúde em ${topSaude[0]}`
    })
  }

  const topEducacao = [...entries].sort((a, b) => b[1].porArea.educacao - a[1].porArea.educacao)[0]
  if (topEducacao && topEducacao[1].porArea.educacao > 0) {
    insights.push({
      tipo: 'atencao',
      mensagem: `Educação é mais crítica em ${topEducacao[0]}`
    })
  }

  const total = rows.length || 1
  const pctNaoRevisado = Math.round((naoRevisados / total) * 100)

  insights.push({
    tipo: pctNaoRevisado > 70 ? 'critico' : 'info',
    mensagem: `${pctNaoRevisado}% dos casos ainda não foram revisados (${naoRevisados} pendentes)`
  })

  const prioridade = { critico: 0, atencao: 1, info: 2 }

  return insights.sort((a, b) => prioridade[a.tipo] - prioridade[b.tipo])
}

function getSummary(req, res) {
  const rows = db.prepare('SELECT * FROM children').all()

  let revisados = 0
  let com_alertas = 0

  const alertas_por_area = {
    saude: 0,
    educacao: 0,
    assistencia_social: 0,
  }

  const bairros = {}
  const contagemAlertas = {}
  const parsed = []

  for (const row of rows) {
    const c = parseRow(row)
    parsed.push(c)

    if (c.revisado) revisados++

    const alertas = [
      ...(c.saude?.alertas || []),
      ...(c.educacao?.alertas || []),
      ...(c.assistencia_social?.alertas || [])
    ]

    const temAlerta = alertas.length > 0

    if (temAlerta) com_alertas++
    if (c.saude?.alertas?.length) alertas_por_area.saude++
    if (c.educacao?.alertas?.length) alertas_por_area.educacao++
    if (c.assistencia_social?.alertas?.length) alertas_por_area.assistencia_social++
    if (!bairros[row.bairro]) {
      bairros[row.bairro] = {
        total: 0,
        comAlertas: 0,
        porArea: {
          saude: 0,
          educacao: 0,
          assistencia_social: 0
        },
        alertas: {}
      }
    }

    bairros[row.bairro].total++
    if (temAlerta) bairros[row.bairro].comAlertas++
    if (c.saude?.alertas?.length) bairros[row.bairro].porArea.saude++
    if (c.educacao?.alertas?.length) bairros[row.bairro].porArea.educacao++
    if (c.assistencia_social?.alertas?.length) bairros[row.bairro].porArea.assistencia_social++

    for (const a of alertas) {
      contagemAlertas[a] = (contagemAlertas[a] || 0) + 1
      bairros[row.bairro].alertas[a] = (bairros[row.bairro].alertas[a] || 0) + 1
    }
  }

  return res.json({
    total: rows.length,
    revisados,
    com_alertas,
    alertas_por_area,
    detalhes_alertas: separarAlertasPorArea(parsed),
    por_bairro: Object.entries(bairros)
      .map(([bairro, d]) => ({ bairro, ...d }))
      .sort((a, b) => b.comAlertas - a.comAlertas),
    insights: gerarInsights(rows, parsed, contagemAlertas, bairros)
  })
}

module.exports = { getSummary }