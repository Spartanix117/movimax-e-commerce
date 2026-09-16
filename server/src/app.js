import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import productRoutes from './routes/productRoutes.js'
import { notFound, errorHandler } from './middleware/errorHandler.js'

const app = express()

const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',')

app.use(cors({ origin: allowedOrigins }))
app.use(express.json())
app.use(morgan('dev'))

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api', productRoutes)

app.use(notFound)
app.use(errorHandler)

export default app
