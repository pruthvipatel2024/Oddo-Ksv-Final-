"use client";

import React from 'react';
import { Bell, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  priority: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';
  read: boolean;
  createdAt: string;
}

interface NotificationsCardProps {
  notifications: NotificationItem[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

export default function NotificationsCard({
  notifications,
  onMarkRead,
  onMarkAllRead
}: NotificationsCardProps) {
  const getPriorityStyles = (p: string) => {
    switch (p) {
      case 'SUCCESS':
        return { bg: 'bg-emerald-50 dark:bg-emerald-950/20', border: 'border-emerald-100 dark:border-emerald-900/30', icon: <CheckCircle className="h-4 w-4 text-emerald-500" /> };
      case 'WARNING':
        return { bg: 'bg-amber-50 dark:bg-amber-950/20', border: 'border-amber-100 dark:border-amber-900/30', icon: <AlertTriangle className="h-4 w-4 text-amber-500" /> };
      case 'ERROR':
        return { bg: 'bg-red-50 dark:bg-red-950/20', border: 'border-red-100 dark:border-red-900/30', icon: <XCircle className="h-4 w-4 text-red-500" /> };
      default:
        return { bg: 'bg-indigo-50 dark:bg-indigo-950/20', border: 'border-indigo-100 dark:border-indigo-900/30', icon: <Info className="h-4 w-4 text-indigo-500" /> };
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="rounded-2xl border border-zinc-150 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Bell className="h-5 w-5 text-indigo-650" />
          <span>Notifications</span>
          {unreadCount > 0 && (
            <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-extrabold text-white">
              {unreadCount}
            </span>
          )}
        </h2>

        {unreadCount > 0 && (
          <button
            onClick={onMarkAllRead}
            className="text-[10px] font-bold text-indigo-600 hover:text-indigo-850 dark:text-indigo-400 cursor-pointer"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="mt-5 space-y-3 max-h-60 overflow-y-auto pr-1">
        {notifications.length === 0 ? (
          <p className="text-xs text-zinc-400 text-center py-4">No notifications yet.</p>
        ) : (
          notifications.map((n) => {
            const styles = getPriorityStyles(n.priority);
            return (
              <div
                key={n.id}
                onClick={() => !n.read && onMarkRead(n.id)}
                className={`flex gap-3 rounded-xl border p-3 cursor-pointer transition-all hover:scale-[1.01] ${styles.bg} ${styles.border} ${
                  !n.read ? 'ring-2 ring-indigo-500/20' : 'opacity-70'
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">{styles.icon}</div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{n.title}</h4>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">{n.body}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
