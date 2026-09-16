import Product from '../models/Product.js'

export async function listProducts(req, res, next) {
  try {
    const { category, search, featured, limit } = req.query

    const filter = {}
    if (category) filter.category = category.toLowerCase()
    if (featured === 'true') filter.featured = true
    if (search) filter.$text = { $search: search }

    let query = Product.find(filter).sort({ createdAt: -1 })
    if (limit) query = query.limit(Number(limit))

    const products = await query.exec()
    res.json({ products, count: products.length })
  } catch (error) {
    next(error)
  }
}

export async function getProduct(req, res, next) {
  try {
    const product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' })
    }

    res.json(product)
  } catch (error) {
    next(error)
  }
}

export async function listCategories(req, res, next) {
  try {
    const categories = await Product.distinct('category')
    res.json(categories)
  } catch (error) {
    next(error)
  }
}

export async function createProduct(req, res, next) {
  try {
    const product = await Product.create(req.body)
    res.status(201).json(product)
  } catch (error) {
    next(error)
  }
}

export async function updateProduct(req, res, next) {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })

    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' })
    }

    res.json(product)
  } catch (error) {
    next(error)
  }
}

export async function deleteProduct(req, res, next) {
  try {
    const product = await Product.findByIdAndDelete(req.params.id)

    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' })
    }

    res.status(204).send()
  } catch (error) {
    next(error)
  }
}
