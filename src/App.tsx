import { makeRuns } from "./fixtures";
import { RunTable } from "./components/RunTable";
const runs = makeRuns(6);
export default function App() {
  return (
    <main>
      <header className="hero">
        <div>
          <p className="eyebrow">Execution observatory</p>
          <h1>
            Run <em>Explorer</em>
          </h1>
          <p>See every step. Find the failure.</p>
        </div>
      </header>
      <section className="workspace">
        <div className="section-heading">
          <h2>Application runs</h2>
        </div>
        <RunTable
          runs={runs}
          onOpen={(id) =>
            window.alert(`You selected ${id}. The detail panel comes later.`)
          }
        />
      </section>
    </main>
  );
}
