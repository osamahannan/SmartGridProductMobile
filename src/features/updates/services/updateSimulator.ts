import type { Product } from '../../../types'

// Simulate API update with delay and random failure
export async function simulateCategoryUpdate(id: number, category: string): Promise<{ success: boolean }>{
  const delay = 500 + Math.floor(Math.random() * 1000)
  await new Promise((resolve) => setTimeout(() => resolve(undefined), delay))
  const fail = Math.random() < 0.25
  return { success: !fail }
}

// Expose a helper to generate random patches for live updates
export function randomServerPatch(): Partial<Product> & { id: number; _version: number } {
  const id = Math.floor(Math.random() * 20) + 1
  const changePrice = Math.random() > 0.5
  const patch: any = { id, _version: Date.now() }
  if (changePrice) patch.price = +(Math.random() * 200).toFixed(2)
  else patch.rating = { rate: +(Math.random() * 5).toFixed(2), count: Math.floor(Math.random() * 500) }
  return patch
}
