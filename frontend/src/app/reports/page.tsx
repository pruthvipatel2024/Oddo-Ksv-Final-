import { AppShell } from "@/components/layout/app-shell";
import { Card, StatCard, Badge } from "@/components/ui/card";
import { myVehicle, rideHistory } from "@/lib/mock-data";

const fuelTrend = [24, 26, 22, 28, 25, 30, 27];

export default function ReportsPage() {
  // Scope everything to the rides actually driven with the user's own vehicle.
  const myTrips = rideHistory.filter((r) => r.vehicle === myVehicle.regNo);
  const completed = myTrips.filter((t) => t.status === "completed");
  const totalEarned = completed.reduce((sum, t) => sum + t.fare, 0);

  const max = Math.max(...fuelTrend);
  const points = fuelTrend
    .map((v, i) => `${(i / (fuelTrend.length - 1)) * 280},${60 - (v / max) * 55}`)
    .join(" ");

  const fareMax = Math.max(...completed.map((t) => t.fare), 1);

  return (
    <AppShell title="Reports">
      <div className="mb-2 flex items-center gap-2 text-sm text-ink-500 dark:text-ink-400">
        Showing usage for your vehicle
        <Badge tone="teal">{myVehicle.model} · {myVehicle.regNo}</Badge>
      </div>

      <div className="mb-6 mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Fuel Used" value="24.2L" accent="teal" />
        <StatCard label="Rides Given" value={String(completed.length)} accent="teal" />
        <StatCard label="Total Earned" value={`₹${totalEarned}`} accent="amber" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="font-display text-base font-bold text-ink-800 dark:text-white">Fuel Efficiency Trend (km/L)</h3>
          <p className="text-xs text-ink-400">{myVehicle.model} · {myVehicle.regNo}</p>
          <svg viewBox="0 0 280 60" className="mt-4 h-32 w-full overflow-visible">
            <polyline points={points} fill="none" stroke="#0E7C7B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {fuelTrend.map((v, i) => (
              <circle
                key={i}
                cx={(i / (fuelTrend.length - 1)) * 280}
                cy={60 - (v / max) * 55}
                r="3"
                fill="#0E7C7B"
              />
            ))}
          </svg>
          <div className="mt-1 flex justify-between text-xs text-ink-400">
            {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-display text-base font-bold text-ink-800 dark:text-white">Fare Earned per Trip</h3>
          <p className="text-xs text-ink-400">Last {completed.length} completed rides with your vehicle</p>
          {completed.length > 0 ? (
            <div className="mt-6 flex h-32 items-end gap-4">
              {completed.map((t, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t-md bg-amber-400"
                    style={{ height: `${(t.fare / fareMax) * 100}%` }}
                    title={`₹${t.fare}`}
                  />
                  <span className="text-[10px] text-ink-400">{t.route.split(" → ")[1]}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-6 text-sm text-ink-400">No completed rides with this vehicle yet.</p>
          )}
        </Card>
      </div>

      <Card className="mt-6 overflow-hidden">
        <div className="border-b border-ink-100 px-5 py-4 dark:border-ink-800">
          <h3 className="font-display text-base font-bold text-ink-800 dark:text-white">Trip Log — {myVehicle.regNo}</h3>
        </div>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-400 dark:border-ink-800">
              <th className="px-5 py-3 font-semibold">Route</th>
              <th className="px-5 py-3 font-semibold">Date &amp; Time</th>
              <th className="px-5 py-3 font-semibold">Fare</th>
              <th className="px-5 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {myTrips.map((t, i) => (
              <tr key={i} className="hover:bg-ink-50/60 dark:hover:bg-ink-800/40">
                <td className="px-5 py-3.5 font-medium text-ink-800 dark:text-ink-100">{t.route}</td>
                <td className="px-5 py-3.5 text-ink-500 dark:text-ink-400">{t.time}</td>
                <td className="px-5 py-3.5 font-mono text-ink-700 dark:text-ink-200">₹{t.fare}</td>
                <td className="px-5 py-3.5">
                  <Badge tone={t.status === "completed" ? "success" : "danger"}>
                    {t.status === "completed" ? "Completed" : "Cancelled"}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </AppShell>
  );
}
