const TABS = [
  { id: "overview", label: "Overview" },
  { id: "users", label: (n) => `Users (${n})` },
  { id: "boards", label: (n) => `Boards (${n})` },
  { id: "visits", label: "Visits" },
];

export default function AdminTabs({ tab, setTab, userCount, boardCount }) {
  const counts = { users: userCount, boards: boardCount };

  return (
    <div role="tablist" className="flex gap-3 mb-5!">
      {TABS.map(({ id, label }) => (
        <button
          key={id}
          role="tab"
          className={`tab ${tab === id ? "border-2 border-primary" : ""} btn btn-soft px-3! rounded-full`}
          onClick={() => setTab(id)}
        >
          {typeof label === "function" ? label(counts[id]) : label}
        </button>
      ))}
    </div>
  );
}