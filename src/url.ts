import { useSyncExternalStore } from 'react'
import { readFilters } from './domain'
const EVENT = 'run-explorer:url'
function subscribe(notify: () => void) {
  window.addEventListener('popstate', notify)
  window.addEventListener(EVENT, notify)
  return () => {
    window.removeEventListener('popstate', notify)
    window.removeEventListener(EVENT, notify)
  }
}
export function useUrl() {
  const search = useSyncExternalStore(
    subscribe,
    () => window.location.search,
    () => '',
  )
  function update(changes: Record<string, string | number | null>) {
    const p = new URLSearchParams(window.location.search)
    for (const [key, value] of Object.entries(changes)) {
      if (value === null || value === '') p.delete(key)
      else p.set(key, String(value))
    }
    const suffix = p.toString()
    window.history.pushState(
      {},
      '',
      window.location.pathname + (suffix ? `?${suffix}` : ''),
    )
    window.dispatchEvent(new Event(EVENT))
  }
  return {
    filters: readFilters(search),
    selectedId: new URLSearchParams(search).get('run'),
    update,
  }
}
