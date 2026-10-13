import { Shield } from "lucide-react";

export default function AdminHeader() {
  return (
    <div className="mb-8! flex items-center gap-3">
      <div className="rounded-lg bg-primary/10 p-2!">
        <Shield className="h-6 w-6 text-primary" />
      </div>
      <div>
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <p className="text-sm text-base-content/60">
          Manage users, boards, and platform data
        </p>
      </div>
    </div>
  );
}