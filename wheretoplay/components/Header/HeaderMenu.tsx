'use client';

import { useState, useEffect } from 'react';
import {
  Burger,
  Container,
  Group,
  Menu,
  Text,
  Avatar,
  UnstyledButton,
  Drawer,
  Stack,
} from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { useRouter, usePathname } from 'next/navigation';
import axios from 'axios';
import classes from './HeaderMenu.module.css';

const links = [
  { link: '/dashboard', label: 'Dashboard' },
  { link: '/create', label: 'Create a Workspace' },
];

export function HeaderMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const [opened, { toggle, close }] = useDisclosure(false);
  const [userMenuOpened, setUserMenuOpened] = useState(false);
  const [accountLabel, setAccountLabel] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [active, setActive] = useState(pathname);

  const fetchUserDetails = async () => {
    const TOKEN = localStorage.getItem('accessToken');
    if (TOKEN) {
      try {
        const response = await axios.get('http://localhost:8000/api/query/email/', {
          headers: { Authorization: `Bearer ${TOKEN}` },
        });
        setAccountLabel(response.data.email);
        setIsLoggedIn(true);
      } catch (error) {
        console.error(error);
        setIsLoggedIn(false);
      }
    } else {
      setIsLoggedIn(false);
    }
  };

  const forceRefresh = () => {
    fetchUserDetails();
  };

  useEffect(() => {
    fetchUserDetails();

    const handleLoginEvent = () => {
      forceRefresh();
    };

    window.addEventListener('storage', handleLoginEvent);

    return () => {
      window.removeEventListener('storage', handleLoginEvent);
    };
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
    window.location.reload();
  };

  const user = {
    name: accountLabel || 'Guest',
    image: '',
  };

  const items = links.map((link) => (
    <a
      key={link.label}
      href={link.link}
      className={`${classes.link} ${active === link.link ? classes.active : ''}`}
      onClick={(event) => {
        event.preventDefault();
        setActive(link.link);
        router.push(link.link);
        close();
      }}
    >
      {link.label}
    </a>
  ));

  return (
    <header className={classes.header}>
      <Container size="md">
        <div className={classes.inner}>
          {/* Left Section: Logo */}
          <Group
            align="center"
            onClick={() => {
              setActive('');
              router.push('/');
            }}
            style={{ cursor: 'pointer' }}
          >
            <img
              src={new URL('../../public/wtp.png', import.meta.url).href}
              alt="Logo"
              height={40}
              className={classes.logo}
            />
            <Text size="lg" fw={700}>
              Where-to-Play
            </Text>
          </Group>

          {/* Right Section: Navigation Links + User Menu */}
          <Group gap="md" style={{ marginLeft: 'auto' }}>
            <Group gap="lg" visibleFrom="sm">
              {items}
            </Group>

            {/* User Menu */}
            <Menu
              width={200}
              position="bottom-end"
              transitionProps={{ transition: 'pop-top-right' }}
              onClose={() => setUserMenuOpened(false)}
              onOpen={() => setUserMenuOpened(true)}
              withinPortal
            >
              <Menu.Target>
                <UnstyledButton>
                  <Group gap={7} align="center">
                    <Avatar src={user.image} alt={user.name} radius="xl" size={30} />
                    <Text fw={500} size="sm" lh={1} mr={3}>
                      {user.name}
                    </Text>
                    <IconChevronDown size={14} stroke={1.5} />
                  </Group>
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                {isLoggedIn ? (
                  <Menu.Item onClick={handleLogout}>Logout</Menu.Item>
                ) : (
                  <Menu.Item onClick={() => router.push('/login')}>Login</Menu.Item>
                )}
              </Menu.Dropdown>
            </Menu>

            {/* Burger Menu for Small Screens */}
            <Burger opened={opened} onClick={toggle} size="sm" hiddenFrom="sm" />
          </Group>
        </div>

        {/* Mobile Drawer */}
        <Drawer
          opened={opened}
          onClose={close}
          title="Menu"
          padding="md"
          size="sm"
          overlayProps={{
            opacity: 0.55,
            blur: 3,
          }}
        >
          <Stack>{items}</Stack>
        </Drawer>
      </Container>
    </header>
  );
}
