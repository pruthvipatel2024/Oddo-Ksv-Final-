import { AdminShell } from "@/components/layout/admin-shell";
import { Card, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { employees } from "@/lib/mock-data";

export default function EmployeesPage() {
  return (
    <AdminShell>
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4 dark:border-ink-800">
          <div>
            <h2 className="font-display text-lg font-bold text-ink-800 dark:text-white">Registered Employees</h2>
            <p className="text-sm text-ink-400">Manage your organization&apos;s RidesFare participants.</p>
          </div>
          <Button size="sm">
            <Icons.plus width={16} height={16} /> Add Employee
          </Button>
        </div>

        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-400 dark:border-ink-800">
                <th className="px-5 py-3 font-semibold">Name</th>
                <th className="px-5 py-3 font-semibold">Email</th>
                <th className="px-5 py-3 font-semibold">Department</th>
                <th className="px-5 py-3 font-semibold">Manager</th>
                <th className="px-5 py-3 font-semibold">Location</th>
                <th className="px-5 py-3 font-semibold">Platform Access</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((e) => (
                <tr key={e.email} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/60 dark:border-ink-800 dark:hover:bg-ink-800/40">
                  <td className="px-5 py-3.5 font-medium text-ink-800 dark:text-ink-100">{e.name}</td>
                  <td className="px-5 py-3.5 text-ink-500 dark:text-ink-400">{e.email}</td>
                  <td className="px-5 py-3.5 text-ink-500 dark:text-ink-400">{e.department}</td>
                  <td className="px-5 py-3.5 text-ink-500 dark:text-ink-400">{e.manager}</td>
                  <td className="px-5 py-3.5 text-ink-500 dark:text-ink-400">{e.location}</td>
                  <td className="px-5 py-3.5">
                    <Badge tone={e.access === "active" ? "success" : "danger"}>
                      {e.access === "active" ? "Active" : "Revoked"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AdminShell>
  );
}
