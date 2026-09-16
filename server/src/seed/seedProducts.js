import 'dotenv/config'
import { connectDB } from '../config/db.js'
import Product from '../models/Product.js'
import mongoose from 'mongoose'

const sampleProducts = [
  {
    name: 'Audífonos Bluetooth Pro',
    description: 'Audífonos inalámbricos con cancelación de ruido y batería de 20 horas.',
    price: 899,
    category: 'audio',
    stock: 25,
    images: [],
    featured: true,
  },
  {
    name: 'Cargador rápido 20W',
    description: 'Cargador de pared USB-C con carga rápida compatible con la mayoría de smartphones.',
    price: 249,
    category: 'accesorios',
    stock: 60,
    images: [],
    featured: true,
  },
  {
    name: 'Funda protectora iPhone',
    description: 'Funda resistente a caídas con protección en las esquinas.',
    price: 199,
    category: 'accesorios',
    stock: 40,
    images: [],
  },
  {
    name: 'Cable USB-C a USB-C 1m',
    description: 'Cable trenzado de alta durabilidad para carga y transferencia de datos.',
    price: 129,
    category: 'accesorios',
    stock: 100,
    images: [],
  },
  {
    name: 'Power Bank 10,000 mAh',
    description: 'Batería portátil compacta con doble puerto USB.',
    price: 449,
    category: 'accesorios',
    stock: 30,
    images: [],
    featured: true,
  },
  {
    name: 'Radio de comunicación digital',
    description: 'Radio profesional de largo alcance para negocios y equipos de trabajo.',
    price: 1599,
    category: 'comunicación',
    stock: 15,
    images: [],
  },
  {
    name: 'Smartwatch deportivo',
    description: 'Reloj inteligente con monitor de ritmo cardiaco y notificaciones.',
    price: 1299,
    category: 'wearables',
    stock: 20,
    images: [],
    featured: true,
  },
  {
    name: 'Bocina portátil resistente al agua',
    description: 'Bocina Bluetooth con certificación IPX7 y 12 horas de batería.',
    price: 799,
    category: 'audio',
    stock: 18,
    images: [],
  },
]

async function seed() {
  await connectDB()

  await Product.deleteMany({})
  await Product.insertMany(sampleProducts)

  console.log(`Se insertaron ${sampleProducts.length} productos de ejemplo.`)

  await mongoose.disconnect()
  process.exit(0)
}

seed().catch((error) => {
  console.error('Error al insertar productos de ejemplo:', error)
  process.exit(1)
})
