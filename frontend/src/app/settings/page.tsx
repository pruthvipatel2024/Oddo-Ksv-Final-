"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/ui/icons";
import { useProfile } from "@/hooks/useProfile";
import { useSession } from "@/context/SessionContext";

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        checked ? "bg-teal-500" : "bg-ink-200 dark:bg-ink-700"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

function SettingsRow({
  icon: Icon,
  label,
  sublabel,
  right,
  href,
}: {
  icon: (p?: any) => React.ReactNode;
  label: string;
  sublabel?: string;
  right?: React.ReactNode;
  href?: string;
}) {
  const content = (
    <div className="flex items-center justify-between gap-3 px-5 py-3.5">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-100 text-ink-500 dark:bg-ink-800 dark:text-ink-300">
          <Icon width={16} height={16} />
        </div>
        <div>
          <p className="text-sm font-medium text-ink-800 dark:text-ink-100">{label}</p>
          {sublabel && <p className="text-xs text-ink-400">{sublabel}</p>}
        </div>
      </div>
      {right ?? (
        <span className="rotate-180 text-ink-300">
          <Icons.chevronLeft width={16} height={16} />
        </span>
      )}
    </div>
  );

  return href ? (
    <Link href={href} className="block transition-colors hover:bg-ink-50/60 dark:hover:bg-ink-800/40">
      {content}
    </Link>
  ) : (
    <div>{content}</div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { logout } = useSession();
  const { profile, updateProfile, isUpdating } = useProfile();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [rideUpdates, setRideUpdates] = useState(true);
  const [promotions, setPromotions] = useState(false);
  const [rideReminders, setRideReminders] = useState(true);

  // Sync state with fetched profile data
  useEffect(() => {
    if (profile) {
      setName(`${profile.firstName || ""} ${profile.lastName || ""}`.trim());
      setEmail(profile.email || "");
      setPhone(profile.phone || "");
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nameParts = name.trim().split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    try {
      await updateProfile({
        firstName,
        lastName,
        phone: phone.trim(),
      });
      setEditing(false);
    } catch (err) {
      console.error("Failed to update profile", err);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <AppShell title="Settings">
      <div className="mx-auto flex max-w-xl flex-col gap-6">
        {/* User profile — top of page */}
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-400 font-display text-xl font-bold text-white uppercase">
              {name ? name.split(" ").map((n) => n[0]).join("") : "U"}
            </div>
            <div className="flex-1">
              {!editing ? (
                <>
                  <p className="font-display text-lg font-bold text-ink-800 dark:text-white">{name || "User Profile"}</p>
                  <p className="text-sm text-ink-500 dark:text-ink-400">{email || "Loading..."}</p>
                  <p className="text-sm text-ink-500 dark:text-ink-400">{phone || ""}</p>
                </>
              ) : (
                <p className="text-sm text-ink-500 dark:text-ink-400">Update your account details below.</p>
              )}
            </div>
            <Button size="sm" variant="secondary" onClick={() => setEditing((v) => !v)} disabled={isUpdating}>
              {editing ? "Cancel" : "Edit Profile"}
            </Button>
          </div>

          {editing && (
            <form
              className="mt-5 flex flex-col gap-4 border-t border-ink-100 pt-5 dark:border-ink-800"
              onSubmit={handleSubmit}
            >
              <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
              <Input label="Email" type="email" value={email} disabled className="opacity-60 cursor-not-allowed" />
              <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              <Button type="submit" className="w-full" disabled={isUpdating}>
                {isUpdating ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          )}
        </Card>

        {/* Account */}
        <Card className="overflow-hidden">
          <p className="px-5 pt-4 text-xs font-semibold uppercase tracking-wide text-ink-400">Account</p>
          <div className="divide-y divide-ink-50 dark:divide-ink-800">
            <SettingsRow icon={Icons.wallet} label="Payment Methods" sublabel="Manage cards, UPI, and cash" href="/my-trips" />
            <SettingsRow icon={Icons.history} label="Ride History" sublabel="View all past trips" href="/ride-history" />
            <SettingsRow icon={Icons.vehicle} label="My Vehicle" sublabel="Manage your registered vehicle" href="/my-vehicle" />
            <SettingsRow icon={Icons.pin} label="Saved Places" sublabel="Home, work, and favorites" href="/dashboard" />
          </div>
        </Card>

        {/* Notifications */}
        <Card className="overflow-hidden">
          <p className="px-5 pt-4 text-xs font-semibold uppercase tracking-wide text-ink-400">Notifications</p>
          <div className="divide-y divide-ink-50 dark:divide-ink-800">
            <SettingsRow
              icon={Icons.car}
              label="Ride Updates"
              sublabel="Driver arrival, route changes"
              right={<Toggle checked={rideUpdates} onChange={() => setRideUpdates((v) => !v)} />}
            />
            <SettingsRow
              icon={Icons.history}
              label="Ride Reminders"
              sublabel="Upcoming scheduled rides"
              right={<Toggle checked={rideReminders} onChange={() => setRideReminders((v) => !v)} />}
            />
            <SettingsRow
              icon={Icons.mail}
              label="Offers &amp; Promotions"
              sublabel="Occasional platform updates"
              right={<Toggle checked={promotions} onChange={() => setPromotions((v) => !v)} />}
            />
          </div>
        </Card>

        {/* Security */}
        <Card className="overflow-hidden">
          <p className="px-5 pt-4 text-xs font-semibold uppercase tracking-wide text-ink-400">Security</p>
          <div className="divide-y divide-ink-50 dark:divide-ink-800">
            <SettingsRow icon={Icons.lock} label="Change Password" sublabel="Update your login password" />
            <SettingsRow icon={Icons.users} label="Login Sessions" sublabel="Manage active devices" />
          </div>
        </Card>

        {/* Support */}
        <Card className="overflow-hidden">
          <p className="px-5 pt-4 text-xs font-semibold uppercase tracking-wide text-ink-400">Support</p>
          <div className="divide-y divide-ink-50 dark:divide-ink-800">
            <SettingsRow icon={Icons.reports} label="Reports" sublabel="Your ride & vehicle analytics" href="/reports" />
            <SettingsRow icon={Icons.mail} label="Help &amp; Chat" sublabel="Contact support" />
          </div>
        </Card>

        <Button variant="danger" className="w-full" onClick={handleLogout}>Log Out</Button>
      </div>
    </AppShell>
  );
}
