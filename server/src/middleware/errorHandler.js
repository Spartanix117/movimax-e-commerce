export function notFound(req, res) {
  res.status(404).json({ message: `Ruta no encontrada: ${req.originalUrl}` })
}

export function errorHandler(err, req, res, next) {
  console.error(err)

  const status = err.statusCode || 500
  res.status(status).json({
    message: err.message || 'Error interno del servidor',
  })
}
