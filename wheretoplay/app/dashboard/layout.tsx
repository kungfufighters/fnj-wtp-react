"use client";

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { DashboardNavbar } from '../../components/DashboardNavbar/DashboardNavbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Check if the user is authenticated
    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
      // Redirect to login page if not authenticated
      router.push('/login');
    }
  }, [router]);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <DashboardNavbar activePath={pathname} />
      <div style={{ flex: 1, padding: '20px', overflow: 'auto' }}>{children}</div>
    </div>
  );
}
