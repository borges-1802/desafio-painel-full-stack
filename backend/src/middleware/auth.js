const jwt = require('jsonwebtoken')

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET não definido')
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({ message: 'Token não fornecido' })
  }

  const parts = authHeader.split(' ')

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Formato do token inválido' })
  }

  const token = parts[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    return next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expirado' })
    }

    return res.status(401).json({ message: 'Token inválido' })
  }
}

module.exports = authMiddleware