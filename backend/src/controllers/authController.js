const jwt = require('jsonwebtoken')

const CREDENTIALS = {
  email: 'tecnico@prefeitura.rio',
  password: 'painel@2024'
}

function login(req, res) {
  const { email, senha } = req.body

  if (email !== CREDENTIALS.email || senha !== CREDENTIALS.password) {
    return res.status(401).json({ error: 'Credenciais inválidas' })
  }

  const token = jwt.sign(
    { preferred_username: email },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  )

  return res.json({ token })
}

module.exports = { login }