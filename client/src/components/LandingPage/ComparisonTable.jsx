import {Icon} from "./"
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
  {
    label: "Binary-encoded sync",
    excalidraw: false,
    eraser: false,
    vertex: true,
  },
  { label: "Open source (MIT)", excalidraw: true, eraser: false, vertex: true },
];

function Mark({ ok }) {
  return ok ? (
    <Icon name="check" className="mx-auto h-6 w-6 text-success" />
  ) : (
    <Icon name="cross" className="mx-auto h-5 w-5 text-base-content/30" />
  );
}

export default function ComparisonTable() {
  return (
    <section className="px-6! py-24! flex justify-center">
      <div className="mx-auto max-w-4xl">
        <h2 className="font-display text-center text-[28px] font-semibold tracking-tight text-base-content">
          Why VertexCanvas
        </h2>

        <div className="mt-10! overflow-x-auto rounded-xl border border-base-300">
          <table className="table">
            <thead> 
              <tr className="bg-base-200">
                <th className="text-base-content/70 p-3! px-15!">Feature</th>
                <th className="text-center text-base-content/70 px-15!">
                  Excalidraw
                </th>
                <th className="text-center text-base-content/70 px-15!">Eraser.io</th>
                <th className="text-center text-base-content px-15!">VertexCanvas</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row) => (
                <tr key={row.label}>
                  <td className="text-base-content p-2! px-10!">{row.label}</td>
                  <td className=" pl-20!">
                    <Mark ok={row.excalidraw} />
                  </td>
                  <td className="pl-20! ">
                    <Mark ok={row.eraser} />
                  </td>
                  <td className="bg-primary/5  pl-20! ">
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