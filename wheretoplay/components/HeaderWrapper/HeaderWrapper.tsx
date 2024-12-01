"use client";

import React from 'react';
import { HeaderMenu } from '../Header/HeaderMenu';
import { usePathname } from 'next/navigation';

export default function HeaderWrapper() {
  const pathname = usePathname();

  // Conditionally render the header based on the path
  if (pathname.startsWith('/dashboard')) {
    return null; // Don't render header for /dashboard or any of its subpages
  }

  return <HeaderMenu />;
}
