const AI_ITEMS = [
  {
    label: "Analyze",
    body: "Spot errors and inconsistencies as you draw, with fixes suggested inline.",
  },
  {
    label: "Organize",
    body: "Auto-arrange a tangled diagram into a clean, readable layout in one click.",
  },
  {
    label: "Generate",
    body: "Describe what you need in a sentence — get a structured diagram back.",
  },
  {
    label: "Code",
    body: "Turn a diagram straight into Python, C++, SQL, or a Mongoose schema.",
  },
];

export default function AIShowcase() {
  return (
    <section className="px-6! py-24! flex justify-center">
      <div className="aura aura-holo aura-lg mx-auto max-w-5xl">
        <div className="card border border-neutral-200 bg-linear-to-br from-neutral-50 to-neutral-100 p-8! md:p-12!">
          <span className="text-[13px] font-medium text-pink-500">
            What sets it apart
          </span>
          <h2 className="font-display mt-3! max-w-lg text-[28px] font-semibold tracking-tight text-zinc-900 md:text-[32px]">
            AI that understands your diagrams
          </h2>

          <div className="mt-10! grid grid-cols-1 gap-8 sm:grid-cols-2">
            {AI_ITEMS.map((item, i) => (
              <div key={item.label} className="flex gap-4">
                <span className="mt-0.5! flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-linear-to-r bg-[#6C3CEB] text-white text-[12px] font-semibold ">
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-[15px] font-medium text-zinc-900">
                    {item.label}
                  </h3>
                  <p className="mt-1.5! text-[14px] leading-relaxed text-zinc-900/60">
                    {item.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}