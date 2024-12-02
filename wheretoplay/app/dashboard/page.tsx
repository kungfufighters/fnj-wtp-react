'use client';

import { useState, useEffect } from 'react';
import { Accordion, Center, Stack, PasswordInput, TextInput, Button, Collapse, Anchor, Group } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';

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

export default function Dashboard() {
    const [passLoading, setPassLoading] = useState(false);
    const [passError, setPassError] = useState<string | null>(null);
    const [mailLoading, setMailLoading] = useState(false);
    const [mailError, setMailError] = useState<string | null>(null);
    const [ownerWorks, setOwnerWorks] = useState<Workspace[]>([]);
    const [oppQueryFetched, setOppQueryFetched] = useState<boolean>(false);
    const [mailQueryFetched, setMailQueryFetched] = useState<boolean>(false);
    const [email, setEmail] = useState<string>('Loading...');
    const router = useRouter();

    useEffect(() => {
        if (typeof window !== 'undefined' && !localStorage.getItem('accessToken')) {
            localStorage.setItem(
                'redirectNotification',
                JSON.stringify({
                    title: 'Unauthorized Access',
                    message: 'Please log in to access the dashboard.',
                    color: 'red',
                })
            );
            router.push('/login');
        }
    }, [router]);

    const getOpportunities = async () => {
        const TOKEN = localStorage.getItem('accessToken');
        const RefreshToken = localStorage.getItem('refreshToken');

        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/query/owneropps/`, {
                headers: {
                    AUTHORIZATION: `Bearer ${TOKEN}`,
                },
            });

            const workspaces = res.data;
            const newWorks: Workspace[] = workspaces.map((workspace: any[]) => ({
                name: workspace[0],
                code: workspace[1],
                opportunities: workspace[2],
                display: false,
            }));
            setOwnerWorks(newWorks);
        } catch (error) {
            if (
                axios.isAxiosError(error) &&
                error.response?.status === 401 &&
                RefreshToken
            ) {
                try {
                    const refreshResponse = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/token/refresh/`, {
                        refresh: RefreshToken,
                    });

                    localStorage.setItem('accessToken', refreshResponse.data.access);

                    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/query/owneropps/`, {
                        headers: {
                            AUTHORIZATION: `Bearer ${refreshResponse.data.access}`,
                        },
                    });

                    const workspaces = res.data;
                    const newWorks: Workspace[] = workspaces.map((workspace: any[]) => ({
                        name: workspace[0],
                        code: workspace[1],
                        opportunities: workspace[2],
                        display: false,
                    }));
                    setOwnerWorks(newWorks);
                } catch (refreshError) {
                    console.error(refreshError);
                    if (axios.isAxiosError(refreshError) && refreshError.response?.status === 401) {
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('refreshToken');
                        router.push('/login');
                    }
                }
            }
        }
    };

    const getEmail = async () => {
        const TOKEN = localStorage.getItem('accessToken');
        const RefreshToken = localStorage.getItem('refreshToken');

        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/query/email/`, {
                headers: {
                    AUTHORIZATION: `Bearer ${TOKEN}`,
                },
            });
            setEmail(res.data.email);
        } catch (error) {
            if (
                axios.isAxiosError(error) &&
                error.response?.status === 401 &&
                RefreshToken
            ) {
                try {
                    const refreshResponse = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/token/refresh/`, {
                        refresh: RefreshToken,
                    });

                    localStorage.setItem('accessToken', refreshResponse.data.access);

                    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/query/email/`, {
                        headers: {
                            AUTHORIZATION: `Bearer ${refreshResponse.data.access}`,
                        },
                    });
                    setEmail(res.data.email);
                } catch (refreshError) {
                    console.error(refreshError);
                    if (axios.isAxiosError(refreshError) && refreshError.response?.status === 401) {
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('refreshToken');
                        router.push('/login');
                    }
                }
            }
        }
    };

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
        const TOKEN = localStorage.getItem('accessToken');
        const RefreshToken = localStorage.getItem('refreshToken');
        setMailLoading(true);
        setMailError(null);

        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/change/email/`, {
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
            }
        } catch (error) {
            console.error(error);
            setMailError('Could not update email. Please try again.');
        } finally {
            setMailLoading(false);
        }
    };

    const passSubmit = async (values: typeof passForm.values) => {
        const TOKEN = localStorage.getItem('accessToken');
        const RefreshToken = localStorage.getItem('refreshToken');
        setPassLoading(true);
        setPassError(null);

        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/change/password/`, {
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
            }
        } catch (error) {
            console.error(error);
            setPassError('Could not update password. Please try again.');
        } finally {
            setPassLoading(false);
        }
    };

    useEffect(() => {
        if (!oppQueryFetched) {
            getOpportunities();
            setOppQueryFetched(true);
        }

        if (!mailQueryFetched) {
            getEmail();
            setMailQueryFetched(true);
        }
    }, [oppQueryFetched, mailQueryFetched]);

    const OpportunitySummary: React.FC<OppProps> = ({ id, label, segment, curStatus, parts, ratingP, ratingC }) => (
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

    const toggleDisplay = (i: number) => {
        const newWorks = [...ownerWorks];
        newWorks[i].display = !newWorks[i].display;
        setOwnerWorks(newWorks);
    };

    return (
        <>
            <Toaster />
            <Center>
                <Stack>
                    <h1>My Workspaces</h1>
                    {oppQueryFetched ? (
                        <>
                            {ownerWorks.length > 0 ? (
                                ownerWorks.map((work, i) => (
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
                                                    <OpportunitySummary
                                                        key={j}
                                                        id={j}
                                                        label={opp.name}
                                                        segment={opp.customer_segment}
                                                        curStatus={opp.label}
                                                        parts={opp.participants}
                                                        ratingP={Math.floor(opp.scoreP * 100) / 100}
                                                        ratingC={Math.floor(opp.scoreC * 100) / 100}
                                                    />
                                                ))}
                                            </Accordion>
                                        </Collapse>
                                    </div>
                                ))
                            ) : (
                                <p>You have no workspaces...</p>
                            )}
                        </>
                    ) : (
                        <p>Loading...</p>
                    )}
                    <h1>Change Email</h1>
                    <p>Current email is: {email}</p>
                    <form onSubmit={mailForm.onSubmit((values) => mailSubmit(values))}>
                        <Stack spacing="md">
                            <TextInput
                                label="New Email"
                                placeholder="you@example.com"
                                withAsterisk
                                {...mailForm.getInputProps('newEmail')}
                            />
                            {mailError && <p style={{ color: 'red' }}>{mailError}</p>}
                            <Button type="submit" loading={mailLoading}>
                                {mailLoading ? 'Changing Email...' : 'Change Email'}
                            </Button>
                        </Stack>
                    </form>
                    <h1>Change Password</h1>
                    <form onSubmit={passForm.onSubmit((values) => passSubmit(values))}>
                        <Stack spacing="md">
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
                                label="Confirm New Password"
                                placeholder="Confirm your new password"
                                withAsterisk
                                {...passForm.getInputProps('confirmNewPassword')}
                            />
                            {passError && <p style={{ color: 'red' }}>{passError}</p>}
                            <Button type="submit" loading={passLoading}>
                                {passLoading ? 'Changing Password...' : 'Change Password'}
                            </Button>
                        </Stack>
                    </form>
                </Stack>
            </Center>
        </>
    );
}
