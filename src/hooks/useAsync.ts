import { useEffect, useRef, useState, useCallback, useSyncExternalStore } from 'react'
import { repo } from '../services/repo'

let version = 0
const listeners = new Set<() => void>()

repo.subscribe(() => {
  version += 1
  listeners.forEach((l) => l())
})

/** 订阅 MockRepository 的数据变更（写入 localStorage 后自动刷新相关组件） */
export function useRepoVersion(): number {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => version
  )
}

/** 简单异步数据 hook：依赖变化时重新拉取；已有数据时后台刷新，不闪加载态 */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[]): { data: T | undefined; loading: boolean; reload: () => void } {
  const [data, setData] = useState<T | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [tick, setTick] = useState(0)
  const version = useRepoVersion()
  const hasData = useRef(false)

  useEffect(() => {
    let alive = true
    if (!hasData.current) setLoading(true)
    fn().then((d) => {
      if (!alive) return
      hasData.current = true
      setData(d)
      setLoading(false)
    })
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick, version])

  const reload = useCallback(() => setTick((t) => t + 1), [])
  return { data, loading, reload }
}
