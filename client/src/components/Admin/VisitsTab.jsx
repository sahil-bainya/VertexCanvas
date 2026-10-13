import { Eye, Users, Clock, MapPin, Monitor } from "lucide-react";
import StatCard from "./StatCard.jsx";

export default function VisitsTab({ visits, visitStats, loading }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Eye className="h-5 w-5" />}
          label="Total Visits"
          value={visitStats?.total || 0}
        />
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Unique Visitors"
          value={visitStats?.uniqueVisitors || 0}
        />
        <StatCard
          icon={<Clock className="h-5 w-5" />}
          label="Today"
          value={visitStats?.today || 0}
        />
        <StatCard
          icon={<MapPin className="h-5 w-5" />}
          label="Countries"
          value={visitStats?.byCountry?.length || 0}
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-base-300">
        <table className="table">
          <thead>
            <tr className="bg-base-200">
              <th>User</th>
              <th>Location</th>
              <th>Device</th>
              <th>Path</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-8!">
                  <span className="loading loading-spinner loading-sm"></span>
                </td>
              </tr>
            ) : visits.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="text-center py-8! text-base-content/50"
                >
                  No visits yet
                </td>
              </tr>
            ) : (
              visits.map((v) => (
                <VisitRow key={v._id} visit={v} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function VisitRow({ visit: v }) {
  return (
    <tr>
      <td>
        {v.isLoggedIn && v.userId ? (
          <div>
            <p className="text-sm font-medium">{v.userId.name}</p>
            <p className="text-xs text-base-content/60">{v.userId.email}</p>
          </div>
        ) : (
          <span className="badge badge-ghost badge-sm">Anonymous</span>
        )}
      </td>
      <td>
        <div className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 text-base-content/50 shrink-0" />
          <div>
            <p className="text-sm">
              {v.city && v.city !== "unknown"
                ? `${v.city}, ${v.country}`
                : v.country || "Unknown"}
            </p>
            <p className="text-xs text-base-content/50">{v.ip}</p>
          </div>
        </div>
      </td>
      <td>
        <div className="flex items-center gap-2">
          <Monitor className="h-3.5 w-3.5 text-base-content/50 shrink-0" />
          <div>
            <p className="text-sm">{v.device?.browser}</p>
            <p className="text-xs text-base-content/50">{v.device?.os}</p>
          </div>
        </div>
      </td>
      <td>
        <span className="badge badge-ghost badge-sm font-mono">{v.path}</span>
      </td>
      <td className="text-xs text-base-content/60">
        {new Date(v.createdAt).toLocaleString()}
      </td>
    </tr>
  );
}