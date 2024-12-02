"use client";

import { useRouter } from 'next/navigation';
import { 
  IconClipboardData, 
  IconLockFilled, 
  IconLogout,
  IconHomeFilled
} from '@tabler/icons-react';
import { Group, Image } from '@mantine/core';
import classes from './DashboardNavbar.module.css';

const data = [
  { label: 'Home', path: '/', icon: IconHomeFilled },
  { label: 'Opportunities', path: '/dashboard/opportunities', icon: IconClipboardData },
  { label: 'Account Settings', path: '/dashboard/accountsettings', icon: IconLockFilled },
];

export function DashboardNavbar({ activePath }: { activePath: string }) {
  const router = useRouter();

  const handleLogout = () => {
    // Clear the local storage to remove user authentication data
    localStorage.clear();

    // Navigate to the homepage
    router.push('/');
    // Optionally, reload the window to ensure the state is refreshed
    window.location.reload();
  };

  const links = data.map((item) => (
    <a
      className={classes.link}
      data-active={item.path === activePath || undefined}
      href="#"
      key={item.label}
      onClick={(event) => {
        event.preventDefault();
        router.push(item.path);
      }}
    >
      <item.icon className={classes.linkIcon} stroke={1.5} />
      <span>{item.label}</span>
    </a>
  ));

  return (
    <nav className={classes.navbar}>
      <div className={classes.navbarMain}>
        <Group className={classes.header} justify="center">
          <Image src="/wtp-nobg.png" alt="WTP Logo" width={120} height={40} />
        </Group>
        {links}
      </div>
      <div className={classes.footer}>
        <a
          href="#"
          className={classes.link}
          onClick={(event) => {
            event.preventDefault();
            handleLogout();
          }}
        >
          <IconLogout className={classes.linkIcon} stroke={1.5} />
          <span>Logout</span>
        </a>
      </div>
    </nav>
  );
}
