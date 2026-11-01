import { Icon } from "./";
const COMPARISON_ROWS = [
  {
    label: "Real-time collaboration",
    excalidraw: true,
    eraser: true,
    vertex: true,
  },
  {
    label: "Custom canvas engine",
    excalidraw: true,
    eraser: false,
    vertex: true,
  },
  {
    label: "AI diagram analysis",
    excalidraw: false,
    eraser: true,
    vertex: true,
  },
  { label: "Code generation", excalidraw: false, eraser: false, vertex: true },

  { label: "Open source (MIT)", excalidraw: true, eraser: false, vertex: true },
];

function Mark({ ok }) {
  return ok ? (
    <Icon name="check" className="mx-auto h-6 w-6 text-emerald-500" />
  ) : (
    <Icon name="cross" className="mx-auto h-5 w-5 text-zinc-900/30" />
  );
}

export default function ComparisonTable() {
  return (
    <section className="px-6! py-24! flex justify-center">
      <div className="mx-auto max-w-4xl">
        <h2 className="font-display text-center text-[28px] font-semibold tracking-tight text-zinc-900">
          Why VertexCanvas
        </h2>

        <div className="mt-10! overflow-x-auto rounded-xl border border-neutral-200">
          <table className="table">
            <thead>
              <tr className="bg-neutral-50">
                <th className="text-zinc-900/70 p-3! px-15!">Feature</th>
                <th className="text-center text-zinc-900/70 px-15!">
                  Excalidraw
                </th>
                <th className="text-center text-zinc-900/70 px-15!">
                  Eraser.io
                </th>
                <th className="text-center text-zinc-900 px-15!">
                  VertexCanvas
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {COMPARISON_ROWS.map((row) => (
                <tr key={row.label}>
                  <td className="text-zinc-900 p-2! px-10!">{row.label}</td>
                  <td className=" pl-20!">
                    <Mark ok={row.excalidraw} />
                  </td>
                  <td className="pl-20! ">
                    <Mark ok={row.eraser} />
                  </td>
                  <td className="bg-indigo-700/5  pl-20! ">
                    <Mark ok={row.vertex} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
