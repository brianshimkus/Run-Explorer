import { useEffect, useState } from 'react'
import { makeRuns } from './fixtures'
import { selectRuns } from './domain'
import { useUrl } from './url'
import { RunTable } from './components/RunTable'
const runs = makeRuns()
export default function App() {
  const { filters, selectedId, update } = useUrl()
  const [draft, setDraft] = useState(filters.q)
  useEffect(() => setDraft(filters.q), [filters.q])
  const data = selectRuns(runs, filters)
  return (
    <main>
      <h1>
        Run <em>Explorer</em>
      </h1>
      <section className='workspace'>
        <form
          className='filters'
          onSubmit={(e) => {
            e.preventDefault()
            update({ q: draft, page: 1 })
          }}>
          <label>
            Search runs
            <input value={draft} onChange={(e) => setDraft(e.target.value)} />
          </label>
          <button>Search</button>
          <label>
            Status
            <select
              aria-label='Status'
              value={filters.status}
              onChange={(e) => update({ status: e.target.value, page: 1 })}>
              {['all', 'running', 'succeeded', 'failed'].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label>
            Sort
            <select
              aria-label='Sort'
              value={filters.sort}
              onChange={(e) => update({ sort: e.target.value, page: 1 })}>
              <option value='newest'>Newest first</option>
              <option value='duration'>Longest first</option>
            </select>
          </label>
        </form>
        <p className='message'>{data.total} matching runs</p>
        <RunTable runs={data.items} onOpen={(id) => update({ run: id })} />
        <nav className='pagination' aria-label='Run pages'>
          <button
            disabled={filters.page <= 1}
            onClick={() => update({ page: filters.page - 1 })}>
            Previous
          </button>
          <span>Page {filters.page}</span>
          <button
            disabled={filters.page * 6 >= data.total}
            onClick={() => update({ page: filters.page + 1 })}>
            Next
          </button>
        </nav>
        {selectedId && (
          <p className='message'>
            Selected {selectedId}. Inspection is added in checkpoint 04.
          </p>
        )}
      </section>
    </main>
  )
}
