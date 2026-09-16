import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

const api = axios.create({
  baseURL: API_URL,
})

export async function getProducts(params = {}) {
  const { data } = await api.get('/products', { params })
  return data
}

export async function getProductById(id) {
  const { data } = await api.get(`/products/${id}`)
  return data
}

export async function getCategories() {
  const { data } = await api.get('/categories')
  return data
}

export default api
