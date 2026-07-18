"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Card, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/ui/icons";
import { useProfile } from "@/hooks/useProfile";
import { useSession } from "@/context/SessionContext";
import { usersApi } from "@/src/services/api/users.api";

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none ${
        checked ? "bg-teal-500" : "bg-ink-200 dark:bg-ink-700"
      }`}
    >
      <span
        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-5" : "translate-x-0"
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
  onClick,
}: {
  icon: (p?: any) => React.ReactNode;
  label: string;
  sublabel?: string;
  right?: React.ReactNode;
  href?: string;
  onClick?: () => void;
}) {
  const content = (
    <div className="flex items-center justify-between gap-3 px-5 py-3.5">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-100 text-ink-500 dark:bg-ink-800 dark:text-ink-300">
          <Icon width={16} height={16} />
        </div>
        <div className="text-left">
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

  if (href) {
    return (
      <Link href={href} className="block transition-colors hover:bg-ink-50/60 dark:hover:bg-ink-800/40">
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="block w-full transition-colors hover:bg-ink-50/60 dark:hover:bg-ink-800/40 cursor-pointer focus:outline-none animate-none"
      >
        {content}
      </button>
    );
  }

  return <div>{content}</div>;
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

  // Modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);

  // Change password states
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdError, setPwdError] = useState("");
  const [pwdSuccess, setPwdSuccess] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);

  // Device info states
  const [deviceInfo, setDeviceInfo] = useState("Unknown Device");

  // Sync state with fetched profile data
  useEffect(() => {
    if (profile) {
      setName(`${profile.firstName || ""} ${profile.lastName || ""}`.trim());
      setEmail(profile.email || "");
      setPhone(profile.phone || "");
    }
  }, [profile]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const ua = window.navigator.userAgent;
      let browser = "Browser";
      let os = "OS";

      if (ua.includes("Chrome")) browser = "Chrome";
      else if (ua.includes("Firefox")) browser = "Firefox";
      else if (ua.includes("Safari")) browser = "Safari";
      else if (ua.includes("Edge")) browser = "Edge";

      if (ua.includes("Windows")) os = "Windows";
      else if (ua.includes("Macintosh")) os = "macOS";
      else if (ua.includes("Linux")) os = "Linux";
      else if (ua.includes("Android")) os = "Android";
      else if (ua.includes("iPhone")) os = "iOS";

      setDeviceInfo(`${browser} on ${os}`);
    }
  }, []);

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

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError("");
    setPwdSuccess("");

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPwdError("All fields are required");
      return;
    }

    if (newPassword.length < 6) {
      setPwdError("New password must be at least 6 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwdError("Passwords do not match");
      return;
    }

    setPwdLoading(true);
    try {
      await usersApi.changePassword({ oldPassword, newPassword });
      setPwdSuccess("Password updated successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.message || "Failed to update password. Please check your credentials.";
      setPwdError(errMsg);
    } finally {
      setPwdLoading(false);
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
            <SettingsRow
              icon={Icons.lock}
              label="Change Password"
              sublabel="Update your login password"
              onClick={() => setShowPasswordModal(true)}
            />
            <SettingsRow
              icon={Icons.users}
              label="Login Sessions"
              sublabel="Manage active devices"
              onClick={() => setShowSessionModal(true)}
            />
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

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md p-6 bg-white dark:bg-ink-900 animate-fade-up">
            <h3 className="font-display text-lg font-bold text-ink-800 dark:text-white">Change Password</h3>
            <p className="text-xs text-ink-400 mb-4">Update your account login password</p>

            {pwdError && (
              <div className="mb-4 rounded-lg bg-danger/10 p-3 text-xs font-medium text-danger">
                {pwdError}
              </div>
            )}
            {pwdSuccess && (
              <div className="mb-4 rounded-lg bg-teal-500/10 p-3 text-xs font-medium text-teal-600 dark:text-teal-400">
                {pwdSuccess}
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="flex flex-col gap-4">
              <Input
                label="Current Password"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <Input
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <Input
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />

              <div className="flex gap-3 mt-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPwdError("");
                    setPwdSuccess("");
                    setOldPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={pwdLoading}>
                  {pwdLoading ? "Updating..." : "Update Password"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Login Sessions Modal */}
      {showSessionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md p-6 bg-white dark:bg-ink-900 animate-fade-up">
            <h3 className="font-display text-lg font-bold text-ink-800 dark:text-white">Active Sessions</h3>
            <p className="text-xs text-ink-400 mb-5">Devices currently logged into your account</p>

            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3 rounded-xl border border-teal-500/25 bg-teal-50/5 p-4 dark:border-teal-500/20">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-100 text-teal-600 dark:bg-teal-500/10 dark:text-teal-300">
                  <Icons.users width={18} height={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink-800 dark:text-white">
                    {deviceInfo}
                  </p>
                  <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">
                    Active Session (Current Device)
                  </p>
                  {profile?.lastLogin && (
                    <p className="text-[10px] text-ink-400 mt-1">
                      Last logged in: {new Date(profile.lastLogin).toLocaleString()}
                    </p>
                  )}
                </div>
                <Badge tone="teal">Active</Badge>
              </div>

              <div className="text-xs text-ink-500 dark:text-ink-400 mt-2 bg-ink-50 dark:bg-ink-950 p-3 rounded-lg leading-relaxed">
                ℹ️ To secure your account, you can revoke access from this device at any time. This will clear the session refresh tokens and log you out.
              </div>

              <div className="flex gap-3 mt-4">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setShowSessionModal(false)}
                >
                  Close
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  className="flex-1"
                  onClick={handleLogout}
                >
                  Revoke &amp; Logout
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </AppShell>
  );
}
