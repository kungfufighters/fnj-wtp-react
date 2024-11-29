/*
My opportunities (owner)
My Feedback (participant)
Account (change password)
*/

'use client';

import { useState } from 'react';
import { Accordion, Center, Stack, PasswordInput, TextInput, Button, Collapse, Anchor, Group } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import { HeaderSimple } from '@/components/Header/Header';

interface OppProps {
    id: number;
    label: string;
    segment: string;
    curStatus: string;
    parts: number;
    ratingP: number;
    ratingC: number;
}

type Opp = {
    name: string;
    customer_segment: string;
    label: string;
    participants: number;
    scoreP: number;
    scoreC: number;
};

type Workspace = {
    name: string;
    code: number;
    opportunities: Opp[];
    display: boolean;
};

const spaceprops = {
    spacing: 'md',
};

export default function Dashboard() {
    const [passLoading, setPassLoading] = useState(false);
    const [passError, setPassError] = useState<string | null>(null); // To handle errors
    const [mailLoading, setMailLoading] = useState(false);
    const [mailError, setMailError] = useState<string | null>(null); // To handle errors
    const [ownerWorks, setOwnerWorks] = useState<Workspace[]>([]);
    const [oppQueryFetched, setOppQueryFetched] = useState<boolean>(false);
    const [mailQueryFetched, setMailQueryFetched] = useState<boolean>(false);
    const [email, setEmail] = useState<string>('Loading...');
    const router = useRouter();

    const getOpportunities = async () => {
       // if (typeof window === 'undefined') return;
        const TOKEN = localStorage.getItem('accessToken');
        const RefreshToken = localStorage.getItem('refreshToken');

        const successLogic = (res : any) => {
            console.log(res);
            const workspaces = res.data;
            const newWorks: Workspace[] = [];
            workspaces.forEach((workspace: any[]) => {
                    newWorks.push(
                        {
                            name: workspace[0],
                            code: workspace[1],
                            opportunities: workspace[2],
                            display: false,
                        }
                    );
            });
            setOwnerWorks(newWorks);
            console.log(newWorks);
        };

        await axios
            .get('https://wheretoplay-6af95d3b28f7.herokuapp.com/api/query/owneropps/', {
              headers: {
                AUTHORIZATION: `Bearer ${TOKEN}`,
              },
            })
            .then(successLogic)
            .catch(async error => {
              console.log(error);
              if (
                axios.isAxiosError(error) &&
                error.response &&
                error.response.status === 401 &&
                RefreshToken
              ) {
                try {
                    const refreshResponse = await axios.post('https://wheretoplay-6af95d3b28f7.herokuapp.com/api/token/refresh/', {
                        refresh: RefreshToken,
                    });

                    localStorage.setItem('accessToken', refreshResponse.data.access);

                    await axios
                        .get('https://wheretoplay-6af95d3b28f7.herokuapp.com/api/query/owneropps/', {
                        headers: {
                            AUTHORIZATION: `Bearer ${refreshResponse.data.access}`,
                        },
                        })
                        .then(successLogic);
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
    };

    const getEmail = async () => {
        if (typeof window === 'undefined') return;
        const TOKEN = localStorage.getItem('accessToken');
        const RefreshToken = localStorage.getItem('refreshToken');

        await axios
            .get('https://wheretoplay-6af95d3b28f7.herokuapp.com/api/query/email/', {
              headers: {
                AUTHORIZATION: `Bearer ${TOKEN}`,
              },
            })
            .then(res => {
                console.log(res);
                setEmail(res.data.email);
            })
            .catch(async error => {
              console.log(error);
              if (
                axios.isAxiosError(error) &&
                error.response &&
                error.response.status === 401 &&
                RefreshToken
              ) {
                try {
                    const refreshResponse = await axios.post('https://wheretoplay-6af95d3b28f7.herokuapp.com/api/token/refresh/', {
                        refresh: RefreshToken,
                    });

                    localStorage.setItem('accessToken', refreshResponse.data.access);

                    await axios
                        .get('https://wheretoplay-6af95d3b28f7.herokuapp.com/api/query/email/', {
                        headers: {
                            AUTHORIZATION: `Bearer ${refreshResponse.data.access}`,
                        },
                        })
                        .then(res => {
                            console.log(res);
                            setEmail(res.data.email);
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
    };

    if (!localStorage.getItem('accessToken')) {
        router.push('/login');
    }

    if (!oppQueryFetched) {
        getOpportunities();
        setOppQueryFetched(true);
    }

    if (!mailQueryFetched) {
        getEmail();
        setMailQueryFetched(true);
    }

    const OpportunitySummary: React.FC<OppProps> =
      ({ id, label, segment, curStatus, parts, ratingP, ratingC }) => (
        <Accordion.Item key={id} value={`${id}`}>
            <Accordion.Control>{label}</Accordion.Control>
            <Accordion.Panel>
                <p>{segment}</p>
                <p>{curStatus}</p>
                <p>{parts} participant{parts === 1 ? '' : 's'}</p>
                <p>Potential: {ratingP === 0 ? 'N/A' : `${ratingP}/5`}</p>
                <p>Challenge: {ratingC === 0 ? 'N/A' : `${ratingC}/5`}</p>
            </Accordion.Panel>
        </Accordion.Item>
    );

    const mailForm = useForm({
        initialValues: {
            newEmail: '',
        },

        validate: {
            newEmail: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
        },
    });

    const passForm = useForm({
        initialValues: {
            currentPassword: '',
            newPassword: '',
            confirmNewPassword: '',
        },

        validate: {
            newPassword: (value) =>
                value.length >= 6 ? null : 'Password must be at least 6 characters long',
            confirmNewPassword: (value, values) =>
                value === values.newPassword ? null : 'Passwords do not match',
        },
    });

    const mailSubmit = async (values: typeof mailForm.values) => {
        if (typeof window === 'undefined') return;
        const TOKEN = localStorage.getItem('accessToken');
        const RefreshToken = localStorage.getItem('refreshToken');
        setMailLoading(true);
        setMailError(null);

        try {
            const response = await axios.post('https://wheretoplay-6af95d3b28f7.herokuapp.com/api/change/email/', {
                newEmail: values.newEmail,
            }, {
                headers: {
                    AUTHORIZATION: `Bearer ${TOKEN}`,
                },
            });

            if (response.status === 200) {
                setEmail(mailForm.values.newEmail);
                mailForm.reset();
                toast.success('Email changed');
                console.log('success');
            }
        } catch (error) {
          if (
            axios.isAxiosError(error) &&
            error.response &&
            error.response.status === 401 &&
            RefreshToken
          ) {
            try {
                const refreshResponse = await axios.post('https://wheretoplay-6af95d3b28f7.herokuapp.com/api/token/refresh/', {
                    refresh: RefreshToken,
                });

                localStorage.setItem('accessToken', refreshResponse.data.access);

                const response = await axios
                    .post('https://wheretoplay-6af95d3b28f7.herokuapp.com/api/change/email/', {
                        newEmail: values.newEmail,
                    }, { headers: {
                        AUTHORIZATION: `Bearer ${refreshResponse.data.access}`,
                    },
                    });

                    if (response.status === 200) {
                        setEmail(mailForm.values.newEmail);
                        mailForm.reset();
                        toast.success('Email changed');
                        console.log('success');
                    }
            } catch (refreshError : any) {
                        if (refreshError.response && refreshError.response.status === 401) {
                              console.log('Refresh token expired. Redirecting to login.');
                              localStorage.removeItem('accessToken');
                              localStorage.removeItem('refreshToken');
                              router.push('/login');
                            } else if (axios.isAxiosError(error) && error.response) {
                                    setMailError(error.response.data.message || 'Something went wrong');
                                } else {
                                    setMailError('Email could not be changed');
                                }
            }
            } else if (axios.isAxiosError(error) && error.response) {
                setMailError(error.response.data.message || 'Something went wrong');
            } else {
                setMailError('Email could not be changed');
            }
            } finally {
            setMailLoading(false);
        }
    };

    const passSubmit = async (values: typeof passForm.values) => {
        if (typeof window === 'undefined') return;
        const TOKEN = localStorage.getItem('accessToken');
        const RefreshToken = localStorage.getItem('refreshToken');
        setPassLoading(true);
        setPassError(null);

        try {
            const response = await axios.post('https://wheretoplay-6af95d3b28f7.herokuapp.com/api/change/password/', {
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
                confirmNewPassword: values.confirmNewPassword,
            }, {
                headers: {
                    AUTHORIZATION: `Bearer ${TOKEN}`,
                },
            });

            if (response.status === 200) {
                passForm.reset();
                toast.success('Password changed');
                console.log('success');
            } else setPassError(response.data.error);
        } catch (error) {
            if (
                axios.isAxiosError(error) &&
                error.response &&
                error.response.status === 401 &&
                RefreshToken
              ) {
                try {
                    const refreshResponse = await axios.post('https://wheretoplay-6af95d3b28f7.herokuapp.com/api/token/refresh/', {
                        refresh: RefreshToken,
                    });
                    localStorage.setItem('accessToken', refreshResponse.data.access);
                    const response = await axios
                        .get('https://wheretoplay-6af95d3b28f7.herokuapp.com/api/change/password/', {
                        headers: {
                            AUTHORIZATION: `Bearer ${refreshResponse.data.access}`,
                        },
                        });
                        if (response.status === 200) {
                            setEmail(mailForm.values.newEmail);
                            mailForm.reset();
                            toast.success('Email changed');
                            console.log('success');
                        }
                } catch (refreshError : any) {
                            if (refreshError.response && refreshError.response.status === 401) {
                                console.log('Refresh token expired. Redirecting to login.');
                                localStorage.removeItem('accessToken');
                                localStorage.removeItem('refreshToken');
                                router.push('/login');
                            }
                            else {
                                console.error(error);
                                if (axios.isAxiosError(error) && error.response) {
                                    setPassError(error.response.data.message || 'Something went wrong');
                                } else {
                                    setPassError('Password could not be changed');
                                }
                            }
                        }
                    } else {
                        console.error(error);
                        if (axios.isAxiosError(error) && error.response) {
                            setPassError(error.response.data.message || 'Something went wrong');
                        } else {
                            setPassError('Password could not be changed');
                        }
                      }
                }
        setPassLoading(false);
    };

    const changeEmailForm = () =>
        <form onSubmit={mailForm.onSubmit((values) => mailSubmit(values))}>
            <Stack {...spaceprops}>
                <TextInput
                  label="New Email"
                  placeholder="you@example.com"
                  withAsterisk
                  {...mailForm.getInputProps('newEmail')}
                        />

                {mailError && <p style={{ color: 'red' }}>{mailError}</p>} {/* Display error message */}

                <Button type="submit" loading={mailLoading}>
                    {mailLoading ? 'Changing Email...' : 'Change Email'}
                </Button>
            </Stack>
        </form>;

    const changePasswordForm = () =>
        <form onSubmit={passForm.onSubmit((values) => passSubmit(values))}>
            <Stack {...spaceprops}>
                <PasswordInput
                  label="Current Password"
                  placeholder="Your current password"
                  withAsterisk
                  {...passForm.getInputProps('currentPassword')}
                        />

                <PasswordInput
                  label="New Password"
                  placeholder="Your new password"
                  withAsterisk
                  {...passForm.getInputProps('newPassword')}
                        />

                <PasswordInput
                  label="Password"
                  placeholder="Confirm your new password"
                  withAsterisk
                  {...passForm.getInputProps('confirmNewPassword')}
                        />

                {passError && <p style={{ color: 'red' }}>{passError}</p>} {/* Display error message */}

                <Button type="submit" loading={passLoading}>
                    {passLoading ? 'Changing Password...' : 'Change Password'}
                </Button>
            </Stack>
        </form>;

    const toggleDisplay = (i : number) => {
        const newWorks = [...ownerWorks];
        newWorks[i].display = !newWorks[i].display;
        setOwnerWorks(newWorks);
    };

    return (
        <>
        <HeaderSimple glowIndex={1} />
            <Toaster />
            <Center>
                <Stack>
                    <h1>My Workspaces</h1>
                    {oppQueryFetched ?
                    (
                        <>
                        {ownerWorks.length > 0 && ownerWorks.map((work, i) => (
                            <div key={i}>
                                <Group justify="center" mb={5}>
                                    <Button onClick={() => toggleDisplay(i)}>{work.name}</Button>
                                </Group>
                                <Collapse in={work.display}>
                                    <Center>
                                        <Anchor href={`/results/${work.code}`} underline="always">
                                            View Full Results
                                        </Anchor>
                                    </Center>
                                    <Accordion>
                                        {work.opportunities.map((opp, j) => (
                                            <div key={j}>
                                            <OpportunitySummary
                                              id={j}
                                              label={opp.name}
                                              segment={opp.customer_segment}
                                              curStatus={opp.label}
                                              parts={opp.participants}
                                              ratingP={Math.floor(opp.scoreP * 100) / 100}
                                              ratingC={Math.floor(opp.scoreC * 100) / 100} />
                                            </div>
                                        ))}
                                    </Accordion>
                                </Collapse>
                            </div>
                        ))}
                        {ownerWorks.length === 0 && <p>You have no workspaces...</p>}
                        </>
                    ) :
                    (
                        <p>Loading...</p>
                    )}
                    {/*
                    <h1>My Feedback</h1>
                    <Box maw={400} mx="auto">
                        <Group justify="center" mb={5}>
                            <Button onClick={() => toggleDisplay(1)}>Good Ideas Workspace</Button>
                        </Group>
                        <Collapse in={false}>
                        <Accordion>
                            <OpportunitySummary id={4} label="Reverse Bike" segment="Commuters" curStatus="Keep Open" parts={5} rating={2.6} />
                            <OpportunitySummary id={5} label="Butter Stick" segment="City Dwellers" curStatus="Pursue" parts={4} rating={3.9} />
                        </Accordion>
                    </Collapse>
                    </Box>
                    */}
                    <h1>Change Email</h1>
                    <p>Current email is: {email}</p>
                    {changeEmailForm()}
                    <h1>Change Password</h1>
                    {changePasswordForm()}
                </Stack>
            </Center>
        </>
    );
}
