import { AdminShell } from "@/components/layout/admin-shell";
import { Card, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { vehicles } from "@/lib/mock-data";

export default function VehiclesPage() {
  return (
    <AdminShell>
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4 dark:border-ink-800">
          <div>
            <h2 className="font-display text-lg font-bold text-ink-800 dark:text-white">Registered Vehicles</h2>
            <p className="text-sm text-ink-400">Vehicles registered by employees for ride sharing.</p>
          </div>
          <Button size="sm">
            <Icons.plus width={16} height={16} /> Add Vehicle
          </Button>
        </div>

        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-400 dark:border-ink-800">
                <th className="px-5 py-3 font-semibold">Registration No.</th>
                <th className="px-5 py-3 font-semibold">Model</th>
                <th className="px-5 py-3 font-semibold">Seating Capacity</th>
                <th className="px-5 py-3 font-semibold">Driver</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v.regNo} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/60 dark:border-ink-800 dark:hover:bg-ink-800/40">
                  <td className="px-5 py-3.5 font-mono text-xs font-medium text-ink-800 dark:text-ink-100">{v.regNo}</td>
                  <td className="px-5 py-3.5 text-ink-500 dark:text-ink-400">{v.model}</td>
                  <td className="px-5 py-3.5 text-ink-500 dark:text-ink-400">{v.seats}</td>
                  <td className="px-5 py-3.5 text-ink-500 dark:text-ink-400">{v.driver}</td>
                  <td className="px-5 py-3.5">
                    <Badge tone={v.status === "active" ? "success" : "danger"}>
                      {v.status === "active" ? "Active" : "Inactive"}
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
