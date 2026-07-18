"use client";

import { AdminShell } from "@/components/layout/admin-shell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AdminSettingsPage() {
  return (
    <AdminShell>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="font-display text-lg font-bold text-ink-800 dark:text-white">Company Details</h2>
          <p className="mb-5 text-sm text-ink-400">Organization information shown across the platform.</p>
          <div className="flex flex-col gap-4">
            <Input label="Company name" defaultValue="Odoo Pvt. Ltd." />
            <Input label="Registered address" defaultValue="Gandhinagar" />
            <Input label="Industry" defaultValue="Software" />
            <Input label="Admin contact" defaultValue="admin@odoo.com" />
            <Input label="Registered employees" defaultValue="48" readOnly />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-display text-lg font-bold text-ink-800 dark:text-white">RidesFare Configuration</h2>
          <p className="mb-5 text-sm text-ink-400">Organization-wide fare and policy defaults.</p>
          <div className="flex flex-col gap-4">
            <Input label="Fuel cost / litre" defaultValue="₹ 96.50" />
            <Input label="Cost per km" defaultValue="₹ 8.00" />
            <Input label="Travel cost (operational)" defaultValue="₹ 2.50 / km" />
          </div>

          <Button className="mt-6 w-full">Save Settings</Button>
        </Card>
      </div>
    </AdminShell>
  );
}
