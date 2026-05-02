import { useMemo, useCallback } from 'react'
import useProductsStore from '../features/products/store/useProductsStore'
import type { Product, SortOption } from '../types'

/**
 * Selector hook that returns stable product filtering/sorting logic
 * Memoizes derived state to prevent unnecessary re-renders
 */
export function useProducts() {
  const history = useProductsStore((s) => s.history)
  const searchQuery = useProductsStore((s) => s.searchQuery)
  const selectedCategory = useProductsStore((s) => s.selectedCategory)
  const sortOption = useProductsStore((s) => s.sortOption)

  const data: Product[] = history.present

  // Memoize categories list (only recalculate when data changes)
  const categories = useMemo(
    () => Array.from(new Set(data.map((p) => p.category))),
    [data]
  )

  // Memoize filtered and sorted products
  const filtered = useMemo(() => {
    let list = data

    // Apply search filter
    if (searchQuery) {
      list = list.filter((p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply category filter
    if (selectedCategory) {
      list = list.filter((p) => p.category === selectedCategory)
    }

    // Apply sorting
    if (sortOption) {
      const { key, dir } = sortOption
      list = [...list].sort((a, b) => {
        const av =
          key === 'price' ? a.price : a.rating?.rate ?? 0
        const bv =
          key === 'price' ? b.price : b.rating?.rate ?? 0
        return dir === 'asc' ? av - bv : bv - av
      })
    }

    return list
  }, [data, searchQuery, selectedCategory, sortOption])

  return {
    data,
    categories,
    filtered,
    searchQuery,
    selectedCategory,
    sortOption,
  }
}

export default useProducts
