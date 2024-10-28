/*
My opportunities (owner)
My Feedback (participant)
Account (change password)
*/

'use client';

import { useState } from 'react';
import { Accordion, Center, Stack, PasswordInput, TextInput, Button } from '@mantine/core';
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
    rating: number;
}

type Opp = {
    name: string;
    customer_segment: string;
    label: string;
    participants: number;
};

export default function Dashboard() {
    const [passLoading, setPassLoading] = useState(false);
    const [passError, setPassError] = useState<string | null>(null); // To handle errors
    const [mailLoading, setMailLoading] = useState(false);
    const [mailError, setMailError] = useState<string | null>(null); // To handle errors
    const [ownerOpps, setOwnerOpps] = useState<Opp[]>([]);
    const [queryFetched, setQueryFetched] = useState<boolean>(false);
    const router = useRouter();

    const getOpportunities = async () => {
        if (typeof window === 'undefined') return;
        const TOKEN = localStorage.getItem('accessToken');
        await axios
            .get('http://localhost:8000/api/query/owneropps/', {
              headers: {
                AUTHORIZATION: `Bearer ${TOKEN}`,
              },
            })
            .then(res => {
                console.log(res);
                setOwnerOpps([...ownerOpps, ...res.data]);
            })
            .catch(error => {
              console.log(error);
            });
    };

    if (typeof window !== 'undefined' && !localStorage.getItem('accessToken')) {
        router.push('/login');
    }

    if (!queryFetched) {
        getOpportunities();
        setQueryFetched(true);
    }

    const OpportunitySummary: React.FC<OppProps> =
      ({ id, label, segment, curStatus, parts, rating }) => (
        <Accordion.Item key={id} value={label}>
            <Accordion.Control>{label}</Accordion.Control>
            <Accordion.Panel>
                <p>{segment}</p>
                <p>{curStatus}</p>
                <p>{parts} participant{parts === 1 ? '' : 's'}</p>
                <p>{rating}/5</p>
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
        setMailLoading(true);
        setMailError(null);

        try {
            const response = await axios.post('http://localhost:8000/api/change/email/', {
                newEmail: values.newEmail,
            }, {
                headers: {
                    AUTHORIZATION: `Bearer ${TOKEN}`,
                },
            });

            if (response.status === 200) {
                mailForm.reset();
                toast.success('Email changed');
                console.log('success');
            }
        } catch (error) {
            console.error(error);
            if (axios.isAxiosError(error) && error.response) {
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
        setPassLoading(true);
        setPassError(null);

        try {
            const response = await axios.post('http://localhost:8000/api/change/password/', {
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
            console.error(error);
            if (axios.isAxiosError(error) && error.response) {
                setPassError(error.response.data.message || 'Something went wrong');
            } else {
                setPassError('Password could not be changed');
            }
        } finally {
            setPassLoading(false);
        }
    };

    const changeEmailForm = () =>
        <form onSubmit={mailForm.onSubmit((values) => mailSubmit(values))}>
            <Stack spacing="md">
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

    return (
        <>
            <Toaster />
            <Center>
                <Stack>
                    <h1>My Opportunities</h1>
                    <Accordion>
                        {ownerOpps.map((opp, i) => (
                            <div key={i}>
                              <OpportunitySummary
                                id={i}
                                label={opp.name}
                                segment={opp.customer_segment}
                                curStatus={opp.label}
                                parts={opp.participants}
                                rating={1.3} />
                            </div>
                        ))}
                    </Accordion>
                    <h1>My Feedback</h1>
                    <Accordion>
                        <OpportunitySummary id={4} label="Reverse Bike" segment="Commuters" curStatus="Keep Open" parts={5} rating={2.6} />
                        <OpportunitySummary id={5} label="Butter Stick" segment="City Dwellers" curStatus="Pursue" parts={4} rating={3.9} />
                    </Accordion>
                    <h1>Change Email</h1>
                    <p>Current email is: test@test.com</p>
                    {changeEmailForm()}
                    <h1>Change Password</h1>
                    {changePasswordForm()}
                </Stack>
            </Center>
        </>
    );
}
