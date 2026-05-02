import { useEffect } from 'react'
import { randomServerPatch } from '../features/updates/services/updateSimulator'
import useProductsStore from '../features/products/store/useProductsStore'

export default function useLiveUpdates() {
  const apply = useProductsStore((s) => s.applyServerPatch)

  useEffect(() => {
    const t = setInterval(() => {
      const patch = randomServerPatch()
      apply(patch as any)
    }, 5000 + Math.floor(Math.random() * 5000))
    return () => clearInterval(t)
  }, [apply])
}
