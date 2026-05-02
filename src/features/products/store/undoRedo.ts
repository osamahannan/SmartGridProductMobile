import type { Product } from '../../../types'

export type HistoryState = {
  past: Product[][]
  present: Product[]
  future: Product[][]
}

export function initHistory(products: Product[]): HistoryState {
  return { past: [], present: products, future: [] }
}

export function pushChange(state: HistoryState, next: Product[]): HistoryState {
  return { past: [...state.past, state.present], present: next, future: [] }
}

export function undo(state: HistoryState): HistoryState {
  if (state.past.length === 0) return state
  const previous = state.past[state.past.length - 1]
  return { past: state.past.slice(0, -1), present: previous, future: [state.present, ...state.future] }
}

export function redo(state: HistoryState): HistoryState {
  if (state.future.length === 0) return state
  const next = state.future[0]
  return { past: [...state.past, state.present], present: next, future: state.future.slice(1) }
}
