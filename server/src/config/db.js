import mongoose from 'mongoose'

export async function connectDB() {
  const uri = process.env.MONGODB_URI

  if (!uri) {
    throw new Error('Falta la variable de entorno MONGODB_URI')
  }

  mongoose.set('strictQuery', true)

  await mongoose.connect(uri)

  console.log(`MongoDB conectado: ${mongoose.connection.host}`)
}
