"use client";

import { AdminShell } from "@/components/layout/admin-shell";
import { Card, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEmployees } from "@/hooks/useEmployees";

export default function EmployeesPage() {
  const { employees, isLoading, updateStatus, isUpdating } = useEmployees();

  const handleToggleAccess = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      await updateStatus({ id, status: nextStatus });
    } catch (err) {
      console.error("Failed to update employee status", err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge tone="success">Active</Badge>;
      case "SUSPENDED":
        return <Badge tone="danger">Blocked</Badge>;
      case "PENDING":
      default:
        return <Badge tone="warning">Pending</Badge>;
    }
  };

  return (
    <AdminShell>
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4 dark:border-ink-800">
          <div>
            <h2 className="font-display text-lg font-bold text-ink-800 dark:text-white">Registered Employees</h2>
            <p className="text-sm text-ink-400">Manage your organization&apos;s RidesFare participants.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
            <p className="mt-4 text-sm text-ink-500">Loading employees...</p>
          </div>
        ) : employees.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-ink-500">No employees registered under this organization yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-400 dark:border-ink-800">
                  <th className="px-5 py-3 font-semibold">Name</th>
                  <th className="px-5 py-3 font-semibold">Email</th>
                  <th className="px-5 py-3 font-semibold">Phone</th>
                  <th className="px-5 py-3 font-semibold">Role</th>
                  <th className="px-5 py-3 font-semibold">User Type</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((e) => (
                  <tr key={e.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/60 dark:border-ink-800 dark:hover:bg-ink-800/40">
                    <td className="px-5 py-3.5 font-medium text-ink-800 dark:text-ink-100">
                      {e.firstName} {e.lastName}
                    </td>
                    <td className="px-5 py-3.5 text-ink-500 dark:text-ink-400">{e.email}</td>
                    <td className="px-5 py-3.5 text-ink-500 dark:text-ink-400">{e.phone}</td>
                    <td className="px-5 py-3.5 text-ink-500 dark:text-ink-400">
                      <span className="text-xs uppercase tracking-wider font-semibold text-ink-600 dark:text-ink-400">
                        {e.role.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-ink-500 dark:text-ink-400">
                      <span className="text-xs">{e.userType}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      {getStatusBadge(e.status)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Button
                        size="sm"
                        variant={e.status === "ACTIVE" ? "danger" : "primary"}
                        onClick={() => handleToggleAccess(e.id, e.status)}
                        disabled={isUpdating}
                      >
                        {e.status === "ACTIVE" ? "Block Access" : "Grant Access"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </AdminShell>
  );
}
