import cx from 'clsx';
import { useState } from 'react';
// import NextImage from 'next/image';
import { Container, Group, Burger, Menu, UnstyledButton, Text, Avatar} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import classes from './Header.module.css';
import toast, { Toaster } from 'react-hot-toast';

const links = [
  { link: '../', label: 'Session' },
  { link: '/dashboard', label: 'Dashboard' },
  { link: '/create', label: 'Create a Workspace'}
];

export function HeaderSimple({ glowIndex } : any) {
  const router = useRouter();
  const [opened, { toggle }] = useDisclosure(false);
  const [userMenuOpened, setUserMenuOpened] = useState(false);
  const [active, setActive] = useState(links[glowIndex]?.link || '');
  const [accountLabel, setAccountLabel] = useState('');
  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  const handleDelete = async () => {
    var confirm : boolean = window.confirm("Are you sure you want to delete your account?")
    if(!confirm)
        return;
    const TOKEN = localStorage.getItem('accessToken');
    const response = await axios.post('http://localhost:8000/api/delete_user/', {}, {
        headers: {
            AUTHORIZATION: `Bearer ${TOKEN}`,
        },
    });
    if(response.status == 200) {
      toast.success('Success! Hang Tight...');
      await new Promise(resolve => setTimeout(resolve, 2000) );
      handleLogout();
    }
    else console.log(response.data.error);
  }

  const getEmail = async () => {
    if (localStorage.getItem('accessToken')) {
        const TOKEN = localStorage.getItem('accessToken');
        const RefreshToken = localStorage.getItem('refreshToken');
        await axios
            .get('http://localhost:8000/api/query/email/', {
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
                    const refreshResponse = await axios.post('http://localhost:8000/api/token/refresh/', {
                        refresh: RefreshToken,
                    });

                    localStorage.setItem('accessToken', refreshResponse.data.access);

                    await axios
                        .get('http://localhost:8000/api/query/email/', {
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
    name: accountLabel,
    image: '',
  };

  const items = links.map((link) => (
    <a
      key={link.label}
      href={link.link}
      className={classes.link}
      data-active={active === link.link || undefined}
      onClick={(event) => {
        setActive(link.link);
      }}
    >
      {link.label}
    </a>
  ));

  return (
    <header className={classes.header}>
        <Toaster />
        <Container className={classes.mainSection} size="md">
        <Group justify="space-between">          
        <img src={new URL('../../public/wtp.png', import.meta.url).href} alt="Logo" height={40} />
          <Burger opened={opened} onClick={toggle} hiddenFrom="xs" size="sm" />

          <Menu
            width={260}
            position="center"
            transitionProps={{ transition: 'pop-top-right' }}
            onClose={() => setUserMenuOpened(false)}
            onOpen={() => setUserMenuOpened(true)}
            withinPortal
          >
            <Menu.Target>
              <UnstyledButton
                className={cx(classes.user, { [classes.userActive]: userMenuOpened })}
              >
                <Group gap={7}>
                  <Avatar src={user.image} alt={user.name} radius="xl" size={20} />
                  <Text fw={500} size="sm" lh={1} mr={3}>
                    {user.name}
                  </Text>
                </Group>
              </UnstyledButton>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item onClick={handleLogout}>
                Logout
              </Menu.Item>

              <Menu.Divider />

              <Menu.Label>Danger zone</Menu.Label>

              <Menu.Item 
                color="red"
                onClick={handleDelete}
              >
                Delete account
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
        </Container>
      <Container size="md" className={classes.inner}>
        <Group gap={5} visibleFrom="xs" ml="auto">
          {items}
        </Group>

        <Burger opened={opened} onClick={toggle} hiddenFrom="xs" size="sm" />
      </Container>
        
    </header>
  );
}