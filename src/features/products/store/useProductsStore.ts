import { create } from 'zustand'
import type { Product, SortOption } from '../../../types'
import * as api from '../api'
import { simulateCategoryUpdate } from '../../updates/services/updateSimulator'
import { initHistory, pushChange, undo as undoHistory, redo as redoHistory, HistoryState } from './undoRedo'
import Toast from 'react-native-toast-message'

type State = {
  history: HistoryState
  loading: boolean
  error?: string
  searchQuery: string
  selectedCategory?: string | null
  sortOption?: SortOption
  isUpdating: Record<number, boolean>
  loadProducts: () => Promise<void>
  setSearch: (q: string) => void
  setCategoryFilter: (c?: string | null) => void
  setSort: (s?: SortOption) => void
  editCategory: (id: number, category: string) => void
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean
  applyServerPatch: (patch: Partial<Product> & { id: number; _version: number }) => void
}

const useProductsStore = create<State>((set, get) => ({
  history: initHistory([]),
  loading: false,
  searchQuery: '',
  selectedCategory: null,
  sortOption: undefined,
  isUpdating: {},

  loadProducts: async () => {
    set({ loading: true })
    try {
      const products = await api.fetchProducts()
      set({ history: initHistory(products), loading: false })
    } catch (err: any) {
      set({ error: String(err), loading: false })
    }
  },

  setSearch: (q) => set({ searchQuery: q }),
  setCategoryFilter: (c) => set({ selectedCategory: c }),
  setSort: (s) => set({ sortOption: s }),

  editCategory: (id, category) => {
    const { history } = get()
    const next = history.present.map((p) => (p.id === id ? { ...p, category, _lastLocalUpdate: Date.now(), _version: (p._version || 0) + 1 } : p))
    // push optimistic change into history and mark updating
    set({ history: pushChange(history, next), isUpdating: { ...get().isUpdating, [id]: true } })

    // simulate API
    simulateCategoryUpdate(id, category).then((res) => {
      if (!res.success) {
        // rollback (undo last change)
        set((s) => ({ history: undoHistory(s.history), isUpdating: { ...s.isUpdating, [id]: false } }))
        Toast.show({
          type: 'error',
          text1: 'Update failed',
          text2: 'Category change was reverted.'
        })
      } else {
        set((s) => ({ isUpdating: { ...s.isUpdating, [id]: false } }))
        Toast.show({
          type: 'success',
          text1: 'Category updated',
          text2: 'The product category was saved successfully.'
        })
      }
    })
  },

  undo: () => set((s) => ({ history: undoHistory(s.history) })),
  redo: () => set((s) => ({ history: redoHistory(s.history) })),

  canUndo: () => {
    const state = get()
    return state.history.past.length > 0
  },

  canRedo: () => {
    const state = get()
    return state.history.future.length > 0
  },

  applyServerPatch: (patch) => {
    set((s) => {
      const present = s.history.present.map((p) => {
        if (p.id !== patch.id) return p
        // if a recent local update happened, skip overriding
        if (p._lastLocalUpdate && Date.now() - p._lastLocalUpdate < 3000) return p
        if (patch._version && patch._version <= (p._version || 0)) return p
        return { ...p, ...patch }
      })
      return { history: { ...s.history, present } }
    })
  }
}))

export default useProductsStore
