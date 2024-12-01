import cx from 'clsx';
import { useState, useEffect } from 'react';
import {
  Container,
  Group,
  Burger,
  Menu,
  UnstyledButton,
  Text,
  Avatar
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import classes from './Header.module.css';
import toast, { Toaster } from 'react-hot-toast';

const links = [
  { link: '/dashboard', label: 'Dashboard' },
  { link: '/create', label: 'Create a Workspace' }
];

export function HeaderSimple({ glowIndex }: any) {
  const router = useRouter();
  const [opened, { toggle }] = useDisclosure(false);
  const [userMenuOpened, setUserMenuOpened] = useState(false);
  const [active, setActive] = useState(links[glowIndex]?.link || '');
  const [accountLabel, setAccountLabel] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };


  const getEmail = async () => {
    if (localStorage.getItem('accessToken')) {
        const TOKEN = localStorage.getItem('accessToken');
        const RefreshToken = localStorage.getItem('refreshToken');
        await axios
            .get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/query/email/`, {
              headers: {
                AUTHORIZATION: `Bearer ${TOKEN}`,
              },
            })
            .then(res => {
                console.log(res);
                setAccountLabel(res.data.email);
            })
            .catch(async error => {
              if (
                axios.isAxiosError(error) &&
                error.response &&
                error.response.status === 401 &&
                RefreshToken
              ) {
                try {
                    const refreshResponse = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/token/refresh/`, {
                        refresh: RefreshToken,
                    });

                    localStorage.setItem('accessToken', refreshResponse.data.access);

                    await axios
                        .get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/query/email/`, {
                        headers: {
                            AUTHORIZATION: `Bearer ${refreshResponse.data.access}`,
                        },
                        })
                        .then(res => {
                            console.log(res);
                            setAccountLabel(res.data.email);
                        });
                } catch (refreshError) {
                            if (axios.isAxiosError(refreshError)) {
                                console.error(
                                  'Failed to refresh token:',
                                  refreshError.response?.data || refreshError.message
                                );
                                if (refreshError.response && refreshError.response.status === 401) {
                                  console.log('Refresh token expired. Redirecting to login.');
                                  localStorage.removeItem('accessToken');
                                  localStorage.removeItem('refreshToken');
                                  router.push('/login');
                                }
                              } else {
                                console.error('An unexpected error occurred:', refreshError);
                              }
                        }
                    }
            });
      }
};

  if (accountLabel === '') getEmail();

  const user = {
    name: accountLabel || 'Guest',
    image: ''
  };

  const items = links.map((link) => (
    <a
      key={link.label}
      href={link.link}
      className={cx(classes.link, { [classes.active]: active === link.link })}
      onClick={() => setActive(link.link)}
    >
      {link.label}
    </a>
  ));

  return (
    <header className={classes.header}>
      <Toaster />
      <Container className={classes.mainSection} size="md">
        <div className={classes.navbar}>
          {/* Logo wrapped with Link */}
          <Link href="/" className={classes.logoContainer}>
            <img
              src={new URL('../../public/wtp.png', import.meta.url).href}
              alt="Logo"
              height={40}
              className={classes.logo}
            />
          </Link>
          {/* Links and user menu on the right */}
          <div className={classes.rightSection}>
            <Group gap={20} className={classes.navLinks}>
              {items}
            </Group>
            <Menu
              width={260}
              position="bottom-end"
              transitionProps={{ transition: 'pop-top-right' }}
              onClose={() => setUserMenuOpened(false)}
              onOpen={() => setUserMenuOpened(true)}
              withinPortal
            >
              <Menu.Target>
                <UnstyledButton
                  className={cx(classes.user, { [classes.userActive]: userMenuOpened })}
                >
                  <Group gap={7} align="center">
                    <Avatar src={user.image} alt={user.name} radius="xl" size={20} />
                    <Text fw={500} size="sm" lh={1} mr={3}>
                      {user.name}
                    </Text>
                  </Group>
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                {isLoggedIn ? (
                  <>
                    <Menu.Item onClick={handleLogout}>Logout</Menu.Item>
                  </>
                ) : (
                  <Menu.Item onClick={() => router.push('/login')}>Login</Menu.Item>
                )}
              </Menu.Dropdown>
            </Menu>
          </div>
        </div>
      </Container>
    </header>
  );
}
