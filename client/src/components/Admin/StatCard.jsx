export default function StatCard({ icon, label, value }) {
  return (
    <div className="card border border-base-300 bg-base-200 p-6!">
      <div className="flex items-center gap-3 text-base-content/60">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="mt-3! text-3xl font-semibold">{value}</div>
    </div>
  );
}