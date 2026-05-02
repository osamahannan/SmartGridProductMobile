import axios from 'axios'
import type { Product } from '../../types'

const API = 'https://fakestoreapi.com/products'

export async function fetchProducts(): Promise<Product[]> {
  const res = await axios.get<Product[]>(API)
  return res.data.map((p) => ({ ...p, _version: Date.now() }))
}
