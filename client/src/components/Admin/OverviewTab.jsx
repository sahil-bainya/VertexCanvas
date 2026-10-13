import { Users, LayoutGrid } from "lucide-react";
import StatCard from "./StatCard.jsx";

export default function OverviewTab({ stats }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon={<Users className="h-5 w-5" />}
        label="Total Users"
        value={stats?.totalUsers || 0}
      />
      <StatCard
        icon={<LayoutGrid className="h-5 w-5" />}
        label="Total Boards"
        value={stats?.totalBoards || 0}
      />
    </div>
  );
}