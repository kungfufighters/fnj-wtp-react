/*
My opportunities (owner)
My Feedback (participant)
Account (change password)
*/

'use client';

import { useState } from 'react';
import { Accordion, Center, Stack, PasswordInput, TextInput, Button } from '@mantine/core';
import { useForm } from '@mantine/form';

interface OppProps {
    id: number;
    label: string;
    segment: string;
    curStatus: string;
    parts: number;
    rating: number;
}

export default function Dashboard() {
    const [passLoading, setPassLoading] = useState(false);
    const [passError, setPassError] = useState<string | null>(null); // To handle errors
    const [mailLoading, setMailLoading] = useState(false);
    const [mailError, setMailError] = useState<string | null>(null); // To handle errors

    const OpportunitySummary: React.FC<OppProps> =
      ({ id, label, segment, curStatus, parts, rating }) => (
        <Accordion.Item key={id} value={label}>
            <Accordion.Control>{label}</Accordion.Control>
            <Accordion.Panel>
                <p>{segment}</p>
                <p>{curStatus}</p>
                <p>{parts} participants</p>
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

    // TO BE IMPLEMENTED, error and loading state will be changed here
    const mailSubmit = async (values: typeof mailForm.values) =>
        values;

    // TO BE IMPLEMENTED, error and loading state will be changed here
    const passSubmit = async (values: typeof passForm.values) =>
        values;

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
            <Center>
                <Stack>
                    <h1>My Opportunities</h1>
                    <Accordion>
                        <OpportunitySummary id={1} label="Butter Stick" segment="Suburbanites" curStatus="Shelve" parts={7} rating={1.3} />
                    </Accordion>
                    <h1>My Feedback</h1>
                    <Accordion>
                        <OpportunitySummary id={3} label="Reverse Bike" segment="Commuters" curStatus="Keep Open" parts={5} rating={2.6} />
                        <OpportunitySummary id={3} label="Butter Stick" segment="City Dwellers" curStatus="Pursue" parts={4} rating={3.9} />
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
