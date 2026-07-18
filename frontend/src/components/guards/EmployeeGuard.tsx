"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/src/context/SessionContext';

export default function EmployeeGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth/login');
      } else if (user.role !== 'EMPLOYEE') {
        router.push('/admin/dashboard');
      }
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'EMPLOYEE') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <span className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">
            Loading...
          </span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
