"use client";

import { AdminShell } from "@/components/layout/admin-shell";
import { Card, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useVehicles } from "@/hooks/useVehicles";

export default function VehiclesPage() {
  const { vehicles, isLoading, verifyVehicle } = useVehicles();

  const handleVerify = async (id: string, status: 'PENDING' | 'VERIFIED' | 'SUSPENDED' | 'REJECTED') => {
    try {
      await verifyVehicle({ id, status });
    } catch (err) {
      console.error("Failed to update vehicle verification status", err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return <Badge tone="success">Verified</Badge>;
      case "SUSPENDED":
        return <Badge tone="danger">Suspended</Badge>;
      case "REJECTED":
        return <Badge tone="danger">Rejected</Badge>;
      case "PENDING":
      default:
        return <Badge tone="warning">Pending Verification</Badge>;
    }
  };

  // Typecast or adapt vehicle shape to include joined owner
  const vehicleList = vehicles as any[];

  return (
    <AdminShell>
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4 dark:border-ink-800">
          <div>
            <h2 className="font-display text-lg font-bold text-ink-800 dark:text-white">Registered Vehicles</h2>
            <p className="text-sm text-ink-400">Vehicles registered by employees for ride sharing.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
            <p className="mt-4 text-sm text-ink-500">Loading vehicles...</p>
          </div>
        ) : vehicleList.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-ink-500">No vehicles registered under this organization yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-400 dark:border-ink-800">
                  <th className="px-5 py-3 font-semibold">Registration No.</th>
                  <th className="px-5 py-3 font-semibold">Model</th>
                  <th className="px-5 py-3 font-semibold">Seating Capacity</th>
                  <th className="px-5 py-3 font-semibold">Driver / Owner</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vehicleList.map((v) => {
                  const driverName = v.owner 
                    ? `${v.owner.firstName} ${v.owner.lastName}` 
                    : "Unknown Employee";
                  
                  return (
                    <tr key={v.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/60 dark:border-ink-800 dark:hover:bg-ink-800/40">
                      <td className="px-5 py-3.5 font-mono text-xs font-medium text-ink-800 dark:text-ink-100">
                        {v.registrationNumber}
                      </td>
                      <td className="px-5 py-3.5 text-ink-500 dark:text-ink-400">
                        {v.model} <span className="text-xs text-ink-400">({v.color})</span>
                      </td>
                      <td className="px-5 py-3.5 text-ink-500 dark:text-ink-400">{v.seatingCapacity} seats</td>
                      <td className="px-5 py-3.5 text-ink-500 dark:text-ink-400">{driverName}</td>
                      <td className="px-5 py-3.5">
                        {getStatusBadge(v.verificationStatus)}
                      </td>
                      <td className="px-5 py-3.5 text-right flex justify-end gap-2">
                        {v.verificationStatus !== "VERIFIED" && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleVerify(v.id, "VERIFIED")}
                          >
                            Verify
                          </Button>
                        )}
                        {v.verificationStatus === "VERIFIED" && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleVerify(v.id, "SUSPENDED")}
                          >
                            Suspend
                          </Button>
                        )}
                        {v.verificationStatus !== "REJECTED" && v.verificationStatus !== "VERIFIED" && (
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleVerify(v.id, "REJECTED")}
                          >
                            Reject
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </AdminShell>
  );
}
