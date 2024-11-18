'use client';

import { useState, useEffect } from 'react';
import { Accordion, Center, Stack, PasswordInput, TextInput, Button, Collapse, Anchor, Group } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { useRouter } from 'next/navigation';
import { HeaderSimple } from '@/components/Header/Header';
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
    const [email, setEmail] = useState<string>('Loading...');
    const router = useRouter();

    useEffect(() => {
        // Redirect to login if no access token
        if (typeof window !== 'undefined' && !localStorage.getItem('accessToken')) {
            router.push('/login');
        }
    }, [router]);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const fetchData = async () => {
            const TOKEN = localStorage.getItem('accessToken');

            try {
                const oppResponse = await axios.get('http://localhost:8000/api/query/owneropps/', {
                    headers: { AUTHORIZATION: `Bearer ${TOKEN}` },
                });

                const workspaces = oppResponse.data;
                const newWorks: Workspace[] = workspaces.map((workspace: any[]) => ({
                    name: workspace[0],
                    code: workspace[1],
                    opportunities: workspace[2],
                    display: false,
                }));

                setOwnerWorks(newWorks);

                const emailResponse = await axios.get('http://localhost:8000/api/query/email/', {
                    headers: { AUTHORIZATION: `Bearer ${TOKEN}` },
                });

                setEmail(emailResponse.data.email);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

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

    const mailForm = useForm({
        initialValues: { newEmail: '' },
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
            newPassword: (value) => (value.length >= 6 ? null : 'Password must be at least 6 characters long'),
            confirmNewPassword: (value, values) =>
                value === values.newPassword ? null : 'Passwords do not match',
        },
    });

    const mailSubmit = async (values: typeof mailForm.values) => {
        if (typeof window === 'undefined') return;
        const TOKEN = localStorage.getItem('accessToken');
        setMailLoading(true);
        setMailError(null);

        try {
            const response = await axios.post(
                'http://localhost:8000/api/change/email/',
                { newEmail: values.newEmail },
                { headers: { AUTHORIZATION: `Bearer ${TOKEN}` } }
            );

            if (response.status === 200) {
                setEmail(mailForm.values.newEmail);
                mailForm.reset();
                toast.success('Email changed');
            }
        } catch (error) {
            console.error(error);
            setMailError('Email could not be changed');
        } finally {
            setMailLoading(false);
        }
    };

    const passSubmit = async (values: typeof passForm.values) => {
        if (typeof window === 'undefined') return;
        const TOKEN = localStorage.getItem('accessToken');
        setPassLoading(true);
        setPassError(null);

        try {
            const response = await axios.post(
                'http://localhost:8000/api/change/password/',
                values,
                { headers: { AUTHORIZATION: `Bearer ${TOKEN}` } }
            );

            if (response.status === 200) {
                passForm.reset();
                toast.success('Password changed');
            }
        } catch (error) {
            console.error(error);
            setPassError('Password could not be changed');
        } finally {
            setPassLoading(false);
        }
    };

    const changeEmailForm = () => (
        <form onSubmit={mailForm.onSubmit((values) => mailSubmit(values))}>
            <Stack spacing="md">
                <TextInput label="New Email" placeholder="you@example.com" withAsterisk {...mailForm.getInputProps('newEmail')} />
                {mailError && <p style={{ color: 'red' }}>{mailError}</p>}
                <Button type="submit" loading={mailLoading}>
                    {mailLoading ? 'Changing Email...' : 'Change Email'}
                </Button>
            </Stack>
        </form>
    );

    const changePasswordForm = () => (
        <form onSubmit={passForm.onSubmit((values) => passSubmit(values))}>
            <Stack spacing="md">
                <PasswordInput label="Current Password" placeholder="Your current password" withAsterisk {...passForm.getInputProps('currentPassword')} />
                <PasswordInput label="New Password" placeholder="Your new password" withAsterisk {...passForm.getInputProps('newPassword')} />
                <PasswordInput label="Password" placeholder="Confirm your new password" withAsterisk {...passForm.getInputProps('confirmNewPassword')} />
                {passError && <p style={{ color: 'red' }}>{passError}</p>}
                <Button type="submit" loading={passLoading}>
                    {passLoading ? 'Changing Password...' : 'Change Password'}
                </Button>
            </Stack>
        </form>
    );

    const toggleDisplay = (i: number) => {
        setOwnerWorks((prev) => {
            const newWorks = [...prev];
            newWorks[i].display = !newWorks[i].display;
            return newWorks;
        });
    };

    return (
        <>
            <HeaderSimple glowIndex={1} />
            <Toaster />
            <Center>
                <Stack>
                    <h1>My Workspaces</h1>
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
                        <p>Loading...</p>
                    )}
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
